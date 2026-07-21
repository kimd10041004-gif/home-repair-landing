import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// 견적 문의용 작업 사진 업로드 전용 엔드포인트. 업로드된 파일의 공개 URL만 반환합니다.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const filename = `estimate-photos/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[api/upload] failed", error);
    return NextResponse.json(
      { error: "업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
