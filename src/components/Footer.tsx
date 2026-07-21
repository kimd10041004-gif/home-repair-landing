import { BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
        <p>{BRAND.businessName} | 대표 {BRAND.businessOwner}</p>
        <p>사업자등록번호 {BRAND.businessRegistrationNumber} | {BRAND.businessAddress}</p>
        <p>서비스 지역: {BRAND.serviceArea}</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
