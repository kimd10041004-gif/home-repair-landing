import test from 'node:test'
import assert from 'node:assert/strict'
import { formatKRW, formatDateKo, formatHourRange } from '../../scripts/format.mjs'

test('formatKRW: 천 단위 구분', () => {
  assert.equal(formatKRW(0), '0원')
  assert.equal(formatKRW(1234), '1,234원')
  assert.equal(formatKRW(275000), '275,000원')
  assert.equal(formatKRW(1234567890), '1,234,567,890원')
})

test('formatKRW: 음수', () => {
  assert.equal(formatKRW(-5000), '-5,000원')
})

test('formatKRW: 정수가 아니면 TypeError', () => {
  assert.throws(() => formatKRW(100.5), TypeError)
  assert.throws(() => formatKRW('100'), TypeError)
})

test('formatDateKo: 요일 포함 한국어 날짜', () => {
  assert.equal(formatDateKo('2026-09-01'), '2026년 9월 1일 (화)')
  assert.equal(formatDateKo('2026-01-04'), '2026년 1월 4일 (일)')
})

test('formatDateKo: 형식 오류', () => {
  assert.throws(() => formatDateKo('2026/09/01'), TypeError)
  assert.throws(() => formatDateKo('26-9-1'), TypeError)
})

test('formatHourRange: 2자리 패딩', () => {
  assert.equal(formatHourRange(9, 12), '09:00~12:00')
  assert.equal(formatHourRange(0, 24), '00:00~24:00')
})
