import { SERVICE_CATEGORIES, PRICE_NOTE } from "@/lib/constants";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        서비스와 가격
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        아래 가격은 일반적인 작업 기준 참고 가격대입니다. {PRICE_NOTE}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICE_CATEGORIES.map((service) => (
          <div
            key={service.id}
            className="flex flex-col rounded-lg border border-slate-200 p-4 shadow-sm"
          >
            <h2 className="text-base font-bold text-slate-900">
              {service.title}
            </h2>
            <p className="mt-1 text-lg font-semibold text-blue-600">
              {service.priceRange}
            </p>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
              {PRICE_NOTE}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
