import { describe, it, expect } from 'vitest'
import { PlatformService, PlatformError, todayUTC, type StorageLike } from './platform'
import { RequestNotFoundError } from './store'
import { InvalidTransitionError } from './jobStatus'
import { ScheduleError } from './schedule'
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

function platformWithRequest(storage?: StorageLike) {
  const p = new PlatformService(storage ? { storage } : {})
  const r = p.addRequest(newRequest())
  return { p, r }
}

/** 테스트용 인메모리 저장소 */
class FakeStorage implements StorageLike {
  private map = new Map<string, string>()
  getItem(key: string) {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.map.set(key, value)
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
  get size() {
    return this.map.size
  }
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

function driveToAccepted(storage?: StorageLike) {
  const { p, r } = platformWithRequest(storage)
  p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
  p.transitionRequest(r.id, 'accepted')
  return { p, r }
}

describe('scheduleVisit (28-3-02)', () => {
  it('accepted 요청을 예약하면 슬롯이 생기고 scheduled로 전이된다', () => {
    const { p, r } = driveToAccepted()
    const slot = p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })
    expect(slot.requestId).toBe(r.id)
    expect(slot.partnerId).toBe('P-001')
    expect(p.store.get(r.id)!.status).toBe('scheduled')
    expect(p.scheduleSlots).toHaveLength(1)
  })

  it('accepted가 아닌 상태에서는 PlatformError, 슬롯은 생기지 않는다', () => {
    const { p, r } = platformWithRequest()
    expect(() =>
      p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 }),
    ).toThrow(PlatformError)
    expect(p.scheduleSlots).toHaveLength(0)
  })

  it('일정 충돌 시 ScheduleError, 전이도 슬롯 추가도 일어나지 않는다', () => {
    const { p, r } = driveToAccepted()
    p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })
    const r2 = p.addRequest(newRequest())
    p.submitEstimate(r2.id, 'P-001', ESTIMATE_INPUT)
    p.transitionRequest(r2.id, 'accepted')
    expect(() =>
      p.scheduleVisit(r2.id, { date: '2026-09-05', startHour: 10, endHour: 11 }),
    ).toThrow(ScheduleError)
    expect(p.store.get(r2.id)!.status).toBe('accepted')
    expect(p.scheduleSlots).toHaveLength(1)
  })

  it('달력에 없는 날짜/잘못된 시간은 ScheduleError', () => {
    const { p, r } = driveToAccepted()
    expect(() =>
      p.scheduleVisit(r.id, { date: '2026-02-31', startHour: 9, endHour: 12 }),
    ).toThrow(ScheduleError)
    expect(() =>
      p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 12, endHour: 9 }),
    ).toThrow(ScheduleError)
  })

  it('없는 요청이면 RequestNotFoundError', () => {
    const p = new PlatformService()
    expect(() =>
      p.scheduleVisit('REQ-9999', { date: '2026-09-05', startHour: 9, endHour: 12 }),
    ).toThrow(RequestNotFoundError)
  })
})

describe('transitionRequest', () => {
  it('전용 경로가 있는 전이(estimated/scheduled)를 직접 요구하면 PlatformError', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.transitionRequest(r.id, 'estimated')).toThrow(PlatformError)
    expect(() => p.transitionRequest(r.id, 'scheduled')).toThrow(PlatformError)
  })

  it('전이 규칙 위반은 InvalidTransitionError를 그대로 전파한다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.transitionRequest(r.id, 'settled')).toThrow(InvalidTransitionError)
  })
})

function driveToInProgress(storage?: StorageLike) {
  const { p, r } = driveToAccepted(storage)
  p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })
  p.transitionRequest(r.id, 'in_progress')
  return { p, r }
}

describe('completeJob', () => {
  it('완료 시 견적 금액으로 미정산 CompletedJob이 생성된다', () => {
    const { p, r } = driveToInProgress()
    const job = p.completeJob(r.id, '2026-09-06')
    expect(job).toEqual({
      requestId: r.id,
      partnerId: 'P-001',
      completedDate: '2026-09-06',
      total: 275_000,
      platformFee: 8_250,
      extraTotal: 0,
      settled: false,
    })
    expect(p.store.get(r.id)!.status).toBe('completed')
  })

  it('completedDate를 생략하면 UTC 오늘 날짜를 쓴다', () => {
    const { p, r } = driveToInProgress()
    expect(p.completeJob(r.id).completedDate).toBe(todayUTC())
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

describe('settle / settlements (28-3-03)', () => {
  it('settle하면 요청은 settled, job에는 정산 표시가 남는다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    p.settle(r.id)
    expect(p.store.get(r.id)!.status).toBe('settled')
    expect(p.completedJobs[0]!.settled).toBe(true)
  })

  it('settlements 필터가 미정산/정산 확정을 구분한다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    const r2 = p.addRequest(newRequest())
    p.submitEstimate(r2.id, 'P-001', { ...ESTIMATE_INPUT, discount: 150_000 }) // total 110,000
    p.transitionRequest(r2.id, 'accepted')
    p.scheduleVisit(r2.id, { date: '2026-09-06', startHour: 14, endHour: 16 })
    p.transitionRequest(r2.id, 'in_progress')
    p.completeJob(r2.id, '2026-09-02')
    p.settle(r.id)

    expect(p.settlements('all')[0]!.jobCount).toBe(2)
    const settledRows = p.settlements('settled')
    expect(settledRows).toHaveLength(1)
    expect(settledRows[0]!.totalAmount).toBe(275_000)
    const unsettledRows = p.settlements('unsettled')
    expect(unsettledRows).toHaveLength(1)
    expect(unsettledRows[0]!.totalAmount).toBe(110_000)
  })

  it('unsettledPayout은 미정산 지급액만 합산한다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    expect(p.unsettledPayout()).toBe(266_750)
    p.settle(r.id)
    expect(p.unsettledPayout()).toBe(0)
  })

  it('completedJobs는 방어적 복사본을 반환한다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    const jobs = p.completedJobs
    jobs[0]!.total = 0
    expect(p.completedJobs[0]!.total).toBe(275_000)
  })
})

describe('영속화 (28-3-01)', () => {
  it('전체 흐름이 저장/복원 round-trip을 통과한다', () => {
    const storage = new FakeStorage()
    const { p, r } = driveToInProgress(storage)
    p.completeJob(r.id, '2026-09-01')
    p.settle(r.id)

    const { service: restored, restored: ok } = PlatformService.load({ storage })
    expect(ok).toBe(true)
    expect(restored.store.get(r.id)!.status).toBe('settled')
    expect(restored.getEstimate(r.id)!.breakdown.total).toBe(275_000)
    expect(restored.completedJobs).toHaveLength(1)
    expect(restored.completedJobs[0]!.settled).toBe(true)
    expect(restored.scheduleSlots).toHaveLength(1)
    expect(restored.settlements('settled')[0]!.payout).toBe(266_750)
  })

  it('복원 후 신규 ID가 이어져 충돌하지 않는다', () => {
    const storage = new FakeStorage()
    const { p, r } = platformWithRequest(storage)
    const { service: restored } = PlatformService.load({ storage })
    const r2 = restored.addRequest(newRequest())
    expect(r.id).toBe('REQ-0001')
    expect(r2.id).toBe('REQ-0002')
    void p
  })

  it('복원된 서비스의 일정 충돌 검사가 기존 슬롯을 인식한다', () => {
    const storage = new FakeStorage()
    const { p, r } = driveToAccepted(storage)
    p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })

    const { service: restored } = PlatformService.load({ storage })
    const r2 = restored.addRequest(newRequest())
    restored.submitEstimate(r2.id, 'P-001', ESTIMATE_INPUT)
    restored.transitionRequest(r2.id, 'accepted')
    expect(() =>
      restored.scheduleVisit(r2.id, { date: '2026-09-05', startHour: 11, endHour: 13 }),
    ).toThrow(ScheduleError)
  })

  it('손상된 저장 데이터는 버리고 새로 시작한다', () => {
    const storage = new FakeStorage()
    storage.setItem('banded-platform-v1', '{"broken json')
    const { service, restored } = PlatformService.load({ storage })
    expect(restored).toBe(false)
    expect(service.store.size).toBe(0)
    expect(storage.getItem('banded-platform-v1')).toBeNull() // 손상 키 제거
  })

  it('알 수 없는 스냅샷 버전은 복원하지 않는다', () => {
    const storage = new FakeStorage()
    storage.setItem('banded-platform-v1', JSON.stringify({ version: 99 }))
    const { restored } = PlatformService.load({ storage })
    expect(restored).toBe(false)
  })

  it('저장소가 없어도 모든 기능이 동작한다', () => {
    const { p, r } = driveToInProgress()
    expect(() => p.completeJob(r.id, '2026-09-01')).not.toThrow()
  })
})

describe('취소 시 슬롯 해제 (28-4-01)', () => {
  it('scheduled 요청을 취소하면 슬롯이 해제되고 같은 시간대 재예약이 가능하다', () => {
    const { p, r } = driveToAccepted()
    p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })
    p.transitionRequest(r.id, 'cancelled')
    expect(p.scheduleSlots).toHaveLength(0)

    const r2 = p.addRequest(newRequest())
    p.submitEstimate(r2.id, 'P-001', ESTIMATE_INPUT)
    p.transitionRequest(r2.id, 'accepted')
    expect(() =>
      p.scheduleVisit(r2.id, { date: '2026-09-05', startHour: 10, endHour: 11 }),
    ).not.toThrow()
  })

  it('취소 전이가 불가능한 상태에서는 슬롯이 유지된다', () => {
    const { p, r } = driveToInProgress()
    expect(() => p.transitionRequest(r.id, 'cancelled')).toThrow(InvalidTransitionError)
    expect(p.scheduleSlots).toHaveLength(1)
  })

  it('완료된 작업의 슬롯은 이력으로 유지된다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-06')
    expect(p.scheduleSlots).toHaveLength(1)
  })
})

describe('백업 내보내기/가져오기 (28-4-03)', () => {
  it('export → import round-trip으로 전체 상태가 복제된다', () => {
    const { p, r } = driveToInProgress()
    p.completeJob(r.id, '2026-09-01')
    const backup = p.exportData()

    const fresh = new PlatformService()
    fresh.importSnapshot(backup)
    expect(fresh.store.get(r.id)!.status).toBe('completed')
    expect(fresh.completedJobs).toHaveLength(1)
    expect(fresh.scheduleSlots).toHaveLength(1)
    expect(fresh.addRequest(newRequest()).id).toBe('REQ-0002')
  })

  it('손상된 JSON은 PlatformError, 기존 데이터는 보존된다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.importSnapshot('{"broken')).toThrow(PlatformError)
    expect(() => p.importSnapshot('{"version":2}')).toThrow(PlatformError)
    expect(() => p.importSnapshot('null')).toThrow(PlatformError)
    expect(p.store.get(r.id)).toBeDefined()
  })

  it('가져오기 성공 시 저장소에도 반영된다', () => {
    const storage = new FakeStorage()
    const target = new PlatformService({ storage })
    const { p, r } = platformWithRequest()
    target.importSnapshot(p.exportData())
    const { service: reloaded, restored } = PlatformService.load({ storage })
    expect(restored).toBe(true)
    expect(reloaded.store.get(r.id)).toBeDefined()
  })
})

describe('대시보드 집계 (28-4-02)', () => {
  it('statusCounts가 상태별 요청 수를 집계한다', () => {
    const { p, r } = platformWithRequest()
    p.addRequest(newRequest())
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    const counts = p.statusCounts()
    expect(counts.requested).toBe(1)
    expect(counts.estimated).toBe(1)
    expect(counts.cancelled).toBe(0)
  })

  it('upcomingSlots가 기준일 이후를 날짜·시각 순으로 최대 limit개 반환한다', () => {
    const p = new PlatformService()
    const make = (date: string, start: number, end: number) => {
      const r = p.addRequest({ ...newRequest(), desiredDate: date })
      p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
      p.transitionRequest(r.id, 'accepted')
      p.scheduleVisit(r.id, { date, startHour: start, endHour: end })
    }
    make('2026-09-10', 14, 16)
    make('2026-09-08', 9, 11)
    make('2026-09-08', 13, 15)
    make('2026-09-01', 9, 11) // 기준일 이전
    const upcoming = p.upcomingSlots('2026-09-05', 2)
    expect(upcoming.map((s) => `${s.date} ${s.startHour}`)).toEqual([
      '2026-09-08 9',
      '2026-09-08 13',
    ])
  })
})

describe('활성 일정만 표시 (28-5-01)', () => {
  it('완료된 요청의 슬롯은 upcomingSlots에서 제외된다', () => {
    const { p, r } = driveToInProgress()
    expect(p.upcomingSlots('2026-09-01')).toHaveLength(1)
    p.completeJob(r.id, '2026-09-05')
    expect(p.upcomingSlots('2026-09-01')).toHaveLength(0)
  })

  it('scheduled와 in_progress 요청의 슬롯은 포함된다', () => {
    const { p, r } = driveToAccepted()
    p.scheduleVisit(r.id, { date: '2026-09-05', startHour: 9, endHour: 12 })
    expect(p.upcomingSlots('2026-09-01')).toHaveLength(1)
    p.transitionRequest(r.id, 'in_progress')
    expect(p.upcomingSlots('2026-09-01')).toHaveLength(1)
  })
})

describe('백업 요소 수준 검증 (28-5-02)', () => {
  function baseSnap() {
    return {
      version: 1,
      store: { seq: 0, requests: [] as unknown[] },
      estimates: [] as unknown[],
      jobs: [] as unknown[],
      slots: [] as unknown[],
      slotSeq: 0,
    }
  }

  it('job.total이 정수가 아니면 거부한다 (NaN 정산 재현 케이스)', () => {
    const p = new PlatformService()
    const snap = baseSnap()
    snap.jobs = [{ requestId: 'R1', partnerId: 'P-001', completedDate: '2026-09-01', total: 'abc', platformFee: 5, settled: false }]
    expect(() => p.importSnapshot(JSON.stringify(snap))).toThrow(PlatformError)
  })

  it('허용되지 않은 요청 상태·잘못된 날짜·불량 슬롯을 거부한다', () => {
    const p = new PlatformService()
    const s1 = baseSnap()
    s1.store.requests = [{ id: 'R1', customerName: 'A', region: 'B', category: '누수', description: 'C', desiredDate: '2026-09-05', status: 'hacked', createdAt: '' }]
    expect(() => p.importSnapshot(JSON.stringify(s1))).toThrow(PlatformError)

    const s2 = baseSnap()
    s2.jobs = [{ requestId: 'R1', partnerId: 'P-001', completedDate: '2026-02-31', total: 100, platformFee: 5, settled: false }]
    expect(() => p.importSnapshot(JSON.stringify(s2))).toThrow(PlatformError)

    const s3 = baseSnap()
    s3.slots = [{ id: 'S-1', partnerId: 'P-001', requestId: 'R1', date: '2026-09-05', startHour: 20, endHour: 9 }]
    expect(() => p.importSnapshot(JSON.stringify(s3))).toThrow(PlatformError)
  })

  it('검증 실패 시 기존 데이터가 보존된다', () => {
    const { p, r } = platformWithRequest()
    const snap = baseSnap()
    snap.jobs = [{ requestId: 'R1', partnerId: 'P-001', completedDate: '2026-09-01', total: 1.5, platformFee: 5, settled: false }]
    expect(() => p.importSnapshot(JSON.stringify(snap))).toThrow(PlatformError)
    expect(p.store.get(r.id)).toBeDefined()
  })

  it('견적 breakdown은 저장값을 무시하고 재계산한다', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    const snap = JSON.parse(p.exportData())
    snap.estimates[0][1].breakdown.total = 999 // 조작된 breakdown
    const fresh = new PlatformService()
    fresh.importSnapshot(JSON.stringify(snap))
    expect(fresh.getEstimate(r.id)!.breakdown.total).toBe(275_000)
  })
})

describe('월별 리포트 (28-5-03)', () => {
  it('월별 건수/금액/정산 구분을 집계하고 최신 월부터 정렬한다', () => {
    const p = new PlatformService()
    const make = (date: string, discount: number) => {
      const r = p.addRequest(newRequest())
      p.submitEstimate(r.id, 'P-001', { ...ESTIMATE_INPUT, discount })
      p.transitionRequest(r.id, 'accepted')
      p.scheduleVisit(r.id, { date, startHour: 9 + p.scheduleSlots.length * 4, endHour: 11 + p.scheduleSlots.length * 4 })
      p.transitionRequest(r.id, 'in_progress')
      p.completeJob(r.id, date)
      return r
    }
    const aug = make('2026-08-25', 0) // total 275,000 / fee 8,250 / payout 266,750
    make('2026-09-02', 150_000) // total 110,000 / fee 3,300 / payout 106,700
    p.settle(aug.id)

    const report = p.monthlyReport()
    expect(report.map((m) => m.month)).toEqual(['2026-09', '2026-08'])
    const sep = report[0]!
    expect(sep.jobCount).toBe(1)
    expect(sep.payout).toBe(106_700)
    expect(sep.unsettledPayout).toBe(106_700)
    expect(sep.settledPayout).toBe(0)
    const augRow = report[1]!
    expect(augRow.settledPayout).toBe(266_750)
    expect(augRow.unsettledPayout).toBe(0)
    expect(augRow.totalAmount).toBe(275_000)
  })

  it('완료 작업이 없으면 빈 리포트', () => {
    expect(new PlatformService().monthlyReport()).toEqual([])
  })
})

describe('견적 메모 (28-5-04)', () => {
  it('메모가 저장되고 백업 round-trip에도 유지된다', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', { ...ESTIMATE_INPUT, memo: '자재 사전 주문 필요' })
    expect(p.getEstimate(r.id)!.estimate.memo).toBe('자재 사전 주문 필요')
    const fresh = new PlatformService()
    fresh.importSnapshot(p.exportData())
    expect(fresh.getEstimate(r.id)!.estimate.memo).toBe('자재 사전 주문 필요')
  })
})

describe('입찰 모델 정렬 (28-6-01)', () => {
  it('예산·입찰 마감이 검증과 함께 저장된다', () => {
    const p = new PlatformService()
    const r = p.addRequest({ ...newRequest(), budget: 380_000, bidDeadline: '2026-09-03' })
    expect(p.store.get(r.id)!.budget).toBe(380_000)
    expect(p.store.get(r.id)!.bidDeadline).toBe('2026-09-03')
  })

  it('잘못된 예산/마감일을 거부한다', () => {
    const p = new PlatformService()
    expect(() => p.addRequest({ ...newRequest(), budget: 100.5 })).toThrow(PlatformError)
    expect(() => p.addRequest({ ...newRequest(), budget: -1 })).toThrow(PlatformError)
    expect(() => p.addRequest({ ...newRequest(), bidDeadline: '2026-02-31' })).toThrow(DateFormatError)
    expect(p.store.size).toBe(0)
  })

  it('입찰 중(estimated) 일감을 미낙찰(lost) 처리할 수 있다', () => {
    const { p, r } = platformWithRequest()
    p.submitEstimate(r.id, 'P-001', ESTIMATE_INPUT)
    p.transitionRequest(r.id, 'lost')
    expect(p.store.get(r.id)!.status).toBe('lost')
  })

  it('입찰 전(requested)에는 미낙찰이 불가하다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.transitionRequest(r.id, 'lost')).toThrow(InvalidTransitionError)
  })
})

describe('추가 작업 승인 (28-6-02)', () => {
  it('시공 중 승인한 추가 작업이 완료 시 총액·수수료에 반영된다', () => {
    const { p, r } = driveToInProgress()
    p.approveExtraWork(r.id, { amount: 50_000, memo: '곰팡이 제거', approvedDate: '2026-09-05' })
    const job = p.completeJob(r.id, '2026-09-06')
    expect(job.total).toBe(325_000) // 275,000 + 50,000
    expect(job.extraTotal).toBe(50_000)
    expect(job.platformFee).toBe(9_750) // round(325,000 * 3%)
    expect(p.extraWorksFor(r.id)).toHaveLength(1)
  })

  it('시공 중이 아니면 승인할 수 없다', () => {
    const { p, r } = driveToAccepted()
    expect(() => p.approveExtraWork(r.id, { amount: 50_000, memo: 'x' })).toThrow(PlatformError)
  })

  it('0 이하·비정수 금액과 잘못된 승인일을 거부한다', () => {
    const { p, r } = driveToInProgress()
    expect(() => p.approveExtraWork(r.id, { amount: 0, memo: 'x' })).toThrow(PlatformError)
    expect(() => p.approveExtraWork(r.id, { amount: 1.5, memo: 'x' })).toThrow(PlatformError)
    expect(() =>
      p.approveExtraWork(r.id, { amount: 1_000, memo: 'x', approvedDate: '2026-02-31' }),
    ).toThrow(DateFormatError)
    expect(p.extraWorksFor(r.id)).toHaveLength(0)
  })

  it('추가 작업이 백업 round-trip에 유지된다', () => {
    const { p, r } = driveToInProgress()
    p.approveExtraWork(r.id, { amount: 30_000, memo: '실리콘 보강', approvedDate: '2026-09-05' })
    const fresh = new PlatformService()
    fresh.importSnapshot(p.exportData())
    expect(fresh.extraWorksFor(r.id)).toHaveLength(1)
    const job = fresh.completeJob(r.id, '2026-09-06')
    expect(job.total).toBe(305_000)
  })

  it('extraWorks가 없는 구(28-6 이전) 스냅샷도 복원된다 (28-6-04)', () => {
    const { p, r } = platformWithRequest()
    const snap = JSON.parse(p.exportData())
    delete snap.extraWorks
    delete snap.extraSeq
    const fresh = new PlatformService()
    fresh.importSnapshot(JSON.stringify(snap))
    expect(fresh.store.get(r.id)).toBeDefined()
    expect(fresh.extraWorksFor(r.id)).toEqual([])
  })

  it('오염된 extraWorks는 거부한다', () => {
    const { p } = platformWithRequest()
    const snap = JSON.parse(p.exportData())
    snap.extraWorks = [{ id: 'EW-0001', requestId: 'R1', amount: 'abc', memo: '', approvedDate: '2026-09-01' }]
    expect(() => new PlatformService().importSnapshot(JSON.stringify(snap))).toThrow(PlatformError)
  })
})

describe('작업 체크리스트 (28-8-02)', () => {
  it('기본 3항목이 미완료로 제공되고 토글이 영속화된다', () => {
    const { p, r } = platformWithRequest()
    const list = p.checklistFor(r.id)
    expect(list).toHaveLength(3)
    expect(list.every((i) => !i.done)).toBe(true)

    p.toggleChecklistItem(r.id, 'visit')
    expect(p.checklistFor(r.id).find((i) => i.key === 'visit')!.done).toBe(true)
    p.toggleChecklistItem(r.id, 'visit')
    expect(p.checklistFor(r.id).find((i) => i.key === 'visit')!.done).toBe(false)
  })

  it('없는 요청·알 수 없는 키를 거부한다', () => {
    const { p, r } = platformWithRequest()
    expect(() => p.toggleChecklistItem('REQ-9999', 'visit')).toThrow(RequestNotFoundError)
    expect(() => p.toggleChecklistItem(r.id, 'hack' as never)).toThrow(PlatformError)
  })

  it('체크 상태가 백업 round-trip에 유지된다', () => {
    const { p, r } = platformWithRequest()
    p.toggleChecklistItem(r.id, 'materials')
    const fresh = new PlatformService()
    fresh.importSnapshot(p.exportData())
    expect(fresh.checklistFor(r.id).find((i) => i.key === 'materials')!.done).toBe(true)
  })

  it('checklists가 없는 구 스냅샷도 복원된다', () => {
    const { p, r } = platformWithRequest()
    const snap = JSON.parse(p.exportData())
    delete snap.checklists
    const fresh = new PlatformService()
    fresh.importSnapshot(JSON.stringify(snap))
    expect(fresh.checklistFor(r.id).every((i) => !i.done)).toBe(true)
  })

  it('오염된 checklists는 거부한다', () => {
    const { p } = platformWithRequest()
    const snap = JSON.parse(p.exportData())
    snap.checklists = [['REQ-0001', { hack: true }]]
    expect(() => new PlatformService().importSnapshot(JSON.stringify(snap))).toThrow(PlatformError)
    const snap2 = JSON.parse(p.exportData())
    snap2.checklists = [['REQ-0001', { visit: 'yes' }]]
    expect(() => new PlatformService().importSnapshot(JSON.stringify(snap2))).toThrow(PlatformError)
  })
})

describe('파트너 프로필 (28-8-04)', () => {
  const PROFILE = { name: '반듯인테리어', specialties: '도배, 타일', region: '서울 전체', intro: '정직한 시공' }

  it('프로필을 저장·조회하고 공백을 정리한다', () => {
    const p = new PlatformService()
    expect(p.getProfile()).toBeUndefined()
    const saved = p.updateProfile({ ...PROFILE, name: '  반듯인테리어  ' })
    expect(saved.name).toBe('반듯인테리어')
    expect(p.getProfile()!.region).toBe('서울 전체')
  })

  it('업체명이 비어 있으면 거부한다', () => {
    const p = new PlatformService()
    expect(() => p.updateProfile({ ...PROFILE, name: '   ' })).toThrow(PlatformError)
    expect(p.getProfile()).toBeUndefined()
  })

  it('프로필이 백업 round-trip에 유지되고, 없는 구 스냅샷도 복원된다', () => {
    const p = new PlatformService()
    p.updateProfile(PROFILE)
    const fresh = new PlatformService()
    fresh.importSnapshot(p.exportData())
    expect(fresh.getProfile()!.name).toBe('반듯인테리어')

    const snap = JSON.parse(p.exportData())
    delete snap.profile
    const fresh2 = new PlatformService()
    fresh2.importSnapshot(JSON.stringify(snap))
    expect(fresh2.getProfile()).toBeUndefined()
  })

  it('오염된 profile은 거부한다', () => {
    const p = new PlatformService()
    const snap = JSON.parse(p.exportData())
    snap.profile = { name: 123 }
    expect(() => new PlatformService().importSnapshot(JSON.stringify(snap))).toThrow(PlatformError)
  })
})
