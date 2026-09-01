import { useMemo, useState } from 'react'
import type { RepairRequest, RepairCategory, JobStatus } from './domain/types'
import { EstimateValidationError } from './domain/estimate'
import { nextStatuses } from './domain/jobStatus'
import { slotsOn, ScheduleError } from './domain/schedule'
import {
  PlatformService,
  PlatformError,
  todayUTC,
  type StorageLike,
  type SettlementFilter,
} from './domain/platform'
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

const CATEGORIES: RepairCategory[] = ['누수', '전기', '도배', '타일', '창호', '욕실', '기타']
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

/** localStorage가 실제로 동작하는 환경에서만 반환 (프라이빗 모드 등 대비) */
function browserStorage(): StorageLike | undefined {
  try {
    const s = window.localStorage
    const probe = '__banded_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return undefined
  }
}

/** 최초 실행(복원 데이터 없음)에만 시드 주입 — 진행 요청 3건 + 정산 이력 3건 */
function seedPlatform(p: PlatformService): void {
  p.addRequest({
    customerName: '김하늘',
    region: '서울 강서구',
    category: '누수',
    description: '욕실 천장에서 물이 새요',
    desiredDate: '2026-09-05',
  })
  p.addRequest({
    customerName: '박준서',
    region: '서울 마포구',
    category: '전기',
    description: '거실 콘센트 교체 3곳',
    desiredDate: '2026-09-03',
  })
  p.addRequest({
    customerName: '이서연',
    region: '고양 덕양구',
    category: '도배',
    description: '안방 도배 (곰팡이 제거 포함)',
    desiredDate: '2026-09-10',
  })
  const history = [
    { customerName: '정민호', region: '서울 양천구', category: '욕실' as const, description: '욕실 타일 보수', date: '2026-08-25', hours: [9, 12] as const, labor: 150_000, material: 80_000 },
    { customerName: '한지우', region: '부천 원미구', category: '창호' as const, description: '방충망 교체', date: '2026-08-27', hours: [14, 16] as const, labor: 100_000, material: 20_000 },
    { customerName: '오세라', region: '서울 구로구', category: '타일' as const, description: '주방 벽타일 시공', date: '2026-09-01', hours: [9, 13] as const, labor: 300_000, material: 150_000 },
  ]
  for (const h of history) {
    const r = p.addRequest({
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
    p.scheduleVisit(r.id, { date: h.date, startHour: h.hours[0], endHour: h.hours[1] })
    p.transitionRequest(r.id, 'in_progress')
    p.transitionRequest(r.id, 'completed', { completedDate: h.date })
    p.transitionRequest(r.id, 'settled')
  }
}

function initPlatform(): PlatformService {
  const storage = browserStorage()
  const { service, restored } = PlatformService.load(storage ? { storage } : {})
  if (!restored) seedPlatform(service)
  return service
}

type Tab = 'requests' | 'estimate' | 'schedule' | 'settlement'

export default function App() {
  const [tab, setTab] = useState<Tab>('requests')
  const [platform] = useState(initPlatform)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  return (
    <div className="app">
      <header className="app-header">
        <h1>반듯집수리 파트너</h1>
        <span className="round">28-4 라운드</span>
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
        {tab === 'schedule' && <Schedule platform={platform} onChange={refresh} />}
        {tab === 'settlement' && <Settlement platform={platform} />}
      </main>
    </div>
  )
}

function NewRequestForm({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState<RepairCategory>('누수')
  const [description, setDescription] = useState('')
  const [desiredDate, setDesiredDate] = useState(todayUTC())
  const [error, setError] = useState('')

  if (!open) {
    return (
      <div style={{ marginBottom: 12 }}>
        <button className="badge" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setOpen(true)}>
          + 신규 요청 등록
        </button>
      </div>
    )
  }

  const submit = () => {
    setError('')
    if (customerName.trim() === '' || region.trim() === '' || description.trim() === '') {
      setError('고객명/지역/요청 내용을 모두 입력하세요')
      return
    }
    try {
      platform.addRequest({
        customerName: customerName.trim(),
        region: region.trim(),
        category,
        description: description.trim(),
        desiredDate,
      })
      setCustomerName('')
      setRegion('')
      setDescription('')
      setOpen(false)
      onChange()
    } catch (err) {
      if (isKnownError(err)) setError(err.message)
      else throw err
    }
  }

  return (
    <div className="card form" style={{ marginBottom: 12 }}>
      <label>
        고객명
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </label>
      <label>
        지역
        <input value={region} onChange={(e) => setRegion(e.target.value)} />
      </label>
      <label>
        카테고리
        <select value={category} onChange={(e) => setCategory(e.target.value as RepairCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        요청 내용
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        희망 방문일
        <input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit}>등록</button>
        <button style={{ background: '#9ca3af' }} onClick={() => setOpen(false)}>닫기</button>
      </div>
      {error && <div className="error">{error}</div>}
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
      <NewRequestForm platform={platform} onChange={onChange} />
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
                  {estimate && r.status !== 'cancelled' && <> · 견적 {krw(estimate.breakdown.total)}</>}
                </div>
              </div>
              <span className={`badge ${r.status === 'cancelled' ? 'cancelled' : ''}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
              {nextStatuses(r.status)
                .filter((next) => next !== 'estimated' && next !== 'scheduled')
                .map((next) => (
                  <button key={next} onClick={() => doTransition(r, next)}>
                    → {STATUS_LABEL[next]}
                  </button>
                ))}
              {r.status === 'requested' && <span className="meta">견적은 '견적 제출' 탭에서</span>}
              {r.status === 'accepted' && <span className="meta">방문 예약은 '일정' 탭에서</span>}
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
  const [selectedId, setSelectedId] = useState('')
  // 28-3-04: 선택값이 후보 목록에 없으면 첫 후보로 되돌린다 (렌더마다 유효성 보장)
  const requestId = candidates.some((c) => c.id === selectedId)
    ? selectedId
    : (candidates[0]?.id ?? '')
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
        <select value={requestId} onChange={(e) => setSelectedId(e.target.value)}>
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

function Schedule({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  // 28-3-02: 일정은 플랫폼 상태 — accepted 요청만 예약 가능, 예약 시 scheduled 전이
  const candidates = platform.store.list('accepted')
  const [selectedId, setSelectedId] = useState('')
  const requestId = candidates.some((c) => c.id === selectedId)
    ? selectedId
    : (candidates[0]?.id ?? '')
  const [date, setDate] = useState(todayUTC())
  const [start, setStart] = useState('9')
  const [end, setEnd] = useState('12')
  const [error, setError] = useState('')
  const [filterByDate, setFilterByDate] = useState(false)

  const submit = () => {
    setError('')
    if (!requestId) {
      setError('예약할 요청이 없습니다 — 견적 수락(accepted) 상태의 요청만 예약할 수 있습니다')
      return
    }
    try {
      platform.scheduleVisit(requestId, {
        date,
        startHour: parseHourInput(start),
        endHour: parseHourInput(end),
      })
      onChange()
    } catch (err) {
      if (isKnownError(err)) setError(err.message)
      else throw err
    }
  }

  const slots = platform.scheduleSlots
  const visible = filterByDate
    ? slotsOn(slots, PARTNER_ID, date)
    : [...slots].sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)

  return (
    <div>
      <div className="form" style={{ marginBottom: 16 }}>
        <label>
          요청 선택 (견적 수락 상태)
          <select value={requestId} onChange={(e) => setSelectedId(e.target.value)}>
            {candidates.length === 0 && <option value="">예약 가능한 요청 없음</option>}
            {candidates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} · [{r.category}] {r.description}
              </option>
            ))}
          </select>
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
        <button onClick={submit}>방문 예약</button>
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
          {visible.length === 0 && (
            <tr>
              <td colSpan={3} className="meta">일정이 없습니다</td>
            </tr>
          )}
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
  // 28-3-03: 미정산/정산 확정을 구분해 보여준다
  const [filter, setFilter] = useState<SettlementFilter>('all')
  const rows = platform.settlements(filter)
  const unsettled = platform.unsettledPayout()

  return (
    <div>
      <div className="card row" style={{ marginBottom: 12 }}>
        <span>
          미정산 지급 예정 합계: <strong>{krw(unsettled)}</strong>
        </span>
        <span>
          {(['all', 'unsettled', 'settled'] as const).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              style={{ marginLeft: 6 }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '전체' : f === 'unsettled' ? '미정산' : '정산 완료'}
            </button>
          ))}
        </span>
      </div>
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
              <td colSpan={6} className="meta">해당하는 작업이 없습니다</td>
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
    </div>
  )
}
