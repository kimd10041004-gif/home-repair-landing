import { BRAND } from "@/lib/constants";

const HISTORY = [
  { year: "2023", event: "반듯집수리 서비스 시작 (고양·일산 지역)" },
  { year: "2024", event: "서비스 지역을 서울·경기 일부로 확대" },
  { year: "2025", event: "사진 기반 사전 견적 시스템 도입" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        회사 소개
      </h1>

      <section className="mt-6">
        <h2 className="font-bold text-slate-900">사업자 정보</h2>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="inline font-medium text-slate-700">상호: </dt>
            <dd className="inline">{BRAND.businessName}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-700">대표자: </dt>
            <dd className="inline">{BRAND.businessOwner}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-700">사업자등록번호: </dt>
            <dd className="inline">{BRAND.businessRegistrationNumber}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-700">주소: </dt>
            <dd className="inline">{BRAND.businessAddress}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-slate-900">서비스 지역</h2>
        <p className="mt-2 text-sm text-slate-600">{BRAND.serviceArea}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-slate-900">연혁</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {HISTORY.map((item) => (
            <li key={item.year} className="flex gap-3 text-sm">
              <span className="w-14 shrink-0 font-semibold text-blue-600">
                {item.year}
              </span>
              <span className="text-slate-600">{item.event}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
