"use client";
import { usePathname } from "next/navigation";
const legacyRoutes = ["/services", "/tenant-care", "/smart-home", "/airbnb-setup", "/reviews", "/guide", "/terms", "/as"];
export default function LegacyServiceNotice() {
 const path=usePathname();
 if(!legacyRoutes.some(route=>path===route || path.startsWith(`${route}/`))) return null;
 return <aside className="legacy-service-notice">기존 반듯집수리 서비스 안내입니다. 이 페이지의 가격·패키지·작업 예시는 철거 서비스의 가격이나 실적이 아닙니다. 철거 범위와 비용은 별도 상담으로 확인해 주세요.</aside>;
}
