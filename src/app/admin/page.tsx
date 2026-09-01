import type { Metadata } from "next";
import { getSiteDataForAdmin } from "@/lib/siteData";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

// 관리자 화면은 검색엔진에 노출되면 안 되고(robots 메타 처리), 매번 최신 데이터를
// 보여줘야 하므로 캐시하지 않는다.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getSiteDataForAdmin();
  return <AdminDashboard initialData={data} />;
}
