import { SITE } from "@/lib/constants";

/**
 * 모바일 전용 하단 고정 상담 바.
 * - 전화 상담·사진 상담 두 버튼만 유지해 버튼 반복을 지나치게 만들지 않는다.
 * - 각 버튼은 최소 44px 높이를 보장하고, safe-area-inset-bottom을 반영해
 *   기기 하단 제스처 영역과 겹치지 않게 한다.
 * - md 이상 화면에서는 숨기고, 데스크톱은 헤더의 CTA 버튼을 사용한다.
 */
export default function MobileBottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-black/10 bg-white px-3 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <a
        href={`tel:${SITE.phone}`}
        className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-brand-navy px-3 text-center text-sm font-semibold text-white"
      >
        📞 전화 상담
      </a>
      <a
        href="/estimate"
        className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-brand-teal px-3 text-center text-sm font-semibold text-white"
      >
        사진 상담 시작
      </a>
    </div>
  );
}
