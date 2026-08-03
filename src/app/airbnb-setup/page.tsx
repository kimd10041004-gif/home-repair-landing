import type { Metadata } from "next";
import {
  AIRBNB_SETUP,
  AIRBNB_SETUP_EXCLUSIONS,
  AIRBNB_SETUP_MATERIAL_OPTIONS,
  BRAND,
} from "@/lib/constants";
import { getSiteData } from "@/lib/siteData";
import AirbnbSetupForm from "@/components/AirbnbSetupForm";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export const metadata: Metadata = {
  title: `${AIRBNB_SETUP.title} - ${AIRBNB_SETUP.subtitle} | ${BRAND.name}`,
  description: AIRBNB_SETUP.description,
  alternates: { canonical: "/airbnb-setup" },
};

export const revalidate = 60;

// 다른 서비스 상세페이지(세입자·주거 케어, 스마트홈)와 동일한 섹션 순서를 따른다.
// "제목과 핵심 설명 → 패키지 비교 → 포함·제외 항목 → 가구·자재 준비 방식 →
//  숙박업 신고·인허가 안내 → 계약금·취소·A/S 요약 → 상담 신청 → FAQ"
export default async function AirbnbSetupPage() {
  const site = await getSiteData();
  const airbnbSetupPackages = site.airbnbSetupPackages;
  const faqs = site.faqs.filter((f) => f.category === "airbnb-setup").sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 1. 제목과 핵심 설명 */}
      <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-sm font-semibold text-white">
        에어비앤비 세팅 케어
      </span>
      <h1 className="mt-3 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        {AIRBNB_SETUP.title}
      </h1>
      <p className="mt-1 text-base font-semibold text-brand-teal-dark">
        {AIRBNB_SETUP.subtitle}
      </p>
      <p className="mt-4 text-base leading-relaxed text-slate-600">{site.copy.airbnbSetupIntro}</p>
      <p className="mt-3 text-base leading-relaxed text-slate-700">
        {site.copy.airbnbSetupDescription}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {AIRBNB_SETUP.descriptionSub}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-brand-cream p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#airbnb-setup-form"
            className="w-full rounded-lg bg-brand-navy px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-navy-dark sm:w-auto"
          >
            {AIRBNB_SETUP.ctaPrimary}
          </a>
          <a
            href={BRAND.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg bg-yellow-400 px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-yellow-300 sm:w-auto"
          >
            {AIRBNB_SETUP.ctaSecondary}
          </a>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{AIRBNB_SETUP.ctaNotice}</p>
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
            {airbnbSetupPackages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-semibold text-brand-navy">{pkg.name}</td>
                <td className="px-4 py-3 font-bold text-brand-navy">
                  {won(pkg.priceWon)}원{pkg.priceFrom && "부터"}
                </td>
                <td className="px-4 py-3 text-slate-600">{pkg.visitNote}</td>
                <td className="px-4 py-3 text-slate-600">{pkg.targetNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        가구비·자재비·출장비 별도이며 공개 가격은 VAT를 포함합니다. {AIRBNB_SETUP.packageFootnote}
      </p>

      {/* 3. 포함·제외 항목 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">포함·제외 항목</h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {airbnbSetupPackages.map((pkg) => (
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
          {AIRBNB_SETUP_EXCLUSIONS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-500">{AIRBNB_SETUP.exclusionNotice}</p>
      </div>
      <details className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-700">
        <summary className="cursor-pointer font-semibold text-brand-navy">
          현장에서 추가 작업이 필요하면 어떻게 되나요?
        </summary>
        <p className="mt-2">{AIRBNB_SETUP.extraWorkNotice1}</p>
        <p className="mt-2">{AIRBNB_SETUP.extraWorkNotice2}</p>
      </details>

      {/* 4. 가구·자재 준비 방식 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">가구·자재 준비 안내</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AIRBNB_SETUP_MATERIAL_OPTIONS.map((opt) => (
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

      {/* 5. 숙박업 신고·인허가 안내 */}
      <h2
        id="숙박업신고안내"
        className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]"
      >
        {AIRBNB_SETUP.licenseNoticeTitle}
      </h2>
      <div className="mt-4 rounded-2xl border-2 border-brand-navy/40 bg-white p-5">
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
          {AIRBNB_SETUP.licenseNoticeBody.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {/* 6. 계약금·취소·A/S 요약 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">계약금·취소·A/S 요약</h2>
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{AIRBNB_SETUP.depositNoticeTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {AIRBNB_SETUP.depositNoticeBody[0]}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{AIRBNB_SETUP.cancelPolicyTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {AIRBNB_SETUP.cancelPolicyBody[0]}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{AIRBNB_SETUP.asPolicyTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {AIRBNB_SETUP.asPolicyBody[0]}
          </p>
        </div>
      </div>
      <details className="mt-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-brand-navy">출장비·진행 절차 자세히 보기</summary>
        <ul className="mt-2 flex flex-col gap-1">
          {AIRBNB_SETUP.travelFeeNotice.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <ol className="mt-3 flex flex-col gap-1">
          {AIRBNB_SETUP.consultFlow.map((step, i) => (
            <li key={step}>
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </details>

      {/* 7. 상담 신청 */}
      <h2
        id="airbnb-setup-form"
        className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]"
      >
        에어비앤비 세팅 케어 상담 신청
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        상세 주소는 방문 견적 또는 일정 확정 단계에서 별도로 안내받습니다.
      </p>
      <div className="mt-4">
        <AirbnbSetupForm />
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
