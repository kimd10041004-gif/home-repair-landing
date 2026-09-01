import type { Metadata } from "next";
import Link from "next/link";
import { TENANT_CARE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "변경·취소·환불 안내 | 세입자·주거 케어",
  alternates: { canonical: "/tenant-care/terms" },
};

export default function TenantCareTermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/tenant-care" className="text-sm text-brand-teal-dark">
        ← 세입자·주거 케어로 돌아가기
      </Link>
      <h1 className="mt-3 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        {TENANT_CARE.cancelPolicyTitle}
      </h1>
      <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
        {TENANT_CARE.cancelPolicyBody.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <p className="mt-6 rounded-md bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        본 안내는 세입자·주거 케어 패키지에 적용되는 원칙이며, 세부 위약금 기준표는 별도로
        운영하지 않습니다. 구체적인 청약철회·환불 절차는 상담 시 안내드리는 견적서 또는
        계약 전 별도 문서에서 확인하실 수 있습니다.
      </p>
    </div>
  );
}
