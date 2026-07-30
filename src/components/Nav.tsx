"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ESTIMATE_CTA_LABEL,
  MOBILE_EXTRA_NAV_ITEMS,
  NAV_ITEMS,
  SITE,
} from "@/lib/constants";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image
            src="/brand/logo.png"
            alt={`${SITE.name} 로고`}
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span className="text-lg font-bold text-brand-navy">{SITE.name}</span>
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden items-center gap-x-5 text-sm md:flex lg:text-base">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href)
                  ? "font-semibold text-brand-teal"
                  : "text-slate-600 hover:text-brand-navy"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/estimate"
            className="rounded-lg bg-brand-teal px-4 py-2 font-semibold text-white transition hover:bg-brand-teal-light"
          >
            {ESTIMATE_CTA_LABEL}
          </Link>
        </nav>

        {/* 모바일 햄버거 버튼 */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-brand-navy md:hidden"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 패널 */}
      {menuOpen && (
        <nav
          id="mobile-nav-panel"
          className="flex flex-col gap-1 border-t border-black/10 bg-white px-4 py-3 md:hidden"
        >
          {[...NAV_ITEMS, ...MOBILE_EXTRA_NAV_ITEMS].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`min-h-11 rounded-md px-3 py-3 text-sm ${
                isActive(item.href)
                  ? "bg-brand-cream font-semibold text-brand-teal"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/estimate"
            onClick={() => setMenuOpen(false)}
            className="mt-2 min-h-11 rounded-lg bg-brand-teal px-4 py-3 text-center font-semibold text-white"
          >
            {ESTIMATE_CTA_LABEL}
          </Link>
        </nav>
      )}
    </header>
  );
}
