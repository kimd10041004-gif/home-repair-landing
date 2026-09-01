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
  requested: '입찰 가능',
  estimated: '입찰 중',
  accepted: '낙찰',
  scheduled: '방문 예정',
  in_progress: '시공 중',
  completed: '작업 완료',
  settled: '정산 완료',
  lost: '미낙찰',
  cancelled: '취소',
}

const CATEGORIES: RepairCategory[] = ['누수', '전기', '도배', '타일', '창호', '욕실', '기타']
const PARTNER_ID = 'P-001'
const krw = (n: number) => `${n.toLocaleString('ko-KR')}원`

function dday(deadline: string | undefined, today: string): string {
  if (!deadline) return ''
  const diff = Math.round(
    (Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000,
  )
  if (diff < 0) return '마감'
  return diff === 0 ? 'D-Day' : `D-${diff}`
}

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

/** 최초 실행(복원 데이터 없음)에만 시드 주입 — 입찰 가능 일감 3건 + 정산 이력 3건 */
function seedPlatform(p: PlatformService): void {
  p.addRequest({
    customerName: '김하늘',
    region: '서울 강서구',
    category: '누수',
    description: '욕실 천장에서 물이 새요',
    desiredDate: '2026-09-05',
    budget: 380_000,
    bidDeadline: '2026-09-03',
  })
  p.addRequest({
    customerName: '박준서',
    region: '서울 마포구',
    category: '전기',
    description: '거실 콘센트 교체 3곳',
    desiredDate: '2026-09-03',
    budget: 120_000,
    bidDeadline: '2026-09-02',
  })
  p.addRequest({
    customerName: '이서연',
    region: '고양 덕양구',
    category: '도배',
    description: '안방 도배 (곰팡이 제거 포함)',
    desiredDate: '2026-09-10',
    budget: 210_000,
    bidDeadline: '2026-09-07',
  })
  const history = [
    { customerName: '정민호', region: '서울 양천구', category: '욕실' as const, description: '욕실 타일 보수', date: '2026-08-25', hours: [9, 12] as const, labor: 150_000, material: 80_000, extra: 0 },
    { customerName: '한지우', region: '부천 원미구', category: '창호' as const, description: '방충망 교체', date: '2026-08-27', hours: [14, 16] as const, labor: 100_000, material: 20_000, extra: 0 },
    { customerName: '오세라', region: '서울 구로구', category: '타일' as const, description: '주방 벽타일 시공', date: '2026-09-01', hours: [9, 13] as const, labor: 300_000, material: 150_000, extra: 50_000 },
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
      memo: '꼼꼼하고 정직한 시공을 약속드립니다.',
    })
    p.transitionRequest(r.id, 'accepted')
    p.scheduleVisit(r.id, { date: h.date, startHour: h.hours[0], endHour: h.hours[1] })
    p.transitionRequest(r.id, 'in_progress')
    if (h.extra > 0) {
      p.approveExtraWork(r.id, { amount: h.extra, memo: '곰팡이 제거 추가', approvedDate: h.date })
    }
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

type Tab = 'dashboard' | 'jobs' | 'work' | 'schedule' | 'settlement'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [platform] = useState(initPlatform)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  return (
    <div className="app">
      <header className="app-header">
        <h1>반듯집수리 파트너</h1>
        <span className="round">28-7 라운드</span>
      </header>
      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          대시보드
        </button>
        <button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>
          일감·입찰
        </button>
        <button className={tab === 'work' ? 'active' : ''} onClick={() => setTab('work')}>
          내 작업
        </button>
        <button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>
          일정
        </button>
        <button className={tab === 'settlement' ? 'active' : ''} onClick={() => setTab('settlement')}>
          정산
        </button>
      </nav>
      <main className="panel">
        {tab === 'dashboard' && <Dashboard platform={platform} onChange={refresh} />}
        {tab === 'jobs' && <Jobs platform={platform} onChange={refresh} />}
        {tab === 'work' && <Work platform={platform} onChange={refresh} />}
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
  const [budget, setBudget] = useState('')
  const [bidDeadline, setBidDeadline] = useState('')
  const [error, setError] = useState('')

  if (!open) {
    return (
      <div style={{ marginBottom: 12 }}>
        <button className="badge" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setOpen(true)}>
          + 일감 등록 (고객 요청 시뮬레이션)
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
    if (desiredDate < todayUTC()) {
      setError(`희망 방문일은 오늘(${todayUTC()}) 이후여야 합니다`)
      return
    }
    try {
      platform.addRequest({
        customerName: customerName.trim(),
        region: region.trim(),
        category,
        description: description.trim(),
        desiredDate,
        ...(budget.trim() !== '' ? { budget: parseWonInput(budget) } : {}),
        ...(bidDeadline !== '' ? { bidDeadline } : {}),
      })
      setCustomerName('')
      setRegion('')
      setDescription('')
      setBudget('')
      setBidDeadline('')
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
      <label>
        예산 (원, 선택)
        <input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="numeric" placeholder="예: 380000" />
      </label>
      <label>
        입찰 마감일 (선택)
        <input type="date" value={bidDeadline} onChange={(e) => setBidDeadline(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit}>등록</button>
        <button style={{ background: '#9ca3af' }} onClick={() => setOpen(false)}>닫기</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  )
}

/** 일감·입찰 탭 (28-6-01): 입찰 가능/입찰 중 일감 + 입찰 폼 + 낙찰·미낙찰 처리 */
function Jobs({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const today = todayUTC()
  const jobs = platform.store
    .list()
    .filter((r) => r.status === 'requested' || r.status === 'estimated')
  const [error, setError] = useState('')

  const decide = (r: RepairRequest, to: JobStatus) => {
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
      <BidForm platform={platform} onChange={onChange} />
      {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
      {jobs.length === 0 && <div className="meta">입찰 가능한 일감이 없습니다</div>}
      {jobs.map((r) => {
        const bid = platform.getEstimate(r.id)
        const d = dday(r.bidDeadline, today)
        return (
          <div key={r.id} className="card">
            <div className="row">
              <div>
                <h3>
                  [{r.category}] {r.description}
                </h3>
                <div className="meta">
                  {r.id} · {r.customerName} · {r.region} · 희망일 {r.desiredDate}
                  {r.budget !== undefined && <> · 예산 {krw(r.budget)}</>}
                  {d && <> · {d}</>}
                </div>
                {bid && (
                  <div className="meta">
                    내 제안: {krw(bid.breakdown.total)}
                    {bid.estimate.memo && <> · "{bid.estimate.memo}"</>}
                  </div>
                )}
              </div>
              <span className="badge">{STATUS_LABEL[r.status]}</span>
            </div>
            {r.status === 'estimated' && (
              <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
                <span className="meta">고객 결정 시뮬레이션:</span>
                <button onClick={() => decide(r, 'accepted')}>낙찰</button>
                <button style={{ background: '#9ca3af' }} onClick={() => decide(r, 'lost')}>
                  미낙찰
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** 입찰 제안 폼 (28-6-01): 제안 금액 구성 + 고객 메시지 */
function BidForm({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const candidates = platform.store
    .list()
    .filter((r) => r.status === 'requested' || r.status === 'estimated')
  const [selectedId, setSelectedId] = useState('')
  const requestId = candidates.some((c) => c.id === selectedId)
    ? selectedId
    : (candidates[0]?.id ?? '')
  const [labor, setLabor] = useState('150000')
  const [material, setMaterial] = useState('80000')
  const [transport, setTransport] = useState('20000')
  const [discount, setDiscount] = useState('0')
  const [memo, setMemo] = useState('')
  const [message, setMessage] = useState('')

  const parsed = useMemo(() => {
    try {
      const trimmedMemo = memo.trim()
      return {
        ok: true as const,
        input: {
          laborCost: parseWonInput(labor),
          materialCost: parseWonInput(material),
          transportCost: parseWonInput(transport),
          discount: parseWonInput(discount),
          ...(trimmedMemo !== '' ? { memo: trimmedMemo } : {}),
        },
      }
    } catch (err) {
      if (isKnownError(err)) return { ok: false as const, message: err.message }
      throw err
    }
  }, [labor, material, transport, discount, memo])

  const submit = () => {
    setMessage('')
    if (!parsed.ok) return
    if (!requestId) {
      setMessage('입찰할 일감을 선택하세요')
      return
    }
    try {
      const breakdown = platform.submitEstimate(requestId, PARTNER_ID, parsed.input)
      setMessage(
        `입찰 제안 완료 — 제안 금액 ${krw(breakdown.total)} (수수료 3% 차감 시 지급액 ${krw(breakdown.partnerPayout)})`,
      )
      onChange()
    } catch (err) {
      if (isKnownError(err)) setMessage(err.message)
      else throw err
    }
  }

  return (
    <div className="card form" style={{ marginBottom: 12 }}>
      <h3 style={{ margin: 0 }}>입찰하기</h3>
      <label>
        일감 선택
        <select value={requestId} onChange={(e) => setSelectedId(e.target.value)}>
          {candidates.length === 0 && <option value="">입찰 가능한 일감 없음</option>}
          {candidates.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} · [{r.category}] {r.description}
              {r.budget !== undefined ? ` (예산 ${krw(r.budget)})` : ''}
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
      <label>
        고객에게 남길 메시지 (선택)
        <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 꼼꼼하고 정직한 시공을 약속드립니다" />
      </label>
      <button onClick={submit} disabled={!parsed.ok}>입찰 제안하기</button>
      {!parsed.ok && <div className="error">{parsed.message}</div>}
      {message && <div className="breakdown card">{message}</div>}
    </div>
  )
}

/** 내 작업 탭: 낙찰 이후 진행 흐름 + 추가 작업 승인 (28-6-02) */
function Work({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const active = platform.store
    .list()
    .filter((r) =>
      ['accepted', 'scheduled', 'in_progress', 'completed', 'settled', 'lost', 'cancelled'].includes(
        r.status,
      ),
    )
  const [error, setError] = useState('')

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
      {active.length === 0 && <div className="meta">진행 중인 작업이 없습니다</div>}
      {active.map((r) => {
        const bid = platform.getEstimate(r.id)
        const extras = platform.extraWorksFor(r.id)
        const extraSum = extras.reduce((s, e) => s + e.amount, 0)
        return (
          <div key={r.id} className="card">
            <div className="row">
              <div>
                <h3>
                  [{r.category}] {r.description}
                </h3>
                <div className="meta">
                  {r.id} · {r.customerName} · {r.region} · 희망일 {r.desiredDate}
                  {bid && r.status !== 'cancelled' && r.status !== 'lost' && (
                    <> · 낙찰 금액 {krw(bid.breakdown.total)}</>
                  )}
                  {extraSum > 0 && <> · 추가 작업 +{krw(extraSum)}</>}
                </div>
                {extras.map((e) => (
                  <div key={e.id} className="meta">
                    └ {e.memo || '추가 작업'} +{krw(e.amount)} ({e.approvedDate})
                  </div>
                ))}
              </div>
              <span
                className={`badge ${r.status === 'cancelled' || r.status === 'lost' ? 'cancelled' : ''}`}
              >
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
              {nextStatuses(r.status)
                .filter((next) => next !== 'estimated' && next !== 'scheduled' && next !== 'lost')
                .map((next) => (
                  <button key={next} onClick={() => doTransition(r, next)}>
                    → {STATUS_LABEL[next]}
                  </button>
                ))}
              {r.status === 'accepted' && <span className="meta">방문 예약은 '일정' 탭에서</span>}
            </div>
            {r.status === 'in_progress' && (
              <ExtraWorkForm platform={platform} requestId={r.id} onChange={onChange} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** 추가 작업 승인 폼 (28-6-02): 고객 승인 금액을 기록 */
function ExtraWorkForm({
  platform,
  requestId,
  onChange,
}: {
  platform: PlatformService
  requestId: string
  onChange: () => void
}) {
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    setError('')
    try {
      platform.approveExtraWork(requestId, { amount: parseWonInput(amount), memo })
      setAmount('')
      setMemo('')
      onChange()
    } catch (err) {
      if (isKnownError(err)) setError(err.message)
      else throw err
    }
  }

  return (
    <div className="form" style={{ marginTop: 8, maxWidth: 420 }}>
      <div className="meta">추가 작업 승인 (고객 수락 금액)</div>
      <label>
        금액 (원)
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="예: 50000" />
      </label>
      <label>
        내용
        <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 곰팡이 제거" />
      </label>
      <button onClick={submit}>추가 작업 반영</button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}

function Dashboard({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
  const today = todayUTC()
  const todaySlots = slotsOn(platform.scheduleSlots, PARTNER_ID, today)
  const upcoming = platform.upcomingSlots(today, 5)
  const counts = platform.statusCounts()
  const unsettled = platform.unsettledPayout()
  const [backupMsg, setBackupMsg] = useState('')

  const doExport = () => {
    const blob = new Blob([platform.exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `banded-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
    setBackupMsg('백업 파일을 내려받았습니다')
  }

  const doImport = (file: File | undefined) => {
    setBackupMsg('')
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        platform.importSnapshot(String(reader.result))
        setBackupMsg('백업을 복원했습니다')
        onChange()
      } catch (err) {
        if (isKnownError(err)) setBackupMsg(err.message)
        else throw err
      }
    }
    reader.readAsText(file)
  }

  const activeStatuses = (
    ['requested', 'estimated', 'accepted', 'scheduled', 'in_progress', 'completed'] as const
  ).filter((s) => counts[s] > 0)

  return (
    <div>
      <div className="card row">
        <span>
          입찰 가능 일감: <strong>{counts.requested}건</strong> · 입찰 중:{' '}
          <strong>{counts.estimated}건</strong>
        </span>
        <span>
          미정산 지급 예정: <strong>{krw(unsettled)}</strong>
        </span>
      </div>
      <div className="card">
        <h3>오늘 방문 일정 ({today})</h3>
        {todaySlots.length === 0 && <div className="meta">오늘 예정된 방문이 없습니다</div>}
        {todaySlots.map((s) => {
          const req = platform.store.get(s.requestId)
          return (
            <div key={s.id} className="meta" style={{ padding: '4px 0' }}>
              {String(s.startHour).padStart(2, '0')}:00~{String(s.endHour).padStart(2, '0')}:00 ·{' '}
              {req ? `${req.customerName} · [${req.category}] ${req.description} (${req.region})` : s.requestId}
              {req && <span className="badge" style={{ marginLeft: 6 }}>{STATUS_LABEL[req.status]}</span>}
            </div>
          )
        })}
      </div>
      <div className="card">
        <h3>다가오는 일정</h3>
        {upcoming.length === 0 && <div className="meta">예정된 일정이 없습니다</div>}
        {upcoming.map((s) => {
          const req = platform.store.get(s.requestId)
          return (
            <div key={s.id} className="meta" style={{ padding: '4px 0' }}>
              {s.date} {String(s.startHour).padStart(2, '0')}:00 ·{' '}
              {req ? `${req.customerName} · [${req.category}] ${req.description}` : s.requestId}
            </div>
          )
        })}
      </div>
      <div className="card">
        <h3>진행 현황</h3>
        {activeStatuses.length === 0 && <div className="meta">진행 중인 요청이 없습니다</div>}
        <div className="row" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
          {activeStatuses.map((s) => (
            <span key={s} className="badge">
              {STATUS_LABEL[s]} {counts[s]}
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>데이터 백업</h3>
        <div className="row" style={{ justifyContent: 'flex-start', gap: 8 }}>
          <button onClick={doExport}>JSON 내보내기</button>
          <label className="meta" style={{ cursor: 'pointer' }}>
            가져오기
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => doImport(e.target.files?.[0])}
            />
          </label>
        </div>
        {backupMsg && <div className="meta" style={{ marginTop: 6 }}>{backupMsg}</div>}
      </div>
    </div>
  )
}

function Schedule({ platform, onChange }: { platform: PlatformService; onChange: () => void }) {
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
      setError('예약할 작업이 없습니다 — 낙찰(accepted) 상태의 작업만 예약할 수 있습니다')
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
          작업 선택 (낙찰 상태)
          <select value={requestId} onChange={(e) => setSelectedId(e.target.value)}>
            {candidates.length === 0 && <option value="">예약 가능한 작업 없음</option>}
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
            <th>고객 / 공사</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && (
            <tr>
              <td colSpan={4} className="meta">일정이 없습니다</td>
            </tr>
          )}
          {visible.map((s) => {
            const req = platform.store.get(s.requestId)
            return (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td>
                  {String(s.startHour).padStart(2, '0')}:00~{String(s.endHour).padStart(2, '0')}:00
                </td>
                <td>{s.requestId}</td>
                <td>{req ? `${req.customerName} · [${req.category}] ${req.description}` : '-'}</td>
              </tr>
            )
          })}
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
  const monthly = platform.monthlyReport()

  return (
    <div>
      <div className="card">
        <h3>월별 요약</h3>
        <table>
          <thead>
            <tr>
              <th>월</th>
              <th className="num">건수</th>
              <th className="num">총액</th>
              <th className="num">수수료(3%)</th>
              <th className="num">지급액</th>
              <th className="num">미정산</th>
            </tr>
          </thead>
          <tbody>
            {monthly.length === 0 && (
              <tr>
                <td colSpan={6} className="meta">완료된 작업이 없습니다</td>
              </tr>
            )}
            {monthly.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td className="num">{m.jobCount}</td>
                <td className="num">{krw(m.totalAmount)}</td>
                <td className="num">{krw(m.totalFee)}</td>
                <td className="num">{krw(m.payout)}</td>
                <td className="num">{krw(m.unsettledPayout)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
