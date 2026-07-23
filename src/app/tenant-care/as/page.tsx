import Link from "next/link";
import { TENANT_CARE } from "@/lib/constants";

export const metadata = {
  title: "A/S 및 보증 안내 | 세입자 안심 케어",
};

export default function TenantCareAsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/tenant-care" className="text-sm text-brand-teal">
        ← 세입자 안심 케어로 돌아가기
      </Link>
      <h1 className="mt-3 text-xl font-bold text-brand-navy sm:text-2xl">
        {TENANT_CARE.asPolicyTitle}
      </h1>
      <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
        {TENANT_CARE.asPolicyBody.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>

      <h2 className="mt-6 font-bold text-brand-navy">무상 A/S 대상 제외 항목</h2>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
        {TENANT_CARE.asExclusions.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        제품 자체 결함처럼 보이는 경우에도 설치 상태 확인이 필요할 수 있으므로, 먼저
        원인을 확인한 후 시공 문제와 제품 문제를 구분하여 안내해드립니다.
      </p>
    </div>
  );
}
