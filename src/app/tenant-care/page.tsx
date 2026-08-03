import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, TENANT_CARE, TENANT_CARE_EXCLUSIONS, TENANT_CARE_MATERIAL_OPTIONS } from "@/lib/constants";
import { getSiteData } from "@/lib/siteData";
import TenantCareForm from "@/components/TenantCareForm";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export const metadata: Metadata = {
  title: `${TENANT_CARE.title} - ${TENANT_CARE.subtitle} | ${BRAND.name}`,
  description: TENANT_CARE.description,
  alternates: { canonical: "/tenant-care" },
};

export const revalidate = 60;

// 최종 개편안 5번: 케어 상세페이지 섹션 순서를
// "제목과 핵심 설명 → 패키지 비교 → 포함·제외 항목 → 자재 준비 방식 →
//  임차인 확인과 기존 부품 인도 → 계약금·취소·A/S 요약 → 상담 신청 → FAQ" 순으로
// 재배치한다. 퇴거 시 리턴서비스처럼 긴 약관은 <details> 접기 영역이나
// /tenant-care/terms, /tenant-care/as 링크로 이동한다.
export default async function TenantCarePage() {
  const site = await getSiteData();
  const tenantCarePackages = site.tenantCarePackages;
  const faqs = site.faqs.filter((f) => f.category === "tenant-care").sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 1. 제목과 핵심 설명 */}
      <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-sm font-semibold text-white">
        세입자·주거 케어
      </span>
      <h1 className="mt-3 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        {TENANT_CARE.title}
      </h1>
      <p className="mt-1 text-base font-semibold text-brand-teal-dark">
        {TENANT_CARE.subtitle}
      </p>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        {site.copy.tenantCareIntro}
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-700">
        {site.copy.tenantCareDescription}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {TENANT_CARE.descriptionSub}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-brand-cream p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
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
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {TENANT_CARE.ctaNotice}
        </p>
      </div>

      {/* 2. 패키지 비교 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">패키지 비교</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-cream text-brand-navy">
              <th className="px-4 py-3 font-bold">패키지</th>
              <th className="px-4 py-3 font-bold">가격</th>
              <th className="px-4 py-3 font-bold">방문</th>
              <th className="px-4 py-3 font-bold">추천 대상</th>
            </tr>
          </thead>
          <tbody>
            {tenantCarePackages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-semibold text-brand-navy">{pkg.name}</td>
                <td className="px-4 py-3 font-bold text-brand-navy">{won(pkg.priceWon)}원</td>
                <td className="px-4 py-3 text-slate-600">{pkg.visitNote}</td>
                <td className="px-4 py-3 text-slate-600">{pkg.targetNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        자재비·출장비 별도이며 공개 가격은 VAT를 포함합니다. {TENANT_CARE.packageFootnote}
      </p>

      {/* 3. 포함·제외 항목 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">포함·제외 항목</h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {tenantCarePackages.map((pkg) => (
          <div key={pkg.id} className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-lg font-bold text-brand-navy">{pkg.name} 포함 기준</h3>
            <ul className="mt-2 flex flex-col gap-0.5 text-sm text-slate-600">
              {pkg.includes.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">패키지 기본 제외 항목</p>
        <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {TENANT_CARE_EXCLUSIONS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-500">{TENANT_CARE.exclusionNotice}</p>
      </div>
      <details className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-700">
        <summary className="cursor-pointer font-semibold text-brand-navy">
          현장에서 추가 작업이 필요하면 어떻게 되나요?
        </summary>
        <p className="mt-2">{TENANT_CARE.extraWorkNotice1}</p>
        <p className="mt-2">{TENANT_CARE.extraWorkNotice2}</p>
      </details>

      {/* 4. 자재 준비 방식 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">자재 준비 안내</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TENANT_CARE_MATERIAL_OPTIONS.map((opt) => (
          <div key={opt.id} className="rounded-2xl border border-slate-200 p-4">
            <h3 className="text-lg font-bold text-brand-navy">{opt.title}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
              {opt.body.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 5. 임차인 확인과 기존 부품 인도 */}
      <h2 id="임차인확인" className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        임차인 확인과 기존 부품 인도
      </h2>
      <div className="mt-4 rounded-2xl border-2 border-brand-navy/40 bg-white p-5">
        <h3 className="text-lg font-bold text-brand-navy">{TENANT_CARE.tenantNoticeTitle}</h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
          {TENANT_CARE.tenantNoticeBody.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-lg font-bold text-brand-navy">{TENANT_CARE.partsHandoverTitle}</h3>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {TENANT_CARE.partsHandoverBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>
      <details className="mt-4 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
        <summary className="cursor-pointer font-bold text-brand-navy">
          {TENANT_CARE.returnServiceTitle} 자세히 보기
        </summary>
        <ul className="mt-2 flex flex-col gap-1">
          {TENANT_CARE.returnServiceBody.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </details>

      {/* 6. 계약금·취소·A/S 요약 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">계약금·취소·A/S 요약</h2>
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{TENANT_CARE.depositNoticeTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{TENANT_CARE.depositNoticeBody[0]}</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{TENANT_CARE.cancelPolicyTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            취소·환불은 관계 법령과 실제 제공된 작업 범위를 기준으로 정산합니다.
          </p>
          <Link href="/tenant-care/terms" className="mt-1 inline-block text-sm font-semibold text-brand-teal-dark">
            변경·취소·환불 안내 자세히 보기 →
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{TENANT_CARE.asPolicyTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            설치·시공상 하자는 작업 완료일로부터 6개월간 무상 A/S가 적용됩니다.
          </p>
          <Link href="/tenant-care/as" className="mt-1 inline-block text-sm font-semibold text-brand-teal-dark">
            A/S 및 보증 안내 자세히 보기 →
          </Link>
        </div>
      </div>
      <details className="mt-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-brand-navy">출장비·진행 절차 자세히 보기</summary>
        <ul className="mt-2 flex flex-col gap-1">
          {TENANT_CARE.travelFeeNotice.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <ol className="mt-3 flex flex-col gap-1">
          {TENANT_CARE.consultFlow.map((step, i) => (
            <li key={step}>
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </details>

      {/* 7. 상담 신청 */}
      <h2 id="tenant-care-form" className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        세입자 안심 케어 상담 신청
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        상세 주소는 방문 견적 또는 일정 확정 단계에서 별도로 안내받습니다.
      </p>
      <div className="mt-4">
        <TenantCareForm packages={tenantCarePackages} />
      </div>

      {/* 8. FAQ */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">자주 묻는 질문</h2>
      <div className="mt-4 flex flex-col gap-3">
        {faqs.map((item) => (
          <details key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand-navy">
              {item.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
