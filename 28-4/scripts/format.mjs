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

/**
 * "2026-09-01" → "2026년 9월 1일 (화)"
 * 존재하지 않는 날짜(예: 2026-02-31)는 롤오버된 요일을 붙이지 않고 거부한다 (28-1-04).
 */
export function formatDateKo(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) throw new TypeError(`YYYY-MM-DD 형식이 필요합니다: ${dateStr}`)
  const [, y, mo, d] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  const rolledOver =
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(mo) - 1 ||
    date.getUTCDate() !== Number(d)
  if (rolledOver) {
    throw new TypeError(`실제 달력에 존재하지 않는 날짜입니다: ${dateStr}`)
  }
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${Number(y)}년 ${Number(mo)}월 ${Number(d)}일 (${days[date.getUTCDay()]})`
}

/** "09:00~12:00" 형태의 시간 범위 라벨 */
export function formatHourRange(startHour, endHour) {
  const pad = (h) => String(h).padStart(2, '0')
  return `${pad(startHour)}:00~${pad(endHour)}:00`
}
