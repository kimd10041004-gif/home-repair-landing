import type { RepairRequest, JobStatus } from './types'
import { transition } from './jobStatus'
import { assertValidDateStr, DateFormatError } from './date'

export class RequestNotFoundError extends Error {
  constructor(id: string) {
    super(`요청을 찾을 수 없습니다: ${id}`)
    this.name = 'RequestNotFoundError'
  }
}

export { DateFormatError }

/**
 * 인메모리 수리요청 저장소.
 * 반환되는 객체는 방어적 복사본이므로 외부에서 수정해도 내부 상태에 영향이 없다.
 */
export class RequestStore {
  private requests = new Map<string, RepairRequest>()
  private seq = 0

  /** desiredDate는 실제 달력 날짜여야 한다 (28-1-06). 위반 시 DateFormatError. */
  add(input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>): RepairRequest {
    assertValidDateStr(input.desiredDate, 'desiredDate')
    this.seq += 1
    const request: RepairRequest = {
      ...input,
      id: `REQ-${String(this.seq).padStart(4, '0')}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
    }
    this.requests.set(request.id, request)
    return { ...request }
  }

  get(id: string): RepairRequest | undefined {
    const r = this.requests.get(id)
    return r ? { ...r } : undefined
  }

  list(status?: JobStatus): RepairRequest[] {
    const all = [...this.requests.values()]
    const filtered = status ? all.filter((r) => r.status === status) : all
    return filtered.map((r) => ({ ...r }))
  }

  /**
   * 상태 전이 규칙(jobStatus.ts)을 통과해야만 상태가 바뀐다.
   * 미존재 요청은 RequestNotFoundError (28-1-07: 오류 타입 구분).
   */
  updateStatus(id: string, to: JobStatus): RepairRequest {
    const r = this.requests.get(id)
    if (!r) throw new RequestNotFoundError(id)
    r.status = transition(r.status, to)
    return { ...r }
  }

  get size(): number {
    return this.requests.size
  }
}
