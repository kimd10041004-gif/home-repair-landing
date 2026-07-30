import type { Metadata } from "next";
import {
  BRAND,
  SMART_HOME,
  SMART_HOME_ANXIETY_OPTION_NOTICE,
  SMART_HOME_COMMON_NOTES,
  SMART_HOME_CUSTOMER_PROTECTION,
  SMART_HOME_EXCLUDED_DEVICES,
  SMART_HOME_FAQ,
  SMART_HOME_PACKAGES,
  SMART_HOME_SCENARIOS,
  DEPOSIT_POLICY_TEXT,
} from "@/lib/constants";
import SmartHomeForm from "@/components/SmartHomeForm";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

export const metadata: Metadata = {
  title: `${SMART_HOME.title} - ${SMART_HOME.subtitle} | ${BRAND.name}`,
  description: SMART_HOME.description,
  alternates: { canonical: "/smart-home" },
};

export default function SmartHomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
        스마트홈 IoT 케어 전용 패키지
      </span>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy sm:text-3xl">
        {SMART_HOME.title}
      </h1>
      <p className="mt-1 text-base font-semibold text-brand-teal">{SMART_HOME.subtitle}</p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{SMART_HOME.description}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{SMART_HOME.priceNote}</p>

      <div className="mt-6 rounded-lg border border-brand-teal/30 bg-brand-cream p-5">
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
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{DEPOSIT_POLICY_TEXT}</p>
      </div>

      {/* 패키지 3종 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">스마트홈 IoT 케어 패키지</h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {SMART_HOME_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="rounded-lg border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-brand-navy">{pkg.name}</h3>
            <p className="mt-1 text-lg font-bold text-brand-navy">
              {won(pkg.priceWon)}원{pkg.priceFrom && "부터"}
            </p>
            <ul className="mt-3 flex flex-col gap-0.5 text-sm text-slate-600">
              <li>· {pkg.deviceLimit}</li>
              <li>· {pkg.automationLimit}</li>
              <li>· {pkg.visitNote}</li>
              {pkg.extraNote && <li>· {pkg.extraNote}</li>}
            </ul>
            <p className="mt-2 text-xs font-semibold text-brand-teal">
              제품비·부자재비·출장비 별도 (부가가치세 포함 금액입니다)
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <ul className="flex flex-col gap-1 text-sm text-slate-600">
          {SMART_HOME_COMMON_NOTES.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      </div>

      {/* 제외 장비 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">기본 패키지 제외 장비·작업</h2>
      <div className="mt-3 rounded-lg border border-slate-200 p-4">
        <ul className="grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {SMART_HOME_EXCLUDED_DEVICES.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">{SMART_HOME.windowAutomationNotice}</p>
      </div>

      {/* 시나리오 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">이렇게 편해집니다</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {/* 고객보호 */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">고객 보호 원칙</h2>
      <div className="mt-3 rounded-lg border-2 border-brand-navy/40 bg-white p-5">
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
          {SMART_HOME_CUSTOMER_PROTECTION.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>

      {/* 상담 신청 폼 */}
      <h2 id="smart-home-form" className="mt-10 scroll-mt-24 text-lg font-bold text-brand-navy">
        스마트홈 IoT 케어 상담 신청
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        상세 주소는 방문 견적 또는 일정 확정 단계에서 별도로 안내받습니다.
      </p>
      <div className="mt-4">
        <SmartHomeForm />
      </div>

      {/* FAQ */}
      <h2 className="mt-10 text-lg font-bold text-brand-navy">자주 묻는 질문</h2>
      <div className="mt-4 flex flex-col gap-3">
        {SMART_HOME_FAQ.map((item) => (
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
