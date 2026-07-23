import Link from "next/link";
import { BRAND, TENANT_CARE, TENANT_CARE_EXCLUSIONS, TENANT_CARE_FAQ, TENANT_CARE_MATERIAL_OPTIONS, TENANT_CARE_PACKAGES } from "@/lib/constants";
import TenantCareForm from "@/components/TenantCareForm";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export const metadata = {
  title: `${TENANT_CARE.title} - ${TENANT_CARE.subtitle} | ${BRAND.name}`,
  description: TENANT_CARE.description,
};

export default function TenantCarePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 1. 서비스 소개 */}
      <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
        세입자 전용 서비스
      </span>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy sm:text-3xl">
        {TENANT_CARE.title}
      </h1>
      <p className="mt-1 text-base font-semibold text-brand-teal">
        {TENANT_CARE.subtitle}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {TENANT_CARE.intro}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        {TENANT_CARE.description}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {TENANT_CARE.descriptionSub}
      </p>

      {/* 2. 핵심 가격 안내 */}
      <div className="mt-6 rounded-lg border border-brand-teal/30 bg-brand-cream p-5">
        <ul className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
          {TENANT_CARE.heroHighlights.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="#tenant-care-form"
            className="w-full rounded-lg bg-brand-navy px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-navy-dark sm:w-auto"
          >
            {TENANT_CARE.ctaPrimary}
          </a>
          <a
            href={BRAND.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg bg-yellow-400 px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-yellow-300 sm:w-auto"
          >
            {TENANT_CARE.ctaSecondary}
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          {TENANT_CARE.ctaNotice}
        </p>
      </div>

      {/* 3. 패키지 3종 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">
        세입자 안심 케어 패키지
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {TENANT_CARE_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-lg border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-brand-navy">{pkg.name}</h3>
              <span className="text-xs text-slate-500">{pkg.targetNote}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">서울·경기 기본권역</p>
                <p className="mt-1 text-lg font-bold text-brand-navy">
                  총 예상 결제금액 {won(pkg.priceBaseWon)}원부터
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">경기 외곽권역</p>
                <p className="mt-1 text-lg font-bold text-brand-navy">
                  총 예상 결제금액 {won(pkg.priceOuterWon)}원부터
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-brand-teal">
              자재비 별도 (부가가치세 포함 금액입니다)
            </p>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700">포함 기준</p>
              <ul className="mt-1 flex flex-col gap-0.5 text-sm text-slate-600">
                {pkg.includes.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-700">
                선택 가능한 작업 예시
              </p>
              <ul className="mt-1 flex flex-col gap-0.5 text-sm text-slate-600">
                {pkg.examples.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {TENANT_CARE.packageFootnote}
      </p>

      {/* 4. 패키지 제외 항목 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">
        패키지 기본 제외 항목
      </h2>
      <div className="mt-3 rounded-lg border border-slate-200 p-4">
        <ul className="grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {TENANT_CARE_EXCLUSIONS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">{TENANT_CARE.exclusionNotice}</p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
        <p>{TENANT_CARE.extraWorkNotice1}</p>
        <p className="mt-2">{TENANT_CARE.extraWorkNotice2}</p>
      </div>

      {/* 5. 자재 준비 방법 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">자재 준비 안내</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TENANT_CARE_MATERIAL_OPTIONS.map((opt) => (
          <div key={opt.id} className="rounded-lg border border-slate-200 p-4">
            <h3 className="font-bold text-brand-navy">{opt.title}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
              {opt.body.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 6. 임차인 필수 확인 */}
      <div id="임차인확인" className="mt-10 scroll-mt-24 rounded-lg border-2 border-brand-navy/40 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-navy">
          {TENANT_CARE.tenantNoticeTitle}
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
          {TENANT_CARE.tenantNoticeBody.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {/* 7. 기존 부품 인도 */}
      <div className="mt-6 rounded-lg border border-slate-200 p-5">
        <h2 className="font-bold text-brand-navy">{TENANT_CARE.partsHandoverTitle}</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.partsHandoverBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>

      {/* 8. 퇴거 시 리턴 서비스 */}
      <div className="mt-6 rounded-lg border border-slate-200 p-5">
        <h2 className="font-bold text-brand-navy">{TENANT_CARE.returnServiceTitle}</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.returnServiceBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>

      {/* 9. 예약/취소/AS 안내 */}
      <div className="mt-10 flex flex-col gap-3 rounded-lg border border-brand-teal/30 bg-white p-5">
        <h2 className="font-bold text-brand-navy">{TENANT_CARE.depositNoticeTitle}</h2>
        <ul className="flex flex-col gap-1 text-sm leading-relaxed text-slate-700">
          {TENANT_CARE.depositNoticeBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-5">
        <h2 className="font-bold text-brand-navy">{TENANT_CARE.cancelPolicyTitle}</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.cancelPolicyBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <Link href="/tenant-care/terms" className="mt-3 inline-block text-sm font-semibold text-brand-teal">
          변경·취소·환불 안내 자세히 보기 →
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-5">
        <h2 className="font-bold text-brand-navy">{TENANT_CARE.asPolicyTitle}</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.asPolicyBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <Link href="/tenant-care/as" className="mt-3 inline-block text-sm font-semibold text-brand-teal">
          A/S 및 보증 안내 자세히 보기 →
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
        <p className="font-semibold text-slate-700">출장비 안내</p>
        <ul className="mt-1 flex flex-col gap-1">
          {TENANT_CARE.travelFeeNotice.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">
          상담부터 예약 확정까지의 절차
        </p>
        <ol className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.consultFlow.map((step, i) => (
            <li key={step}>
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </div>

      {/* 10. 상담 신청 폼 */}
      <h2 id="tenant-care-form" className="mt-10 scroll-mt-24 text-lg font-bold text-brand-navy">
        세입자 안심 케어 상담 신청
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        상세 주소는 방문 견적 또는 일정 확정 단계에서 별도로 안내받습니다.
      </p>
      <div className="mt-4">
        <TenantCareForm />
      </div>

      {/* 11. FAQ */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">자주 묻는 질문</h2>
      <div className="mt-4 flex flex-col gap-3">
        {TENANT_CARE_FAQ.map((item) => (
          <details key={item.q} className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand-navy">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
