import { useMemo, useRef, useState } from 'react'
import type { RepairRequest, ScheduleSlot, JobStatus } from './domain/types'
import { EstimateValidationError } from './domain/estimate'
import { nextStatuses } from './domain/jobStatus'
import { addSlot, slotsOn, ScheduleError } from './domain/schedule'
import { PlatformService, PlatformError } from './domain/platform'
import { parseWonInput, parseHourInput, MoneyParseError } from './domain/money'

const STATUS_LABEL: Record<JobStatus, string> = {
  requested: '요청 접수',
  estimated: '견적 제출',
  accepted: '견적 수락',
  scheduled: '일정 확정',
  in_progress: '시공 중',
  completed: '시공 완료',
  settled: '정산 완료',
  cancelled: '취소',
}

const PARTNER_ID = 'P-001'
const krw = (n: number) => `${n.toLocaleString('ko-KR')}원`

function isKnownError(err: unknown): err is Error {
  return (
    err instanceof MoneyParseError ||
    err instanceof EstimateValidationError ||
    err instanceof PlatformError ||
    err instanceof ScheduleError ||
    (err instanceof Error && err.name === 'InvalidTransitionError') ||
    (err instanceof Error && err.name === 'RequestNotFoundError') ||
    (err instanceof Error && err.name === 'DateFormatError')
  )
}

/** 시드: 진행 중 요청 3건 + 정산 이력 3건 (전부 실제 플랫폼 흐름으로 생성) */
function seedPlatform(): PlatformService {
  const p = new PlatformService()
  p.store.add({
    customerName: '김하늘',
    region: '서울 강서구',
    category: '누수',
    description: '욕실 천장에서 물이 새요',
    desiredDate: '2026-09-05',
  })
  p.store.add({
    customerName: '박준서',
    region: '서울 마포구',
    category: '전기',
    description: '거실 콘센트 교체 3곳',
    desiredDate: '2026-09-03',
  })
  p.store.add({
    customerName: '이서연',
    region: '고양 덕양구',
    category: '도배',
    description: '안방 도배 (곰팡이 제거 포함)',
    desiredDate: '2026-09-10',
  })
  const history: Array<{
    customerName: string
    region: string
    category: '타일' | '창호' | '욕실'
    description: string
    date: string
    labor: number
    material: number
  }> = [
    { customerName: '정민호', region: '서울 양천구', category: '욕실', description: '욕실 타일 보수', date: '2026-08-25', labor: 150_000, material: 80_000 },
    { customerName: '한지우', region: '부천 원미구', category: '창호', description: '방충망 교체', date: '2026-08-27', labor: 100_000, material: 20_000 },
    { customerName: '오세라', region: '서울 구로구', category: '타일', description: '주방 벽타일 시공', date: '2026-09-01', labor: 300_000, material: 150_000 },
  ]
  for (const h of history) {
    const r = p.store.add({
      customerName: h.customerName,
      region: h.region,
      category: h.category,
      description: h.description,
      desiredDate: h.date,
    })
    p.submitEstimate(r.id, PARTNER_ID, {
      laborCost: h.labor,
      materialCost: h.material,
      transportCost: 20_000,
      discount: 0,
    })
    p.transitionRequest(r.id, 'accepted')
    p.transitionRequest(r.id, 'scheduled')
    p.transitionRequest(r.id, 'in_progress')
    p.transitionRequest(r.id, 'completed', { completedDate: h.date })
    p.transitionRequest(r.id, 'settled')
  }
  return p
}

type Tab = 'requests' | 'estimate' | 'schedule' | 'settlement'

export default function App() {
  const [tab, setTab] = useState<Tab>('requests')
  const [platform] = useState(seedPlatform)
  // 플랫폼 상태 변경 시 리렌더 트리거
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  return (
    <div className="app">
      <header className="app-header">
        <h1>반듯집수리 파트너</h1>
        <span className="round">28-3 라운드</span>
      </header>
      <nav className="tabs">
        <button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}>
          요청 목록
        </button>
        <button className={tab === 'estimate' ? 'active' : ''} onClick={() => setTab('estimate')}>
          견적 제출
        </button>
        <button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>
          일정
        </button>
        <button className={tab === 'settlement' ? 'active' : ''} onClick={() => setTab('settlement')}>
          정산
        </button>
      </nav>
      <main className="panel">
        {tab === 'requests' && <Requests platform={platform} onChange={refresh} />}
        {tab === 'estimate' && <EstimateForm platform={platform} onChange={refresh} />}
        {tab === 'schedule' && <Schedule />}
        {tab === 'settlement' && <Settlement platform={platform} />}
      </main>
    </div>
  )
}

function Requests({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const [error, setError] = useState('')
  const requests = platform.store.list()

  // 28-2-01: 전이 실패(중복 클릭 등)를 잡아 메시지로 표시
  const doTransition = (r: RepairRequest, to: JobStatus) => {
    setError('')
    try {
      platform.transitionRequest(r.id, to)
      onChange()
    } catch (err) {
      if (isKnownError(err)) setError(`${r.id}: ${err.message}`)
      else throw err
    }
  }

  return (
    <div>
      {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
      {requests.map((r) => {
        const estimate = platform.getEstimate(r.id)
        return (
          <div key={r.id} className="card">
            <div className="row">
              <div>
                <h3>
                  [{r.category}] {r.description}
                </h3>
                <div className="meta">
                  {r.id} · {r.customerName} · {r.region} · 희망일 {r.desiredDate}
                  {estimate && <> · 견적 {krw(estimate.breakdown.total)}</>}
                </div>
              </div>
              <span className={`badge ${r.status === 'cancelled' ? 'cancelled' : ''}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
              {nextStatuses(r.status)
                .filter((next) => next !== 'estimated')
                .map((next) => (
                  <button key={next} onClick={() => doTransition(r, next)}>
                    → {STATUS_LABEL[next]}
                  </button>
                ))}
              {r.status === 'requested' && <span className="meta">견적은 '견적 제출' 탭에서</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EstimateForm({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const candidates = platform.store
    .list()
    .filter((r) => r.status === 'requested' || r.status === 'estimated')
  const [requestId, setRequestId] = useState(candidates[0]?.id ?? '')
  const [labor, setLabor] = useState('150000')
  const [material, setMaterial] = useState('80000')
  const [transport, setTransport] = useState('20000')
  const [discount, setDiscount] = useState('0')
  const [message, setMessage] = useState('')

  const parsed = useMemo(() => {
    try {
      return {
        ok: true as const,
        input: {
          laborCost: parseWonInput(labor),
          materialCost: parseWonInput(material),
          transportCost: parseWonInput(transport),
          discount: parseWonInput(discount),
        },
      }
    } catch (err) {
      if (isKnownError(err)) return { ok: false as const, message: err.message }
      throw err
    }
  }, [labor, material, transport, discount])

  const submit = () => {
    setMessage('')
    if (!parsed.ok) return
    if (!requestId) {
      setMessage('견적을 제출할 요청을 선택하세요')
      return
    }
    try {
      const breakdown = platform.submitEstimate(requestId, PARTNER_ID, parsed.input)
      setMessage(`제출 완료 — 고객 결제 총액 ${krw(breakdown.total)}, 파트너 지급액 ${krw(breakdown.partnerPayout)}`)
      onChange()
    } catch (err) {
      if (isKnownError(err)) setMessage(err.message)
      else throw err
    }
  }

  return (
    <div className="form">
      <label>
        요청 선택
        <select value={requestId} onChange={(e) => setRequestId(e.target.value)}>
          {candidates.length === 0 && <option value="">제출 가능한 요청 없음</option>}
          {candidates.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} · [{r.category}] {r.description} ({STATUS_LABEL[r.status]})
            </option>
          ))}
        </select>
      </label>
      <label>
        인건비 (원)
        <input value={labor} onChange={(e) => setLabor(e.target.value)} inputMode="numeric" />
      </label>
      <label>
        자재비 (원)
        <input value={material} onChange={(e) => setMaterial(e.target.value)} inputMode="numeric" />
      </label>
      <label>
        출장비 (원)
        <input value={transport} onChange={(e) => setTransport(e.target.value)} inputMode="numeric" />
      </label>
      <label>
        할인 (원)
        <input value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="numeric" />
      </label>
      <button onClick={submit} disabled={!parsed.ok}>견적 제출</button>
      {!parsed.ok && <div className="error">{parsed.message}</div>}
      {message && <div className="breakdown card">{message}</div>}
    </div>
  )
}

function Schedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([
    { id: 'S-1', partnerId: PARTNER_ID, requestId: 'REQ-0001', date: '2026-09-05', startHour: 9, endHour: 12 },
  ])
  const [requestId, setRequestId] = useState('REQ-0002')
  const [date, setDate] = useState('2026-09-05')
  const [start, setStart] = useState('13')
  const [end, setEnd] = useState('15')
  const [error, setError] = useState('')
  const [filterByDate, setFilterByDate] = useState(false)
  const nextIdRef = useRef(2)

  const submit = () => {
    setError('')
    try {
      const slot: ScheduleSlot = {
        id: `S-${nextIdRef.current}`,
        partnerId: PARTNER_ID,
        requestId: requestId.trim(),
        date,
        startHour: parseHourInput(start),
        endHour: parseHourInput(end),
      }
      if (slot.requestId === '') {
        setError('요청 번호를 입력하세요')
        return
      }
      setSlots(addSlot(slots, slot))
      nextIdRef.current += 1
    } catch (err) {
      if (isKnownError(err)) setError(err.message)
      else throw err
    }
  }

  // 28-2-05: slotsOn을 날짜 필터에 연결
  const visible = filterByDate
    ? slotsOn(slots, PARTNER_ID, date)
    : [...slots].sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)

  return (
    <div>
      <div className="form" style={{ marginBottom: 16 }}>
        <label>
          요청 번호
          <input value={requestId} onChange={(e) => setRequestId(e.target.value)} />
        </label>
        <label>
          날짜
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          시작 시각 (시)
          <input value={start} onChange={(e) => setStart(e.target.value)} inputMode="numeric" />
        </label>
        <label>
          종료 시각 (시)
          <input value={end} onChange={(e) => setEnd(e.target.value)} inputMode="numeric" />
        </label>
        <button onClick={submit}>일정 추가</button>
        <label style={{ flexDirection: 'row', alignItems: 'center', display: 'flex', gap: 6 }}>
          <input
            type="checkbox"
            checked={filterByDate}
            onChange={(e) => setFilterByDate(e.target.checked)}
          />
          선택한 날짜만 보기
        </label>
        {error && <div className="error">{error}</div>}
      </div>
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>시간</th>
            <th>요청</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>
                {String(s.startHour).padStart(2, '0')}:00~{String(s.endHour).padStart(2, '0')}:00
              </td>
              <td>{s.requestId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Settlement({ platform }: { platform: PlatformService }) {
  // 28-2-03: 시드가 아니라 실제 완료 작업을 집계
  const rows = platform.settlements()
  return (
    <table>
      <thead>
        <tr>
          <th>파트너</th>
          <th>주차</th>
          <th className="num">건수</th>
          <th className="num">총액</th>
          <th className="num">수수료</th>
          <th className="num">지급액</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className="meta">완료된 작업이 없습니다</td>
          </tr>
        )}
        {rows.map((s) => (
          <tr key={`${s.partnerId}-${s.week}`}>
            <td>{s.partnerId}</td>
            <td>{s.week}</td>
            <td className="num">{s.jobCount}</td>
            <td className="num">{krw(s.totalAmount)}</td>
            <td className="num">{krw(s.totalFee)}</td>
            <td className="num">{krw(s.payout)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
