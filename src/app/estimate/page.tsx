import Image from "next/image";
import EstimateChat from "@/components/EstimateChat";

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">
        사진 견적 문의
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        아래 챗봇과 대화하듯 답변해주시면 예상 비용과 방문 일정 상담을 도와드립니다.
      </p>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
        <Image
          src="/brand/estimate-guide-card-v2.png"
          alt="사진 촬영 가이드 - 고장 부위 사진 3장, 전체 공간 사진 1장, 교체 작업 시 측정 사진, 추가 설명"
          fill
          sizes="(min-width: 640px) 672px, 100vw"
          className="object-contain"
        />
      </div>

      <div className="mt-6">
        <EstimateChat />
      </div>
    </div>
  );
}
