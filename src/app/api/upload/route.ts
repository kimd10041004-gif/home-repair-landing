import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// 견적 문의용 작업 사진 업로드 전용 엔드포인트. 업로드된 파일의 공개 URL만 반환합니다.
// 비인증 공개 엔드포인트이므로, 임의 파일 호스팅/XSS/피싱/과금 유발을 막기 위해
// 이미지 MIME 타입과 크기를 엄격히 제한하고, 클라이언트가 보낸 파일명은
// 저장 경로에 절대 그대로 쓰지 않는다(확장자만 화이트리스트에서 골라 쓴다).
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "이미지 파일(JPEG/PNG/WEBP/GIF)만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // 클라이언트가 보낸 원본 파일명은 신뢰하지 않고, 서버가 생성한 무작위 이름 +
    // 검증된 MIME 타입 기반 확장자만 사용한다.
    const randomName = crypto.randomUUID();
    const filename = `estimate-photos/${randomName}.${extension}`;
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      maximumSizeInBytes: MAX_SIZE_BYTES,
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
