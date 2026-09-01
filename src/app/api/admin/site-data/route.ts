import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/adminAuth";
import { getSiteDataForAdmin, saveSiteData, sanitizeIncomingSiteData } from "@/lib/siteData";

// middleware 외에도 라우트 내부에서 세션을 다시 검증해 방어층을 하나 더 둔다.

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.unauthorizedResponse) return auth.unauthorizedResponse;

  const data = await getSiteDataForAdmin();
  return NextResponse.json(data);
}

const PUBLIC_PATHS_TO_REVALIDATE = ["/", "/services", "/tenant-care", "/smart-home", "/reviews", "/about"];

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.unauthorizedResponse) return auth.unauthorizedResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const sanitized = sanitizeIncomingSiteData(body);
    const saved = await saveSiteData(sanitized);

    for (const path of PUBLIC_PATHS_TO_REVALIDATE) {
      try {
        revalidatePath(path);
      } catch (error) {
        console.error(`[api/admin/site-data] revalidatePath(${path}) failed`, error);
      }
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error("[api/admin/site-data] save failed", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
