import type {
  CompletedJob,
  Estimate,
  EstimateBreakdown,
  JobStatus,
  RepairRequest,
} from './types'
import { calcEstimate } from './estimate'
import { RequestStore, RequestNotFoundError } from './store'
import { assertValidDateStr } from './date'
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

/**
 * 플랫폼 통합 계층 (28-2-03): 견적 제출 → 상태 전이 → 시공 완료 → 정산을
 * 하나의 흐름으로 연결한다. 도메인 규칙(estimate/jobStatus/settlement)은
 * 각 모듈이 강제하고, 이 서비스는 그 사이의 순서와 데이터 이동을 책임진다.
 */
export class PlatformService {
  readonly store = new RequestStore()
  private estimates = new Map<string, StoredEstimate>()
  private jobs: CompletedJob[] = []

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
    return breakdown
  }

  getEstimate(requestId: string): StoredEstimate | undefined {
    const stored = this.estimates.get(requestId)
    return stored
      ? { estimate: { ...stored.estimate }, breakdown: { ...stored.breakdown } }
      : undefined
  }

  /**
   * 상태 전이의 단일 진입점. 견적/완료/정산이 필요한 전이는
   * 데이터가 함께 움직이도록 전용 경로로 강제한다.
   */
  transitionRequest(requestId: string, to: JobStatus, options?: { completedDate?: string }): RepairRequest {
    if (to === 'estimated') {
      throw new PlatformError('estimated 전이는 submitEstimate()로만 가능합니다')
    }
    if (to === 'completed') {
      this.completeJob(requestId, options?.completedDate)
      return this.mustGet(requestId)
    }
    return this.store.updateStatus(requestId, to)
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
    }
    this.jobs.push(job)
    return { ...job }
  }

  /** 정산 확정: completed → settled */
  settle(requestId: string): RepairRequest {
    return this.store.updateStatus(requestId, 'settled')
  }

  get completedJobs(): CompletedJob[] {
    return this.jobs.map((j) => ({ ...j }))
  }

  settlements(): WeeklySettlement[] {
    return weeklySettlements(this.jobs)
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
