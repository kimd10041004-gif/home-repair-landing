import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteDataForAdmin, saveSiteData, sanitizeIncomingSiteData } from "@/lib/siteData";

// 인증은 middleware.ts가 이미 처리한다(이 라우트는 /api/admin/* 매처에 포함됨).

export async function GET() {
  const data = await getSiteDataForAdmin();
  return NextResponse.json(data);
}

const PUBLIC_PATHS_TO_REVALIDATE = ["/", "/services", "/tenant-care", "/smart-home", "/reviews", "/about"];

export async function PUT(req: NextRequest) {
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
