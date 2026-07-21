import { SERVICE_CATEGORIES, PRICE_NOTE } from "@/lib/constants";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        예상 인건비 안내
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        반듯집수리는 자재 준비 여부에 따라 비용 안내 방식이 달라집니다.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-bold text-slate-900">
            고객 자재 준비 시
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            교체할 제품을 고객님이 직접 준비하시면, 보내주신 사진과 작업
            내용을 확인한 뒤 예상 인건비를 먼저 안내드립니다.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-bold text-slate-900">
            자재 준비가 필요한 경우
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            제품 준비가 필요한 경우에는 예상 인건비와 자재비를 구분하여
            안내드립니다.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-bold text-slate-900">
            여러 작업을 함께 신청하는 경우
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            한 번의 방문으로 여러 작업을 요청하시면, 전체 작업 내용과 현장
            조건을 함께 확인해 통합 예상액을 안내드립니다.
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">
        작업 카테고리
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICE_CATEGORIES.map((service) => (
          <div
            key={service.id}
            className="flex flex-col rounded-lg border border-slate-200 p-4 shadow-sm"
          >
            <h3 className="text-base font-bold text-slate-900">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-300 bg-slate-50 p-4">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">
          {PRICE_NOTE}
        </p>
      </div>
    </div>
  );
}
