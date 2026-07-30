import Link from "next/link";
import { SITE, getVisibleBusinessFields } from "@/lib/constants";

export default function Footer() {
  const businessFields = getVisibleBusinessFields();

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
        {/* 값이 입력된 사업자정보 항목만 표시하고, 미입력 항목은 빈 라벨도 노출하지 않는다. */}
        {businessFields.length > 0 && (
          <p>{businessFields.map((f) => `${f.label} ${f.value}`).join(" | ")}</p>
        )}
        <p className="mt-1">서비스 지역: {SITE.serviceArea}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/tenant-care/terms" className="hover:text-brand-navy">
            변경·취소·환불 안내
          </Link>
          <Link href="/tenant-care/as" className="hover:text-brand-navy">
            A/S 및 보증 안내
          </Link>
          <Link href="/tenant-care#임차인확인" className="hover:text-brand-navy">
            세입자·주거 케어 필수 확인사항
          </Link>
          <Link href="/about" className="hover:text-brand-navy">
            회사소개
          </Link>
        </div>

        <p className="mt-2">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
