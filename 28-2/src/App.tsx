import { useMemo, useRef, useState } from 'react'
import type { Estimate, RepairRequest, ScheduleSlot, CompletedJob, JobStatus } from './domain/types'
import { calcEstimate, EstimateValidationError } from './domain/estimate'
import { nextStatuses } from './domain/jobStatus'
import { addSlot, ScheduleError } from './domain/schedule'
import { weeklySettlements } from './domain/settlement'
import { RequestStore } from './domain/store'
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

const krw = (n: number) => `${n.toLocaleString('ko-KR')}원`

function seedStore(): RequestStore {
  const store = new RequestStore()
  store.add({
    customerName: '김하늘',
    region: '서울 강서구',
    category: '누수',
    description: '욕실 천장에서 물이 새요',
    desiredDate: '2026-09-05',
  })
  store.add({
    customerName: '박준서',
    region: '서울 마포구',
    category: '전기',
    description: '거실 콘센트 교체 3곳',
    desiredDate: '2026-09-03',
  })
  store.add({
    customerName: '이서연',
    region: '고양 덕양구',
    category: '도배',
    description: '안방 도배 (곰팡이 제거 포함)',
    desiredDate: '2026-09-10',
  })
  return store
}

const SEED_JOBS: CompletedJob[] = [
  { requestId: 'REQ-0101', partnerId: 'P-001', completedDate: '2026-08-25', total: 275_000, platformFee: 13_750 },
  { requestId: 'REQ-0102', partnerId: 'P-001', completedDate: '2026-08-27', total: 132_000, platformFee: 6_600 },
  { requestId: 'REQ-0103', partnerId: 'P-001', completedDate: '2026-09-01', total: 495_000, platformFee: 24_750 },
]

type Tab = 'requests' | 'estimate' | 'schedule' | 'settlement'

export default function App() {
  const [tab, setTab] = useState<Tab>('requests')
  const [store] = useState(seedStore)
  const [requests, setRequests] = useState<RepairRequest[]>(() => store.list())

  const refresh = () => setRequests(store.list())

  return (
    <div className="app">
      <header className="app-header">
        <h1>반듯집수리 파트너</h1>
        <span className="round">28-2 라운드</span>
      </header>
      <nav className="tabs">
        <button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}>
          요청 목록
        </button>
        <button className={tab === 'estimate' ? 'active' : ''} onClick={() => setTab('estimate')}>
          견적 계산
        </button>
        <button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>
          일정
        </button>
        <button className={tab === 'settlement' ? 'active' : ''} onClick={() => setTab('settlement')}>
          정산
        </button>
      </nav>
      <main className="panel">
        {tab === 'requests' && <Requests requests={requests} store={store} onChange={refresh} />}
        {tab === 'estimate' && <EstimateForm />}
        {tab === 'schedule' && <Schedule />}
        {tab === 'settlement' && <Settlement />}
      </main>
    </div>
  )
}

function Requests({
  requests,
  store,
  onChange,
}: {
  requests: RepairRequest[]
  store: RequestStore
  onChange: () => void
}) {
  return (
    <div>
      {requests.map((r) => (
        <div key={r.id} className="card">
          <div className="row">
            <div>
              <h3>
                [{r.category}] {r.description}
              </h3>
              <div className="meta">
                {r.id} · {r.customerName} · {r.region} · 희망일 {r.desiredDate}
              </div>
            </div>
            <span className={`badge ${r.status === 'cancelled' ? 'cancelled' : ''}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
            {nextStatuses(r.status).map((next) => (
              <button
                key={next}
                onClick={() => {
                  store.updateStatus(r.id, next)
                  onChange()
                }}
              >
                → {STATUS_LABEL[next]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EstimateForm() {
  const [labor, setLabor] = useState('150000')
  const [material, setMaterial] = useState('80000')
  const [transport, setTransport] = useState('20000')
  const [discount, setDiscount] = useState('0')

  // 28-1-05: Number() 캐스팅 대신 명시적 파싱 — 빈 값/지수 표기는 오류로 표시
  const result = useMemo(() => {
    try {
      const estimate: Estimate = {
        requestId: 'REQ-0001',
        partnerId: 'P-001',
        laborCost: parseWonInput(labor),
        materialCost: parseWonInput(material),
        transportCost: parseWonInput(transport),
        discount: parseWonInput(discount),
      }
      return { ok: true as const, breakdown: calcEstimate(estimate) }
    } catch (err) {
      if (err instanceof MoneyParseError || err instanceof EstimateValidationError) {
        return { ok: false as const, message: err.message }
      }
      throw err
    }
  }, [labor, material, transport, discount])

  return (
    <div className="form">
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
      {result.ok ? (
        <div className="breakdown card">
          <div>공급가: {krw(result.breakdown.subtotal)}</div>
          <div>부가세(10%): {krw(result.breakdown.vat)}</div>
          <div className="total">고객 결제 총액: {krw(result.breakdown.total)}</div>
          <div>플랫폼 수수료(5%): {krw(result.breakdown.platformFee)}</div>
          <div className="total">파트너 지급액: {krw(result.breakdown.partnerPayout)}</div>
        </div>
      ) : (
        <div className="error">{result.message}</div>
      )}
    </div>
  )
}

function Schedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([
    { id: 'S-1', partnerId: 'P-001', requestId: 'REQ-0001', date: '2026-09-05', startHour: 9, endHour: 12 },
  ])
  const [requestId, setRequestId] = useState('REQ-0002')
  const [date, setDate] = useState('2026-09-05')
  const [start, setStart] = useState('13')
  const [end, setEnd] = useState('15')
  const [error, setError] = useState('')
  // 28-1-08: length 기반 id 대신 단조 증가 카운터 (삭제 기능이 생겨도 중복 없음)
  const nextIdRef = useRef(2)

  const submit = () => {
    setError('')
    try {
      const slot: ScheduleSlot = {
        id: `S-${nextIdRef.current}`,
        partnerId: 'P-001',
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
      if (err instanceof ScheduleError || err instanceof MoneyParseError) setError(err.message)
      else throw err
    }
  }

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
          {[...slots]
            .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
            .map((s) => (
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

function Settlement() {
  const rows = useMemo(() => weeklySettlements(SEED_JOBS), [])
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
