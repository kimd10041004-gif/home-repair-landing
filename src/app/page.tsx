import Image from "next/image";
import Link from "next/link";
import {
  CONSULT_PROCESS_STEPS,
  MAIN_FAQ,
  REPAIR_CATEGORIES,
  SITE,
  SMART_HOME,
  SMART_HOME_ANXIETY_OPTION_NOTICE,
  SMART_HOME_SCENARIOS,
  TENANT_CARE,
  TENANT_CARE_PACKAGES,
  TRUST_CRITERIA,
} from "@/lib/constants";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export default function HomePage() {
  return (
    <div>
      {/* ① 히어로 */}
      <section className="bg-brand-cream">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-brand-teal">
              서울·경기 전 지역 예약형 집수리
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-snug text-brand-navy sm:text-3xl">
              고장 난 곳은 반듯하게,
              <br />
              생활은 더 편리하게.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              생활 집수리부터 세입자·주거 케어, 스마트홈 IoT 설치까지. 필요한
              서비스를 구분해 확인하고 작업 범위와 금액을 안내해드립니다.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/estimate"
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-navy px-6 text-center font-semibold text-white hover:bg-brand-navy-dark sm:w-auto"
              >
                사진 3장으로 상담 시작
              </Link>
              <Link
                href="#service-select"
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-center font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                서비스 한눈에 보기
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md lg:block">
            <Image
              src="/brand/hero-banner.png"
              alt="반듯집수리 작업 현장 이미지"
              fill
              sizes="(min-width: 1024px) 480px, 0px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ② 서비스 선택 */}
      <section id="service-select" className="scroll-mt-20 border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-center text-xl font-bold text-brand-navy sm:text-2xl">
            필요한 서비스를 선택해주세요
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/services"
              className="flex flex-col rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-brand-navy">생활 집수리</h3>
              <p className="mt-1 text-sm font-semibold text-brand-teal">
                고장 나고 불편한 곳을 필요한 만큼
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                수전·배수구·문고리·조명·방충망 같은 생활수리를 개별 신청하는
                서비스입니다.
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">
                자세히 보기 →
              </span>
            </Link>
            <Link
              href="/tenant-care"
              className="flex flex-col rounded-2xl border border-slate-200 bg-brand-cream p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-brand-navy">세입자·주거 케어</h3>
              <p className="mt-1 text-sm font-semibold text-brand-teal">
                여러 작업을 한 번에, 원상복구까지 고려해서
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                입주·퇴거·공실·부모님 댁 정비처럼 여러 설치와 교체를 묶는
                집수리 패키지입니다.
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">
                자세히 보기 →
              </span>
            </Link>
            <Link
              href="/smart-home"
              className="flex flex-col rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-brand-navy">스마트홈 IoT 케어</h3>
              <p className="mt-1 text-sm font-semibold text-brand-teal">
                지금 살고 있는 집을 더 편하고 안전하게
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                조명·플러그·센서·커튼·홈캠·생활가전을 앱과 자동화로 연결하는
                서비스입니다.
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">
                자세히 보기 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ③ 생활 집수리 카테고리 */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-lg font-bold text-brand-navy sm:text-xl">
            생활 집수리 카테고리
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {REPAIR_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col overflow-hidden rounded-lg border border-slate-100 bg-brand-cream shadow-sm"
              >
                {cat.imageSrc && (
                  <div className="relative h-24 w-full">
                    <Image
                      src={cat.imageSrc}
                      alt={`${cat.title} 작업 사진`}
                      fill
                      sizes="(min-width: 640px) 220px, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="text-sm font-bold text-brand-navy">{cat.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{cat.representativeWork}</p>
                  <p className="mt-1 text-[11px] font-medium text-brand-teal">자재비 별도</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/estimate"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              사진상담
            </Link>
          </div>
        </div>
      </section>

      {/* ④ 세입자·주거 케어 */}
      <section className="border-t border-black/5 bg-brand-navy/[0.03]">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-lg font-bold text-brand-navy sm:text-xl">
            여러 집수리를 한 번의 계획으로
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TENANT_CARE_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-bold text-brand-navy">{pkg.name}</h3>
                <p className="mt-1 text-xl font-bold text-brand-navy">
                  {won(pkg.priceWon)}원
                </p>
                <p className="mt-1 text-xs text-slate-500">{pkg.targetNote}</p>
                <p className="mt-1 text-xs font-medium text-brand-teal">
                  {pkg.visitNote} · 자재비·출장비 별도
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/tenant-care"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              {TENANT_CARE.title} 자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ⑤ 스마트홈 IoT */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-lg font-bold text-brand-navy sm:text-xl">
            {SMART_HOME.subtitle}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SMART_HOME_SCENARIOS.map((s) => (
              <div key={s.id} className="rounded-lg border border-slate-100 bg-brand-cream p-4 text-center">
                <span className="text-2xl" aria-hidden="true">
                  {s.icon}
                </span>
                <p className="mt-2 text-sm font-bold text-brand-navy">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            {SMART_HOME_ANXIETY_OPTION_NOTICE}
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/smart-home"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              스마트홈 IoT 케어 자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ⑥ 진행 과정과 신뢰 기준 */}
      <section className="border-t border-black/5 bg-brand-cream">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">진행 과정</h2>
              <ol className="mt-3 flex flex-col gap-2">
                {CONSULT_PROCESS_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-2 text-sm text-slate-700">
                    <span className="font-bold text-brand-teal">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">신뢰 기준</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {TRUST_CRITERIA.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-brand-teal">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ FAQ */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-lg font-bold text-brand-navy sm:text-xl">자주 묻는 질문</h2>
          <div className="mt-5 flex flex-col gap-3">
            {MAIN_FAQ.map((item) => (
              <details key={item.q} className="rounded-lg border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-brand-navy">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ 마지막 상담 */}
      <section className="border-t border-black/5 bg-brand-navy">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            고칠 곳과 바꾸고 싶은 생활을 사진으로 알려주세요.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            공간 전체, 문제 부위, 제품 정보가 보이는 사진을 보내주시면 작업
            가능 범위와 사전예상액을 안내해드립니다.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/estimate"
              className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-teal px-6 text-center font-semibold text-white hover:bg-brand-teal-light sm:w-auto"
            >
              사진 상담 시작
            </Link>
            <a
              href={`tel:${SITE.phone}`}
              className="flex min-h-11 w-full items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 text-center font-semibold text-white hover:bg-white/20 sm:w-auto"
            >
              📞 전화 상담 {SITE.phone}
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-300">
            사진 안내 금액은 사전예상액이며, 최종 금액은 현장 상태와 작업 범위를 확인한 뒤 확정됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
