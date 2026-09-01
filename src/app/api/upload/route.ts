import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  CUSTOMER_UPLOAD_PATH_PREFIX,
  uploadImageToBlob,
  validateAndProcessImage,
} from "@/lib/uploadImage";

// 견적 문의용 작업 사진 업로드 전용 엔드포인트. 업로드된 파일의 공개 URL만 반환합니다.
// 비인증 공개 엔드포인트이므로, 임의 파일 호스팅/XSS/피싱/과금 유발을 막기 위해
// 이미지 MIME 타입과 크기를 엄격히 제한하고, 클라이언트가 보낸 파일명은
// 저장 경로에 절대 그대로 쓰지 않는다(확장자만 화이트리스트에서 골라 쓴다).
// 한 번의 사진상담에서 첨부 가능한 최대 사진 수(필수 3장 + 선택 추가 사진 포함 여유분).
// 클라이언트(EstimateChat)에서도 동일한 개수 제한을 안내하지만, 서버에서도 IP당
// 짧은 시간에 과도한 업로드가 발생하지 않도록 별도의 rate limit으로 방어한다.
const MAX_UPLOADS_PER_WINDOW = 15;
const UPLOAD_WINDOW_MS = 5 * 60 * 1000; // 5분

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

    const result = await validateAndProcessImage(file);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const blob = await uploadImageToBlob(
      CUSTOMER_UPLOAD_PATH_PREFIX,
      result.buffer,
      result.extension,
      file.type
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[api/upload] failed", error);
    return NextResponse.json(
      { error: "업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
