import type { Metadata } from "next";
import Image from "next/image";
import WorkCasesTabs from "@/components/WorkCasesTabs";

export const metadata: Metadata = {
  title: "작업 예시",
  description:
    "생활 집수리, 세입자·주거 케어, 스마트홈 IoT 케어별 작업 예시를 실제 사례 여부와 함께 소개합니다.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">작업 예시</h1>
      <p className="mt-2 text-sm text-slate-600">
        서비스별 작업 예시를 실제 사례 여부와 함께 투명하게 안내합니다.
      </p>

      <div className="relative mx-auto mt-6 aspect-[16/9] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <Image
          src="/brand/promo-card-services-2.png"
          alt="반듯집수리 작업 예시 소개 카드"
          fill
          sizes="(min-width: 640px) 512px, 100vw"
          className="object-contain"
        />
      </div>

      <WorkCasesTabs />
    </div>
  );
}
