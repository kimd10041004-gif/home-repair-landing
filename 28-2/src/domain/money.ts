/**
 * 금액 입력 파싱 (28-1 감사 28-1-05).
 * Number() 캐스팅의 조용한 변환('' → 0, '12e3' → 12000)을 금지하고
 * 명시적 십진 정수만 허용한다. 천 단위 구분 쉼표는 허용.
 */

export class MoneyParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MoneyParseError'
  }
}

const WON_RE = /^\d{1,3}(,\d{3})*$|^\d+$/

/** "150000" 또는 "150,000" → 150000. 빈 값/음수/소수/지수 표기는 오류. */
export function parseWonInput(raw: string): number {
  const trimmed = raw.trim()
  if (trimmed === '') {
    throw new MoneyParseError('금액을 입력하세요')
  }
  if (!WON_RE.test(trimmed)) {
    throw new MoneyParseError(`금액은 0 이상의 정수(원)만 입력할 수 있습니다: ${raw}`)
  }
  const value = Number(trimmed.replace(/,/g, ''))
  if (!Number.isSafeInteger(value)) {
    throw new MoneyParseError(`금액이 처리 가능한 범위를 벗어났습니다: ${raw}`)
  }
  return value
}

/** "9" → 9. 정수 시각(0~24) 입력용 — 빈 값/비숫자는 오류. */
export function parseHourInput(raw: string): number {
  const trimmed = raw.trim()
  if (!/^\d{1,2}$/.test(trimmed)) {
    throw new MoneyParseError(`시각은 0~24 사이 정수만 입력할 수 있습니다: ${raw}`)
  }
  return Number(trimmed)
}
