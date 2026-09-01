import { describe, it, expect } from 'vitest'
import { PlatformService, PlatformError, todayUTC } from './platform'
import { RequestNotFoundError } from './store'
import { InvalidTransitionError } from './jobStatus'
import { DateFormatError } from './date'

const ESTIMATE_INPUT = {
  laborCost: 150_000,
  materialCost: 80_000,
  transportCost: 20_000,
  discount: 0,
}

function newRequest() {
  return {
    customerName: '김반듯',
    region: '서울 강서구',
    category: '누수' as const,
    description: '욕실 천장 누수',
    desiredDate: '2026-09-05',
  }
}

function platformWithRequest() {
  const p = new PlatformService()
  const r = p.store.add(newRequest())
  return { p, r }
}

describe('submitEstimate', () => {
  it('requested 상태에서 제출하면 estimated로 전이되고 견적이 저장된다', () => {
    const { p, r } = platformWithRequest()
    const breakdown = p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    expect(breakdown.total).toBe(275_000)
    expect(p.store.get(r.id)!.status).toBe('estimated')
    expect(p.getEstimate(r.id)!.breakdown.total).toBe(275_000)
  })

  it('estimated 상태에서 재제출하면 견적만 교체된다', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    const updated = p.submitEstimate(r.id, 'P-001', { ...ESTIMATE_INPUT, discount: 50_000 })
    expect(updated.total).toBe(220_000)
    expect(p.store.get(r.id)!.status).toBe('estimated')
    expect(p.getEstimate(r.id)!.breakdown.total).toBe(220_000)
  })

  it('accepted 이후 상태에서는 PlatformError', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    p.transitionRequest(r.id, 'accepted')
    expect(() => p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)).toThrow(PlatformError)
  })

  it('없는 요청이면 RequestNotFoundError', () => {
    const p = new PlatformService()
    expect(() => p.submitEstimate('REQ-9999', 'P-001', ESTIMATE_INPUT)).toThrow(
      RequestNotFoundError,
    )
  })
})

describe('transitionRequest', () => {
  it('estimated 전이를 직접 요구하면 PlatformError (submitEstimate 강제)', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.transitionRequest(r.id, 'estimated')).toThrow(PlatformError)
  })

  it('전이 규칙 위반은 InvalidTransitionError를 그대로 전파한다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.transitionRequest(r.id, 'settled')).toThrow(InvalidTransitionError)
  })
})

function driveToInProgress() {
  const { p, r } = platformWithRequest()
  p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
  p.transitionRequest(r.id, 'accepted')
  p.transitionRequest(r.id, 'scheduled')
  p.transitionRequest(r.id, 'in_progress')
  return { p, r }
}

describe('completeJob', () => {
  it('완료 시 견적 금액으로 CompletedJob이 생성된다', () => {
    const { p, r } = driveToInProgress()
    const job = p.completeJob(r.id, '2026-09-06')
    expect(job).toEqual({
      requestId: r.id,
      partnerId: 'P-001',
      completedDate: '2026-09-06',
      total: 275_000,
      platformFee: 13_750,
    })
    expect(p.store.get(r.id)!.status).toBe('completed')
    expect(p.completedJobs).toHaveLength(1)
  })

  it('completedDate를 생략하면 UTC 오늘 날짜를 쓴다', () => {
    const { p, r } = driveToInProgress()
    const job = p.completeJob(r.id)
    expect(job.completedDate).toBe(todayUTC())
  })

  it('달력에 없는 완료일은 DateFormatError, job은 생기지 않는다', () => {
    const { p, r } = driveToInProgress()
    expect(() => p.completeJob(r.id, '2026-02-31')).toThrow(DateFormatError)
    expect(p.completedJobs).toHaveLength(0)
    expect(p.store.get(r.id)!.status).toBe('in_progress')
  })

  it('in_progress가 아니면 InvalidTransitionError, job은 생기지 않는다', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    expect(() => p.completeJob(r.id, '2026-09-06')).toThrow(InvalidTransitionError)
    expect(p.completedJobs).toHaveLength(0)
  })

  it('견적 없이 완료할 수 없다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.completeJob(r.id, '2026-09-06')).toThrow(PlatformError)
  })
})

describe('settle / settlements', () => {
  it('completed → settled 전이 후에도 정산 집계에 남는다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    p.settle(r.id)
    expect(p.store.get(r.id)!.status).toBe('settled')
    const rows = p.settlements()
    expect(rows).toHaveLength(1)
    expect(rows[0]!.week).toBe('2026-W36')
    expect(rows[0]!.payout).toBe(261_250)
  })

  it('completedJobs는 방어적 복사본을 반환한다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    const jobs = p.completedJobs
    jobs[0]!.total = 0
    expect(p.completedJobs[0]!.total).toBe(275_000)
  })
})
