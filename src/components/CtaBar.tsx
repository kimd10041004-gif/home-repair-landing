import Link from "next/link";
import { BRAND } from "@/lib/constants";

/**
 * 모든 페이지 상단/하단에 공통으로 노출되는 CTA 바.
 * '카카오톡 문의하기', '사진 견적 신청하기', '전화 상담'을 동일한 비중으로 배치한다.
 */
export default function CtaBar() {
  return (
    <div className="border-y border-black/10 bg-brand-cream">
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
          className="w-full rounded-lg bg-brand-navy px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-navy-dark sm:w-auto"
        >
          사진 견적 신청하기
        </Link>
        <a
          href={`tel:${BRAND.phone}`}
          className="w-full rounded-lg bg-brand-teal px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-teal-light sm:w-auto"
        >
          📞 전화 상담 {BRAND.phone}
        </a>
      </div>
      <p className="pb-3 text-center text-xs text-slate-500">
        지금 바로 전화 상담도 가능합니다.
      </p>
    </div>
  );
}

