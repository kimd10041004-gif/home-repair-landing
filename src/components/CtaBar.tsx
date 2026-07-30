import Link from "next/link";
import { SITE } from "@/lib/constants";

/**
 * 상담 CTA 바(전화·카카오·사진상담 3버튼).
 * 이전 버전과 달리 모든 페이지 상·하단에 전역으로 중복 렌더링하지 않고,
 * 메인페이지의 "마지막 상담" 섹션처럼 실제로 필요한 위치에만 배치한다
 * (전화·카카오·사진상담 버튼을 지나치게 반복하지 않기 위함, 스펙 7번).
 */
export default function CtaBar() {
  return (
    <div className="rounded-2xl border border-black/10 bg-brand-cream">
      <div className="flex flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-center">
        <a
          href={SITE.kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-yellow-400 px-5 text-center font-semibold text-slate-900 transition hover:bg-yellow-300 sm:w-auto"
        >
          카카오톡 문의하기
        </a>
        <Link
          href="/estimate"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-navy px-5 text-center font-semibold text-white transition hover:bg-brand-navy-dark sm:w-auto"
        >
          사진 상담 시작
        </Link>
        <a
          href={`tel:${SITE.phone}`}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-teal px-5 text-center font-semibold text-white transition hover:bg-brand-teal-light sm:w-auto"
        >
          📞 전화 상담 {SITE.phone}
        </a>
      </div>
    </div>
  );
}
