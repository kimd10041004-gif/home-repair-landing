"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, BRAND } from "@/lib/constants";

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-slate-900">
          {BRAND.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "font-semibold text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
