import Link from "next/link";
import { BRAND } from "@/lib/constants";

const TRUST_POINTS = [
  "사진 기준 예상 견적",
  "작업 전 사전예상액 안내",
  "동의 없는 추가 작업 없음",
  "작업 전후 사진·내역 제공",
  "전화 상담 즉시 가능",
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
        <p className="text-sm font-semibold text-blue-600">
          {BRAND.tagline}, {BRAND.name}
        </p>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          사진으로 먼저 확인하고,
          <br />
          작업 전 금액을 사전예상으로 안내합니다.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          고장 부위 사진을 최소 3장 보내주시면 작업 환경과 예상 범위를 먼저
          확인해 안내드립니다. 현장에서는 작업을 시작하기 전에 사전예상액을
          안내하며, 고객님의 동의 없이 추가 작업을 진행하지 않습니다.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {BRAND.serviceArea}
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/estimate"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-500 sm:w-auto"
          >
            사진 견적 신청하기
          </Link>
          <Link
            href="/services"
            className="w-full rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100 sm:w-auto"
          >
            서비스와 가격 보기
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-2 text-left text-sm text-slate-700 sm:grid-cols-2">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
              <span className="text-green-600">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-black/5 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-lg font-bold text-slate-900">
            반듯집수리는 이런 곳입니다
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">예약형 방문 서비스</p>
              <p className="mt-1 text-sm text-slate-600">
                미리 사진과 정보를 남겨주시면 방문 전에 준비된 상태로 찾아갑니다.
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">사전예상액 안내</p>
              <p className="mt-1 text-sm text-slate-600">
                사진 기준으로 예상 금액을 먼저 안내해드리고, 현장에서 안내드린 금액에 동의 후 작업합니다.
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">기록으로 남는 작업</p>
              <p className="mt-1 text-sm text-slate-600">
                작업 전후 사진과 내역을 제공해 어떤 작업이 이루어졌는지 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
