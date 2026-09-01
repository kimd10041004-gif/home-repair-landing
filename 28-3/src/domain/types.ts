/** 시공 카테고리 */
export type RepairCategory =
  | '누수'
  | '전기'
  | '도배'
  | '타일'
  | '창호'
  | '욕실'
  | '기타'

/** 작업(수리 요청) 상태 — 전이 규칙은 jobStatus.ts 참조 */
export type JobStatus =
  | 'requested' // 고객 요청 접수
  | 'estimated' // 파트너 견적 제출
  | 'accepted' // 고객 견적 수락
  | 'scheduled' // 방문 일정 확정
  | 'in_progress' // 시공 중
  | 'completed' // 시공 완료
  | 'settled' // 정산 완료
  | 'cancelled' // 취소

/** 고객 수리 요청 */
export interface RepairRequest {
  id: string
  customerName: string
  region: string
  category: RepairCategory
  description: string
  /** 희망 방문일 (YYYY-MM-DD) */
  desiredDate: string
  status: JobStatus
  createdAt: string
}

/** 파트너가 제출하는 견적 (금액은 모두 정수 원 단위) */
export interface Estimate {
  requestId: string
  partnerId: string
  laborCost: number
  materialCost: number
  transportCost: number
  discount: number
  memo?: string
}

/** 견적 계산 결과 */
export interface EstimateBreakdown {
  subtotal: number
  vat: number
  total: number
  platformFee: number
  partnerPayout: number
}

/** 파트너 방문 일정 슬롯 */
export interface ScheduleSlot {
  id: string
  partnerId: string
  requestId: string
  /** YYYY-MM-DD */
  date: string
  /** 0-23 */
  startHour: number
  /** startHour < endHour <= 24 */
  endHour: number
}

/** 정산 대상 완료 작업 */
export interface CompletedJob {
  requestId: string
  partnerId: string
  /** 시공 완료일 (YYYY-MM-DD) */
  completedDate: string
  /** VAT 포함 총액 (정수 원) */
  total: number
  /** 플랫폼 수수료 (정수 원) */
  platformFee: number
}
