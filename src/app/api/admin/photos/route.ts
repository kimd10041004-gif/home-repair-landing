import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAuth";
import { validateAndProcessImage, uploadImageToBlob } from "@/lib/uploadImage";

// 관리자 전용 사진 업로드(작업 예시 사진, 회사소개 사진 등). middleware 외에도 내부 검증을 수행한다.
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.unauthorizedResponse) return auth.unauthorizedResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const result = await validateAndProcessImage(file);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const blob = await uploadImageToBlob("admin-photos", result.buffer, result.extension, file.type);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[api/admin/photos] failed", error);
    return NextResponse.json({ error: "업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}
