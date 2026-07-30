"use client";

/**
 * 데스크톱/태블릿 화면 우측에 고정되는 전화·카카오 상담 버튼(최종 개편안 1번).
 *
 * 화면 너비별 처리:
 * - 1280px 이상: 아이콘+텍스트 버튼
 * - 768~1279px: 52px 원형 아이콘 버튼, 마우스를 올리면 설명 표시
 * - 767px 이하: 완전히 숨김(이 너비에서는 모바일 하단 고정바가 대신한다)
 *
 * 전화 버튼은 터치(전화 가능) 기기에서는 바로 tel: 링크로 연결되고, 마우스 중심의
 * 데스크톱 환경에서는 전화번호와 복사 버튼을 보여주는 작은 팝업을 띄운다.
 * 애니메이션·깜빡임·흔들림은 전혀 사용하지 않는다.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SITE } from "@/lib/constants";
import { IconChat, IconCopy, IconCheck, IconPhone } from "@/components/icons";

// 터치(전화 가능) 기기 여부는 렌더링 도중 setState를 유발하지 않도록
// useSyncExternalStore로 외부 시스템(matchMedia)을 구독한다.
function subscribeTouchPointer(callback: () => void) {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getTouchPointerSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
}
function getTouchPointerServerSnapshot() {
  return false;
}

export default function DesktopFloatingCta() {
  const isTouchDevice = useSyncExternalStore(
    subscribeTouchPointer,
    getTouchPointerSnapshot,
    getTouchPointerServerSnapshot,
  );
  const [popupOpen, setPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popupOpen) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setPopupOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [popupOpen]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SITE.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API를 사용할 수 없는 환경에서는 복사만 조용히 건너뛴다.
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {/* 전화 상담 버튼 */}
      <div className="group relative">
        {isTouchDevice ? (
          <a
            href={`tel:${SITE.phone}`}
            className="flex h-13 w-13 items-center justify-center gap-2 rounded-full bg-brand-navy text-white shadow-sm xl:h-auto xl:w-auto xl:min-h-12 xl:rounded-lg xl:px-5 xl:py-3"
            aria-label={`전화 상담 ${SITE.phone}로 연결`}
          >
            <IconPhone className="h-5 w-5 shrink-0" />
            <span className="hidden text-sm font-semibold xl:inline">전화 상담</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setPopupOpen((v) => !v)}
            aria-expanded={popupOpen}
            aria-haspopup="dialog"
            className="flex h-13 w-13 items-center justify-center gap-2 rounded-full bg-brand-navy text-white shadow-sm xl:h-auto xl:w-auto xl:min-h-12 xl:rounded-lg xl:px-5 xl:py-3"
            aria-label="전화 상담 번호 보기"
          >
            <IconPhone className="h-5 w-5 shrink-0" />
            <span className="hidden text-sm font-semibold xl:inline">전화 상담</span>
          </button>
        )}

        {/* 768~1279px 전용 호버 설명 (아이콘만 보일 때) */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 xl:hidden">
          전화 상담
        </span>

        {popupOpen && !isTouchDevice && (
          <div
            role="dialog"
            aria-label="전화 상담 번호"
            className="absolute right-full top-1/2 mr-3 w-56 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-brand-navy">전화 상담</p>
            <p className="mt-1 text-base font-bold text-brand-navy">{SITE.phone}</p>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${SITE.phone}`}
                className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-brand-navy px-2 text-sm font-semibold text-white"
              >
                전화 걸기
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 px-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-4 w-4" /> 복사됨
                  </>
                ) : (
                  <>
                    <IconCopy className="h-4 w-4" /> 번호 복사
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 카카오 상담 버튼 */}
      <div className="group relative">
        <a
          href={SITE.kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-13 w-13 items-center justify-center gap-2 rounded-full bg-yellow-400 text-slate-900 shadow-sm xl:h-auto xl:w-auto xl:min-h-12 xl:rounded-lg xl:px-5 xl:py-3"
          aria-label="카카오톡 상담 채널 열기"
        >
          <IconChat className="h-5 w-5 shrink-0" />
          <span className="hidden text-sm font-semibold xl:inline">카카오 상담</span>
        </a>
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 xl:hidden">
          카카오 상담
        </span>
      </div>
    </div>
  );
}
