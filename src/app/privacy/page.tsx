import type { Metadata } from "next";
import { PRIVACY_POLICY_SECTIONS, SITE, getVisibleBusinessFields } from "@/lib/constants";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "반듯집수리가 수집하는 개인정보의 항목, 목적, 보유기간과 정보주체의 권리를 안내합니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const businessFields = getVisibleBusinessFields();

  return (
    <div className="mx-auto max-w-[680px] px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">개인정보처리방침</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {SITE.name}은(는) 고객님의 개인정보를 소중히 다루며, 「개인정보 보호법」 등
        관계 법령을 준수합니다. 사업자정보 중 아직 확정되지 않은 항목은 값을 임의로
        기재하지 않고 &ldquo;확정 예정&rdquo;으로 표시합니다.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-brand-navy">{section.title}</h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-slate-700">
              {section.body.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="text-lg font-bold text-brand-navy">문의처</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm leading-relaxed text-slate-700">
            {businessFields.length > 0 ? (
              businessFields.map((field) => (
                <li key={field.label}>
                  {field.label}: {field.value}
                </li>
              ))
            ) : (
              <li>사업자정보는 확정 예정입니다.</li>
            )}
            <li>서비스 지역: {SITE.serviceArea}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
