import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
// 한 번의 사진상담에서 첨부 가능한 최대 사진 수(필수 3장 + 선택 추가 사진 포함 여유분).
// 클라이언트(EstimateChat)에서도 동일한 개수 제한을 안내하지만, 서버에서도 IP당
// 짧은 시간에 과도한 업로드가 발생하지 않도록 별도의 rate limit으로 방어한다.
const MAX_UPLOADS_PER_WINDOW = 15;
const UPLOAD_WINDOW_MS = 5 * 60 * 1000; // 5분

// EXIF에는 촬영 위치(GPS)·기기 정보 등 개인정보가 포함될 수 있으므로, JPEG/PNG/WEBP는
// sharp로 재인코딩하며 메타데이터를 모두 제거한다(sharp는 withMetadata()를 호출하지
// 않는 한 기본적으로 출력에 메타데이터를 포함하지 않는다). 애니메이션이 있을 수 있는
// GIF는 재인코딩 시 프레임이 깨질 위험이 있어 그대로 통과시킨다(GIF는 일반적으로
// EXIF/GPS 메타데이터를 담지 않는 포맷이다).
async function stripExifIfPossible(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    if (mimeType === "image/jpeg") {
      return await sharp(buffer).rotate().jpeg({ quality: 90 }).toBuffer();
    }
    if (mimeType === "image/png") {
      return await sharp(buffer).rotate().png().toBuffer();
    }
    if (mimeType === "image/webp") {
      return await sharp(buffer).rotate().webp({ quality: 90 }).toBuffer();
    }
    return buffer;
  } catch (error) {
    // 재인코딩에 실패해도 업로드 자체를 막지는 않는다(손상되지 않은 원본을 그대로 사용).
    console.error("[api/upload] EXIF 제거용 재인코딩 실패", error);
    return buffer;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `upload:${ip}`,
    MAX_UPLOADS_PER_WINDOW,
    UPLOAD_WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "업로드 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

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

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await stripExifIfPossible(originalBuffer, file.type);

    // 클라이언트가 보낸 원본 파일명은 신뢰하지 않고, 서버가 생성한 무작위 이름 +
    // 검증된 MIME 타입 기반 확장자만 사용한다.
    const randomName = crypto.randomUUID();
    const filename = `estimate-photos/${randomName}.${extension}`;
    const blob = await put(filename, processedBuffer, {
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
