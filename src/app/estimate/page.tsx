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

      <div className="mt-6">
        <EstimateChat />
      </div>
    </div>
  );
}
