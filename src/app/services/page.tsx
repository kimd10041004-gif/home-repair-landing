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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-bold text-slate-900">
            고객님이 자재를 직접 준비하신 경우
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            고객님이 교체할 제품을 준비하시면 예상 인건비만 안내드립니다.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-bold text-slate-900">
            반듯집수리가 자재를 준비하는 경우
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            제품 준비가 필요한 경우 예상 인건비와 자재비를 나누어 사전에
            안내드립니다.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h2 className="text-base font-bold text-blue-900">인건비 기준</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-blue-800">
          <li>· 시간당 9만원 (총 작업시간 기준)</li>
          <li>· 단독 방문 작업은 기본 작업비 15만원부터</li>
          <li>
            · 여러 작업을 함께 신청하시면 전체 예상 작업시간을 합산해 안내드립니다.
          </li>
        </ul>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        자재비는 제품 종류·규격·브랜드에 따라 달라지므로 사진과 규격 확인 후
        별도로 사전 안내드리며, 고객님의 동의 없이 자재를 구매하거나 추가
        비용을 청구하지 않습니다.
      </p>

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
