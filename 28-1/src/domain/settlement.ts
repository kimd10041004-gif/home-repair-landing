import type { CompletedJob } from './types'

export interface WeeklySettlement {
  /** ISO 주차 라벨 (예: 2026-W36) */
  week: string
  jobCount: number
  totalAmount: number
  totalFee: number
  payout: number
}

/**
 * YYYY-MM-DD 문자열의 ISO 주차 라벨을 구한다 (예: 2026-W36).
 * UTC 기준으로 계산하여 실행 환경 타임존의 영향을 받지 않는다.
 */
export function isoWeekLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d!))
  // ISO 8601: 목요일이 속한 해가 그 주의 연도
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** 완료 작업을 ISO 주차별로 집계해 주차 오름차순으로 반환 */
export function weeklySettlements(jobs: readonly CompletedJob[]): WeeklySettlement[] {
  const byWeek = new Map<string, WeeklySettlement>()
  for (const job of jobs) {
    const week = isoWeekLabel(job.completedDate)
    let s = byWeek.get(week)
    if (!s) {
      s = { week, jobCount: 0, totalAmount: 0, totalFee: 0, payout: 0 }
      byWeek.set(week, s)
    }
    s.jobCount += 1
    s.totalAmount += job.total
    s.totalFee += job.platformFee
    s.payout += job.total - job.platformFee
  }
  return [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week))
}
