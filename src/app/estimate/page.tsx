import Image from "next/image";
import EstimateChat from "@/components/EstimateChat";

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">
            사진 견적 문의
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            아래 챗봇과 대화하듯 답변해주시면 예상 비용과 방문 일정 상담을 도와드립니다.
          </p>
        </div>
        <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-xl shadow-sm sm:mx-0">
          <Image
            src="/brand/promo-card-estimate.png"
            alt="고장 부위 사진 3장을 보내주시면 빠르게 안내해드립니다"
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-6">
        <EstimateChat />
      </div>
    </div>
  );
}
