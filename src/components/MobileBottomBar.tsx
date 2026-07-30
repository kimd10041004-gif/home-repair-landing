import { SITE } from "@/lib/constants";
import { IconChat, IconPhone } from "@/components/icons";

/**
 * 모바일 전용 하단 고정 상담 바(최종 개편안 1번).
 * - 데스크톱 우측 고정 버튼이 숨겨지는 767px 이하 화면에서 "전화 상담 · 카카오 상담"
 *   두 버튼으로 대체한다. 기존에 있던 "사진 상담" 버튼은 여기서 제거하고,
 *   각 페이지 본문의 주 CTA(사진 상담 시작)로만 유지한다.
 * - 각 버튼은 최소 48px 높이를 보장하고, safe-area-inset-bottom을 반영해
 *   기기 하단 제스처 영역과 겹치지 않게 한다.
 * - md 이상 화면에서는 숨기고, 데스크톱은 우측 고정 버튼(DesktopFloatingCta)을 사용한다.
 */
export default function MobileBottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-black/10 bg-white px-3 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <a
        href={`tel:${SITE.phone}`}
        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-navy px-3 text-center text-sm font-semibold text-white"
      >
        <IconPhone className="h-5 w-5 shrink-0" />
        전화 상담
      </a>
      <a
        href={SITE.kakaoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-3 text-center text-sm font-semibold text-slate-900"
      >
        <IconChat className="h-5 w-5 shrink-0" />
        카카오 상담
      </a>
    </div>
  );
}
