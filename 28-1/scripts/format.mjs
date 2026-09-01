/**
 * 표시용 포맷 유틸 (플레인 ESM — node --test 러너로 검증).
 */

/** 12345 → "12,345원" */
export function formatKRW(amount) {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`정수 원 단위 금액이 필요합니다: ${amount}`)
  }
  const sign = amount < 0 ? '-' : ''
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}${digits}원`
}

/** "2026-09-01" → "2026년 9월 1일 (화)" */
export function formatDateKo(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) throw new TypeError(`YYYY-MM-DD 형식이 필요합니다: ${dateStr}`)
  const [, y, mo, d] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${Number(y)}년 ${Number(mo)}월 ${Number(d)}일 (${days[date.getUTCDay()]})`
}

/** "09:00~12:00" 형태의 시간 범위 라벨 */
export function formatHourRange(startHour, endHour) {
  const pad = (h) => String(h).padStart(2, '0')
  return `${pad(startHour)}:00~${pad(endHour)}:00`
}
