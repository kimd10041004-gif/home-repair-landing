import type {
  CompletedJob,
  Estimate,
  EstimateBreakdown,
  ExtraWork,
  JobStatus,
  RepairRequest,
  ScheduleSlot,
} from './types'
import { calcEstimate, validateEstimate, PLATFORM_FEE_RATE } from './estimate'
import { RequestStore, RequestNotFoundError, type RequestStoreSnapshot } from './store'
import { assertValidDateStr, isValidDateStr } from './date'
import { addSlot, validateSlot } from './schedule'
import { weeklySettlements, type WeeklySettlement } from './settlement'

export class PlatformError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlatformError'
  }
}

export interface StoredEstimate {
  estimate: Estimate
  breakdown: EstimateBreakdown
}

/** localStorage 호환 최소 인터페이스 — 테스트에서는 인메모리 구현을 주입한다 (28-3-01) */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface PlatformSnapshot {
  version: 1
  store: RequestStoreSnapshot
  estimates: Array<[string, StoredEstimate]>
  jobs: CompletedJob[]
  slots: ScheduleSlot[]
  slotSeq: number
  /** 28-7에서 추가 — 구(28-6 이전) 스냅샷에는 없을 수 있다 (28-6-04) */
  extraWorks?: ExtraWork[]
  extraSeq?: number
}

export interface PlatformOptions {
  storage?: StorageLike
  storageKey?: string
}

export type SettlementFilter = 'all' | 'settled' | 'unsettled'

export interface MonthlyReportRow {
  /** YYYY-MM */
  month: string
  jobCount: number
  totalAmount: number
  totalFee: number
  payout: number
  settledPayout: number
  unsettledPayout: number
}

const DEFAULT_STORAGE_KEY = 'banded-platform-v1'

/**
 * 플랫폼 통합 계층 (28-2-03, 28-3-01/02/03): 견적 제출 → 일정 예약 →
 * 시공 완료 → 정산을 하나의 지속되는 상태로 연결한다. 모든 변경은
 * 성공 시 주입된 저장소(storage)에 자동 저장된다.
 */
export class PlatformService {
  readonly store = new RequestStore()
  private estimates = new Map<string, StoredEstimate>()
  private jobs: CompletedJob[] = []
  private slots: ScheduleSlot[] = []
  private slotSeq = 0
  private extraWorks: ExtraWork[] = []
  private extraSeq = 0
  private readonly storage: StorageLike | undefined
  private readonly storageKey: string

  constructor(options: PlatformOptions = {}) {
    this.storage = options.storage
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  }

  /**
   * 저장소에서 상태를 복원한 서비스를 만든다. 저장 데이터가 없거나
   * 손상됐으면 빈 서비스와 restored=false를 반환한다 (조용한 데이터
   * 유실 대신 새로 시작 — 손상 키는 제거).
   */
  static load(options: PlatformOptions = {}): { service: PlatformService; restored: boolean } {
    const service = new PlatformService(options)
    if (!options.storage) return { service, restored: false }
    const key = options.storageKey ?? DEFAULT_STORAGE_KEY
    let raw: string | null = null
    try {
      raw = options.storage.getItem(key)
    } catch {
      return { service, restored: false }
    }
    if (raw === null) return { service, restored: false }
    try {
      service.applySnapshot(PlatformService.parseSnapshot(raw))
      return { service, restored: true }
    } catch {
      try {
        options.storage.removeItem(key)
      } catch {
        // 저장소 접근 불가 — 무시
      }
      return { service: new PlatformService(options), restored: false }
    }
  }

  /** 신규 일감 등록 (28-3-05). 예산·입찰 마감은 선택이며 검증한다 (28-6-01). 성공 시 자동 저장. */
  addRequest(input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>): RepairRequest {
    if (input.budget !== undefined && (!Number.isInteger(input.budget) || input.budget < 0)) {
      throw new PlatformError(`예산은 0 이상의 정수(원)여야 합니다: ${input.budget}`)
    }
    if (input.bidDeadline !== undefined) {
      assertValidDateStr(input.bidDeadline, 'bidDeadline')
    }
    const request = this.store.add(input)
    this.save()
    return request
  }

  /**
   * 견적 제출. requested 상태면 estimated로 전이하고,
   * 이미 estimated면 견적만 교체한다. 그 외 상태에서는 PlatformError.
   */
  submitEstimate(
    requestId: string,
    partnerId: string,
    input: Omit<Estimate, 'requestId' | 'partnerId'>,
  ): EstimateBreakdown {
    const request = this.mustGet(requestId)
    if (request.status !== 'requested' && request.status !== 'estimated') {
      throw new PlatformError(
        `견적을 제출할 수 없는 상태입니다 (${request.status}): ${requestId}`,
      )
    }
    const estimate: Estimate = { ...input, requestId, partnerId }
    const breakdown = calcEstimate(estimate)
    this.estimates.set(requestId, { estimate, breakdown })
    if (request.status === 'requested') {
      this.store.updateStatus(requestId, 'estimated')
    }
    this.save()
    return breakdown
  }

  getEstimate(requestId: string): StoredEstimate | undefined {
    const stored = this.estimates.get(requestId)
    return stored
      ? { estimate: { ...stored.estimate }, breakdown: { ...stored.breakdown } }
      : undefined
  }

  /**
   * 방문 일정 예약 (28-3-02): accepted 상태의 실제 요청만 가능.
   * 슬롯 검증·충돌 검사 후 scheduled 전이까지 원자적으로 수행한다.
   */
  scheduleVisit(
    requestId: string,
    input: { date: string; startHour: number; endHour: number },
  ): ScheduleSlot {
    const request = this.mustGet(requestId)
    if (request.status !== 'accepted') {
      throw new PlatformError(
        `일정은 견적 수락(accepted) 상태에서만 예약할 수 있습니다 (${request.status}): ${requestId}`,
      )
    }
    const stored = this.estimates.get(requestId)
    const slot: ScheduleSlot = {
      id: `S-${this.slotSeq + 1}`,
      partnerId: stored?.estimate.partnerId ?? 'P-001',
      requestId,
      ...input,
    }
    // addSlot이 검증·충돌 검사에 실패하면 여기서 던지고 아무 상태도 변하지 않는다
    const nextSlots = addSlot(this.slots, slot)
    this.store.updateStatus(requestId, 'scheduled')
    this.slots = nextSlots
    this.slotSeq += 1
    this.save()
    return { ...slot }
  }

  get scheduleSlots(): ScheduleSlot[] {
    return this.slots.map((s) => ({ ...s }))
  }

  /**
   * 상태 전이의 단일 진입점. 데이터가 함께 움직여야 하는 전이는
   * 전용 경로로 강제한다: estimated→submitEstimate, scheduled→scheduleVisit,
   * completed→completeJob, settled→settle.
   */
  transitionRequest(
    requestId: string,
    to: JobStatus,
    options?: { completedDate?: string },
  ): RepairRequest {
    if (to === 'estimated') {
      throw new PlatformError('estimated 전이는 submitEstimate()로만 가능합니다')
    }
    if (to === 'scheduled') {
      throw new PlatformError('scheduled 전이는 scheduleVisit()로만 가능합니다')
    }
    if (to === 'completed') {
      this.completeJob(requestId, options?.completedDate)
      return this.mustGet(requestId)
    }
    if (to === 'settled') {
      return this.settle(requestId)
    }
    const result = this.store.updateStatus(requestId, to)
    if (to === 'cancelled') {
      // 28-4-01: 취소 성공 시 해당 요청의 방문 슬롯을 해제해 시간대 차단을 푼다
      this.slots = this.slots.filter((s) => s.requestId !== requestId)
    }
    this.save()
    return result
  }

  /**
   * 시공 중 추가 작업 승인 (28-6-02): in_progress 상태에서만,
   * 고객이 승인한 금액(VAT 포함 정수 원)과 메모를 기록한다.
   */
  approveExtraWork(
    requestId: string,
    input: { amount: number; memo: string; approvedDate?: string },
  ): ExtraWork {
    const request = this.mustGet(requestId)
    if (request.status !== 'in_progress') {
      throw new PlatformError(
        `추가 작업 승인은 시공 중(in_progress)에만 가능합니다 (${request.status}): ${requestId}`,
      )
    }
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new PlatformError(`추가 작업 금액은 1 이상의 정수(원)여야 합니다: ${input.amount}`)
    }
    const date = input.approvedDate ?? todayUTC()
    assertValidDateStr(date, 'approvedDate')
    this.extraSeq += 1
    const extra: ExtraWork = {
      id: `EW-${String(this.extraSeq).padStart(4, '0')}`,
      requestId,
      amount: input.amount,
      memo: input.memo.trim(),
      approvedDate: date,
    }
    this.extraWorks.push(extra)
    this.save()
    return { ...extra }
  }

  extraWorksFor(requestId: string): ExtraWork[] {
    return this.extraWorks.filter((e) => e.requestId === requestId).map((e) => ({ ...e }))
  }

  /**
   * 시공 완료 처리: in_progress → completed 전이와 함께 정산 대상을 생성한다.
   * 최종 총액 = 낙찰 견적 총액 + 승인된 추가 작업 합계이고,
   * 수수료는 최종 총액 기준으로 재산정한다 (28-6-02).
   */
  completeJob(requestId: string, completedDate?: string): CompletedJob {
    this.mustGet(requestId)
    const stored = this.estimates.get(requestId)
    if (!stored) {
      throw new PlatformError(`견적 없이 완료할 수 없습니다: ${requestId}`)
    }
    const date = completedDate ?? todayUTC()
    assertValidDateStr(date, 'completedDate')
    // 전이 규칙 검증이 먼저 — 실패하면 job이 생기지 않는다
    this.store.updateStatus(requestId, 'completed')
    const extraTotal = this.extraWorks
      .filter((e) => e.requestId === requestId)
      .reduce((sum, e) => sum + e.amount, 0)
    const total = stored.breakdown.total + extraTotal
    const job: CompletedJob = {
      requestId,
      partnerId: stored.estimate.partnerId,
      completedDate: date,
      total,
      platformFee: Math.round(total * PLATFORM_FEE_RATE),
      extraTotal,
      settled: false,
    }
    this.jobs.push(job)
    this.save()
    return { ...job }
  }

  /** 정산 확정: completed → settled 전이 + 해당 job에 정산 표시 (28-3-03) */
  settle(requestId: string): RepairRequest {
    const result = this.store.updateStatus(requestId, 'settled')
    const job = this.jobs.find((j) => j.requestId === requestId)
    if (job) job.settled = true
    this.save()
    return result
  }

  get completedJobs(): CompletedJob[] {
    return this.jobs.map((j) => ({ ...j }))
  }

  /** 파트너×주차 정산 집계. filter로 정산 확정/미정산을 구분한다 (28-3-03). */
  settlements(filter: SettlementFilter = 'all'): WeeklySettlement[] {
    const jobs =
      filter === 'all' ? this.jobs : this.jobs.filter((j) => j.settled === (filter === 'settled'))
    return weeklySettlements(jobs)
  }

  /** 미정산 지급 예정 합계 (정수 원) */
  unsettledPayout(): number {
    return this.jobs
      .filter((j) => !j.settled)
      .reduce((sum, j) => sum + j.total - j.platformFee, 0)
  }

  /** 스냅샷 문자열 파싱 + 형태 검증. 실패 시 PlatformError. */
  private static parseSnapshot(raw: string): PlatformSnapshot {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new PlatformError('백업 데이터가 올바른 JSON이 아닙니다')
    }
    const snap = parsed as PlatformSnapshot
    if (
      snap === null ||
      typeof snap !== 'object' ||
      snap.version !== 1 ||
      typeof snap.store !== 'object' ||
      !Array.isArray(snap.store?.requests) ||
      !Number.isInteger(snap.store?.seq) ||
      !Array.isArray(snap.estimates) ||
      !Array.isArray(snap.jobs) ||
      !Array.isArray(snap.slots) ||
      !Number.isInteger(snap.slotSeq)
    ) {
      throw new PlatformError('백업 데이터 형식이 올바르지 않습니다 (version 1 스냅샷이 아님)')
    }
    PlatformService.validateSnapshotElements(snap)
    return snap
  }

  /** 요소 수준 검증 (28-5-02): 오염된 백업이 NaN 정산·불량 상태를 만들지 못하게 한다 */
  private static validateSnapshotElements(snap: PlatformSnapshot): void {
    const STATUSES: JobStatus[] = [
      'requested', 'estimated', 'accepted', 'scheduled',
      'in_progress', 'completed', 'settled', 'lost', 'cancelled',
    ]
    const fail = (what: string): never => {
      throw new PlatformError(`백업 데이터 검증 실패: ${what}`)
    }
    snap.store.requests.forEach((r, i) => {
      if (typeof r?.id !== 'string' || r.id === '') fail(`requests[${i}].id`)
      if (!STATUSES.includes(r.status)) fail(`requests[${i}].status: ${String(r.status)}`)
      if (!isValidDateStr(r.desiredDate)) fail(`requests[${i}].desiredDate: ${String(r.desiredDate)}`)
      if (typeof r.customerName !== 'string' || typeof r.region !== 'string' || typeof r.description !== 'string') {
        fail(`requests[${i}] 텍스트 필드`)
      }
      if (r.budget !== undefined && (!Number.isInteger(r.budget) || r.budget < 0)) {
        fail(`requests[${i}].budget: ${String(r.budget)}`)
      }
      if (r.bidDeadline !== undefined && !isValidDateStr(r.bidDeadline)) {
        fail(`requests[${i}].bidDeadline: ${String(r.bidDeadline)}`)
      }
    })
    snap.estimates.forEach((entry, i) => {
      if (!Array.isArray(entry) || typeof entry[0] !== 'string' || typeof entry[1]?.estimate !== 'object') {
        fail(`estimates[${i}] 구조`)
      }
      try {
        validateEstimate(entry[1].estimate)
      } catch (err) {
        fail(`estimates[${i}]: ${err instanceof Error ? err.message : String(err)}`)
      }
    })
    snap.jobs.forEach((j, i) => {
      if (typeof j?.requestId !== 'string' || typeof j.partnerId !== 'string') fail(`jobs[${i}] id`)
      if (!Number.isInteger(j.total) || j.total < 0) fail(`jobs[${i}].total: ${String(j.total)}`)
      if (!Number.isInteger(j.platformFee) || j.platformFee < 0) fail(`jobs[${i}].platformFee: ${String(j.platformFee)}`)
      if (!isValidDateStr(j.completedDate)) fail(`jobs[${i}].completedDate: ${String(j.completedDate)}`)
      if (typeof j.settled !== 'boolean') fail(`jobs[${i}].settled`)
      if (j.extraTotal !== undefined && (!Number.isInteger(j.extraTotal) || j.extraTotal < 0)) {
        fail(`jobs[${i}].extraTotal: ${String(j.extraTotal)}`)
      }
    })
    snap.slots.forEach((s, i) => {
      if (typeof s?.id !== 'string' || typeof s.partnerId !== 'string' || typeof s.requestId !== 'string') {
        fail(`slots[${i}] id`)
      }
      try {
        validateSlot(s)
      } catch (err) {
        fail(`slots[${i}]: ${err instanceof Error ? err.message : String(err)}`)
      }
    })
    // 28-6-04: extraWorks는 28-7 신규 필드 — 없으면 통과(구 스냅샷), 있으면 검증
    if (snap.extraWorks !== undefined) {
      if (!Array.isArray(snap.extraWorks)) fail('extraWorks 형식')
      snap.extraWorks.forEach((e, i) => {
        if (typeof e?.id !== 'string' || typeof e.requestId !== 'string' || typeof e.memo !== 'string') {
          fail(`extraWorks[${i}] 필드`)
        }
        if (!Number.isInteger(e.amount) || e.amount <= 0) fail(`extraWorks[${i}].amount: ${String(e.amount)}`)
        if (!isValidDateStr(e.approvedDate)) fail(`extraWorks[${i}].approvedDate: ${String(e.approvedDate)}`)
      })
    }
    if (snap.extraSeq !== undefined && !Number.isInteger(snap.extraSeq)) fail('extraSeq')
  }

  /** 검증된 스냅샷을 현재 인스턴스에 적용 */
  private applySnapshot(snapshot: PlatformSnapshot): void {
    this.store.restore(snapshot.store)
    this.estimates = new Map(
      snapshot.estimates.map(([id, s]) => [
        id,
        // breakdown은 저장값을 신뢰하지 않고 재계산한다 (28-5-02)
        { estimate: { ...s.estimate }, breakdown: calcEstimate(s.estimate) },
      ]),
    )
    this.jobs = snapshot.jobs.map((j) => ({ ...j }))
    this.slots = snapshot.slots.map((s) => ({ ...s }))
    this.slotSeq = snapshot.slotSeq
    this.extraWorks = (snapshot.extraWorks ?? []).map((e) => ({ ...e }))
    this.extraSeq = snapshot.extraSeq ?? this.extraWorks.length
  }

  /** 백업용 JSON 내보내기 (28-4-03) */
  exportData(): string {
    return JSON.stringify(this.snapshot(), null, 2)
  }

  /**
   * 백업 JSON 가져오기 (28-4-03). 검증 실패 시 PlatformError를 던지고
   * 기존 데이터는 그대로 보존된다. 성공 시 전체 상태를 교체하고 저장한다.
   */
  importSnapshot(raw: string): void {
    const snapshot = PlatformService.parseSnapshot(raw)
    this.applySnapshot(snapshot)
    this.save()
  }

  /** 상태별 요청 수 (28-4-02 대시보드) */
  statusCounts(): Record<JobStatus, number> {
    const counts: Record<JobStatus, number> = {
      requested: 0,
      estimated: 0,
      accepted: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      settled: 0,
      lost: 0,
      cancelled: 0,
    }
    for (const r of this.store.list()) counts[r.status] += 1
    return counts
  }

  /**
   * fromDate(포함) 이후의 방문 슬롯을 날짜·시각 순으로 최대 limit개 (28-4-02).
   * 활성(scheduled/in_progress) 요청의 슬롯만 — 완료·정산된 방문은 제외한다 (28-5-01).
   */
  upcomingSlots(fromDate: string, limit = 5): ScheduleSlot[] {
    return this.slots
      .filter((s) => {
        if (s.date < fromDate) return false
        const status = this.store.get(s.requestId)?.status
        return status === 'scheduled' || status === 'in_progress'
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
      .slice(0, limit)
      .map((s) => ({ ...s }))
  }

  /** 월별 매출 요약 — 최신 월부터 (28-5-03) */
  monthlyReport(): MonthlyReportRow[] {
    const byMonth = new Map<string, MonthlyReportRow>()
    for (const j of this.jobs) {
      const month = j.completedDate.slice(0, 7)
      let row = byMonth.get(month)
      if (!row) {
        row = {
          month,
          jobCount: 0,
          totalAmount: 0,
          totalFee: 0,
          payout: 0,
          settledPayout: 0,
          unsettledPayout: 0,
        }
        byMonth.set(month, row)
      }
      const jobPayout = j.total - j.platformFee
      row.jobCount += 1
      row.totalAmount += j.total
      row.totalFee += j.platformFee
      row.payout += jobPayout
      if (j.settled) row.settledPayout += jobPayout
      else row.unsettledPayout += jobPayout
    }
    return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month))
  }

  /** 현재 상태의 직렬화 스냅샷 */
  snapshot(): PlatformSnapshot {
    return {
      version: 1,
      store: this.store.snapshot(),
      estimates: [...this.estimates.entries()].map(
        ([id, s]) => [id, { estimate: { ...s.estimate }, breakdown: { ...s.breakdown } }] as [
          string,
          StoredEstimate,
        ],
      ),
      jobs: this.completedJobs,
      slots: this.scheduleSlots,
      slotSeq: this.slotSeq,
      extraWorks: this.extraWorks.map((e) => ({ ...e })),
      extraSeq: this.extraSeq,
    }
  }

  /** 주입된 저장소에 저장. 저장소가 없거나 접근 불가면 조용히 건너뛴다. */
  save(): void {
    if (!this.storage) return
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.snapshot()))
    } catch {
      // 저장 불가 환경(프라이빗 모드, 용량 초과 등) — 동작은 계속
    }
  }

  private mustGet(requestId: string): RepairRequest {
    const request = this.store.get(requestId)
    if (!request) throw new RequestNotFoundError(requestId)
    return request
  }
}

/** UTC 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}
