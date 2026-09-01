import type {
  CompletedJob,
  Estimate,
  EstimateBreakdown,
  JobStatus,
  RepairRequest,
  ScheduleSlot,
} from './types'
import { calcEstimate } from './estimate'
import { RequestStore, RequestNotFoundError, type RequestStoreSnapshot } from './store'
import { assertValidDateStr } from './date'
import { addSlot } from './schedule'
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
}

export interface PlatformOptions {
  storage?: StorageLike
  storageKey?: string
}

export type SettlementFilter = 'all' | 'settled' | 'unsettled'

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
      const snapshot = JSON.parse(raw) as PlatformSnapshot
      if (snapshot.version !== 1) throw new Error(`알 수 없는 스냅샷 버전: ${snapshot.version}`)
      service.store.restore(snapshot.store)
      service.estimates = new Map(snapshot.estimates)
      service.jobs = snapshot.jobs.map((j) => ({ ...j }))
      service.slots = snapshot.slots.map((s) => ({ ...s }))
      service.slotSeq = snapshot.slotSeq
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

  /** 신규 요청 등록 (28-3-05). 성공 시 자동 저장. */
  addRequest(input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>): RepairRequest {
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
    this.save()
    return result
  }

  /**
   * 시공 완료 처리: in_progress → completed 전이와 함께
   * 제출돼 있던 견적으로 정산 대상(CompletedJob)을 생성한다.
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
    const job: CompletedJob = {
      requestId,
      partnerId: stored.estimate.partnerId,
      completedDate: date,
      total: stored.breakdown.total,
      platformFee: stored.breakdown.platformFee,
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
