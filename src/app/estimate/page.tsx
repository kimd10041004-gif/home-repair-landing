import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import EstimateChat from "@/components/EstimateChat";

export const metadata: Metadata = {
  title: "사진 상담",
  description:
    "다다철거 상담은 전화·다다 철거 카카오톡 채널로 진행하세요. 기존 집수리 사진 접수도 이용할 수 있습니다.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">
        사진 상담
      </h1>
      <p className="mt-3 text-base leading-8 text-slate-600">철거할 부분과 남길 부분의 사진, 면적·층수·반출 조건을 준비해 주세요. 철거 범위와 비용은 현장 조건을 확인한 뒤 협의합니다.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`tel:${SITE.phone}`} className="rounded-lg bg-brand-navy px-5 py-4 font-semibold text-white">전화 {SITE.phone}</a>
        <a href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand-navy px-5 py-4 font-semibold">카카오톡으로 사진 상담 ↗</a>
      </div>
      <p className="mt-4 text-sm text-slate-600">카카오톡 채널명은 다다 철거입니다. 카카오톡에서 다다철거로 검색할 수 있습니다.</p>
      <details className="mt-10 rounded-xl border border-slate-200 p-5">
        <summary className="cursor-pointer text-lg font-semibold">기존 집수리 사진 접수</summary>
        <p className="mt-4 text-sm leading-7 text-slate-600">생활 집수리·주거 케어·스마트홈 신청서입니다. 철거 견적이나 철거 접수로 처리되는 양식은 아닙니다.</p>
        <div className="mt-6"><EstimateChat /></div>
      </details>
    </div>
  );
}
