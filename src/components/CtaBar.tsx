import Link from "next/link";
import { BRAND } from "@/lib/constants";

/**
 * 모든 페이지 상단/하단에 공통으로 노출되는 CTA 바.
 * '카카오톡 문의하기'와 '사진 견적 신청하기'를 동일한 비중으로 배치하고,
 * 전화걸기는 보조 버튼으로 작게 둔다.
 */
export default function CtaBar() {
  return (
    <div className="border-y border-black/10 bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-center">
        <a
          href={BRAND.kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg bg-yellow-400 px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-yellow-300 sm:w-auto"
        >
          카카오톡 문의하기
        </a>
        <Link
          href="/estimate"
          className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
        >
          사진 견적 신청하기
        </Link>
        <a
          href={`tel:${BRAND.phone}`}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-sm text-slate-600 transition hover:bg-slate-100 sm:w-auto"
        >
          📞 전화 {BRAND.phone}
        </a>
      </div>
    </div>
  );
}
