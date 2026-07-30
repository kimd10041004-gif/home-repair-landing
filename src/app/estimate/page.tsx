import type { Metadata } from "next";
import EstimateChat from "@/components/EstimateChat";

export const metadata: Metadata = {
  title: "사진 상담",
  description:
    "생활 집수리, 세입자·주거 케어, 스마트홈 IoT 케어 중 필요한 서비스를 선택해 사진으로 상담을 시작하세요.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">
        사진 상담
      </h1>
      <p className="mt-2 text-base text-slate-600">
        먼저 필요한 서비스를 선택해주세요. 생활 집수리는 이 화면에서 바로 진행되고,
        세입자·주거 케어·스마트홈 IoT 케어는 전용 페이지로 안내해드립니다.
      </p>

      <div className="mt-6">
        <EstimateChat />
      </div>
    </div>
  );
}
