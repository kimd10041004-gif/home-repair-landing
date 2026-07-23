import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
        <p>{BRAND.businessName} | 대표 {BRAND.businessOwner}</p>
        <p>사업자등록번호 {BRAND.businessRegistrationNumber} | {BRAND.businessAddress}</p>
        <p>서비스 지역: {BRAND.serviceArea} ({BRAND.serviceAreaNote})</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/tenant-care/terms" className="hover:text-brand-navy">
            변경·취소·환불 안내
          </Link>
          <Link href="/tenant-care/as" className="hover:text-brand-navy">
            A/S 및 보증 안내
          </Link>
          <Link href="/tenant-care#임차인확인" className="hover:text-brand-navy">
            세입자 안심 케어 필수 확인사항
          </Link>
        </div>

        <p className="mt-2">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
