import type { Metadata } from "next";
import {
  BRAND,
  SMART_HOME,
  SMART_HOME_ANXIETY_OPTION_NOTICE,
  SMART_HOME_COMMON_NOTES,
  SMART_HOME_CUSTOMER_PROTECTION,
  SMART_HOME_EXCLUDED_DEVICES,
  SMART_HOME_FAQ,
  DEPOSIT_POLICY_TEXT,
  SERVICE_AS_NOTICE,
} from "@/lib/constants";
import { getSiteData } from "@/lib/siteData";
import SmartHomeForm from "@/components/SmartHomeForm";
import SmartHomeScenarioPicker from "@/components/SmartHomeScenarioPicker";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export const metadata: Metadata = {
  title: `${SMART_HOME.title} - ${SMART_HOME.subtitle} | ${BRAND.name}`,
  description: SMART_HOME.description,
  alternates: { canonical: "/smart-home" },
};

export const revalidate = 60;

// 최종 개편안 5번: 케어·스마트홈 상세페이지 섹션 순서를
// "생활 변화 중심 히어로 → 시나리오 선택기 → 패키지 비교 → 별도 옵션 →
//  호환성·인터넷·계정 안내 → 상담 신청 → FAQ" 순으로 재배치한다.
// 첫 화면에는 가격 카드보다 "무엇이 편해지는지"를 먼저 보여준다.
export default async function SmartHomePage() {
  const site = await getSiteData();
  const smartHomePackages = site.smartHomePackages;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 생활 변화 중심 히어로 */}
      <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-sm font-semibold text-white">
        스마트홈 IoT 케어
      </span>
      <h1 className="mt-3 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        {SMART_HOME.subtitle}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">{SMART_HOME.description}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-brand-cream p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#smart-home-form"
            className="w-full rounded-lg bg-brand-navy px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-navy-dark sm:w-auto"
          >
            사진으로 상담 시작
          </a>
          <a
            href={BRAND.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg bg-yellow-400 px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-yellow-300 sm:w-auto"
          >
            카카오톡으로 상담하기
          </a>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{SMART_HOME.ctaNotice}</p>
      </div>

      {/* 시나리오 선택기 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">이렇게 편해집니다</h2>
      <div className="mt-4">
        <SmartHomeScenarioPicker />
      </div>

      {/* 패키지 비교 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">스마트홈 IoT 케어 패키지</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{SMART_HOME.priceNote}</p>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {smartHomePackages.map((pkg) => (
          <div key={pkg.id} className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-lg font-bold text-brand-navy">{pkg.name}</h3>
            <p className="mt-1 text-lg font-bold text-brand-navy">
              {won(pkg.priceWon)}원{pkg.priceFrom && "부터"}
            </p>
            <ul className="mt-3 flex flex-col gap-0.5 text-sm text-slate-600">
              <li>· {pkg.deviceLimit}</li>
              <li>· {pkg.automationLimit}</li>
              <li>· {pkg.visitNote}</li>
              {pkg.extraNote && <li>· {pkg.extraNote}</li>}
            </ul>
            <p className="mt-2 text-sm font-semibold text-brand-teal-dark">
              제품비·부자재비·출장비 별도 (부가가치세 포함 금액입니다)
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <ul className="flex flex-col gap-1 text-sm text-slate-600">
          {SMART_HOME_COMMON_NOTES.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      </div>

      {/* 별도 옵션 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">기본 패키지 제외 장비·별도 옵션</h2>
      <div className="mt-3 rounded-2xl border border-slate-200 p-4">
        <ul className="grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {SMART_HOME_EXCLUDED_DEVICES.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-500">{SMART_HOME.windowAutomationNotice}</p>
        <p className="mt-2 text-sm text-slate-500">{SMART_HOME_ANXIETY_OPTION_NOTICE}</p>
      </div>

      {/* 호환성·인터넷·계정 안내 */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">호환성·인터넷·계정 안내</h2>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
          {SMART_HOME_CUSTOMER_PROTECTION.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-lg font-bold text-brand-navy">A/S 안내</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{SERVICE_AS_NOTICE}</p>
      </div>

      {/* 상담 신청 폼 */}
      <h2 id="smart-home-form" className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        스마트홈 IoT 케어 상담 신청
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        상세 주소는 방문 견적 또는 일정 확정 단계에서 별도로 안내받습니다.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{DEPOSIT_POLICY_TEXT}</p>
      <div className="mt-4">
        <SmartHomeForm packages={smartHomePackages} />
      </div>

      {/* FAQ */}
      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">자주 묻는 질문</h2>
      <div className="mt-4 flex flex-col gap-3">
        {SMART_HOME_FAQ.map((item) => (
          <details key={item.q} className="rounded-2xl border border-slate-200 p-4">
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
