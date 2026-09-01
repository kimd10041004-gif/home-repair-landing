import sharp from "sharp";
import { put } from "@vercel/blob";

// 공개 견적 사진 업로드(api/upload)와 관리자 사진 업로드(api/admin/photos)가
// 공유하는 이미지 검증/재인코딩/저장 로직.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const CUSTOMER_UPLOAD_PATH_PREFIX = "estimate-photos";
export const MAX_CUSTOMER_PHOTO_COUNT = 12;
const PUBLIC_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function detectImageMimeType(buffer: Buffer): keyof typeof ALLOWED_IMAGE_TYPES | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
      buffer.subarray(0, 6).toString("ascii") === "GIF89a")
  ) {
    return "image/gif";
  }
  return null;
}

// EXIF에는 촬영 위치(GPS)·기기 정보 등 개인정보가 포함될 수 있으므로, JPEG/PNG/WEBP는
// sharp로 재인코딩하며 메타데이터를 모두 제거한다. GIF는 애니메이션이 깨질 위험이 있어
// 그대로 통과시킨다.
export async function stripExifIfPossible(buffer: Buffer, mimeType: string): Promise<Buffer> {
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
    console.error("[uploadImage] EXIF 제거용 재인코딩 실패", error);
    throw new Error("이미지 디코딩에 실패했습니다.");
  }
}

export async function validateAndProcessImage(
  file: File
): Promise<{ ok: true; buffer: Buffer; extension: string } | { ok: false; error: string; status: number }> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: "이미지 파일(JPEG/PNG/WEBP/GIF)만 업로드할 수 있습니다.", status: 400 };
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: "파일 크기는 10MB 이하만 업로드할 수 있습니다.", status: 400 };
  }
  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const detectedMimeType = detectImageMimeType(originalBuffer);
  if (!detectedMimeType || detectedMimeType !== file.type) {
    return {
      ok: false,
      error: "파일 내용이 실제 JPEG/PNG/WEBP/GIF 이미지와 일치해야 합니다.",
      status: 400,
    };
  }
  try {
    const processedBuffer = await stripExifIfPossible(originalBuffer, file.type);
    return { ok: true, buffer: processedBuffer, extension };
  } catch {
    return { ok: false, error: "손상되었거나 지원되지 않는 이미지 파일입니다.", status: 400 };
  }
}

export function validateSubmittedPhotoUrls(
  photoUrls: unknown,
  options?: { minCount?: number; maxCount?: number }
): { ok: true; urls: string[] } | { ok: false; error: string; status: number } {
  const minCount = options?.minCount ?? 1;
  const maxCount = options?.maxCount ?? MAX_CUSTOMER_PHOTO_COUNT;

  if (!Array.isArray(photoUrls)) {
    return { ok: false, error: `현장사진을 최소 ${minCount}장 이상 첨부해주세요.`, status: 400 };
  }

  if (photoUrls.length < minCount) {
    return { ok: false, error: `현장사진을 최소 ${minCount}장 이상 첨부해주세요.`, status: 400 };
  }
  if (photoUrls.length > maxCount) {
    return { ok: false, error: `현장사진은 최대 ${maxCount}장까지만 첨부할 수 있습니다.`, status: 400 };
  }

  const validatedUrls: string[] = [];
  for (const candidate of photoUrls) {
    if (typeof candidate !== "string" || !candidate.trim()) {
      return { ok: false, error: "사진 URL 형식이 올바르지 않습니다.", status: 400 };
    }

    let parsed: URL;
    try {
      parsed = new URL(candidate);
    } catch {
      return { ok: false, error: "사진 URL 형식이 올바르지 않습니다.", status: 400 };
    }

    if (parsed.protocol !== "https:") {
      return { ok: false, error: "사진 URL 형식이 올바르지 않습니다.", status: 400 };
    }
    if (!parsed.hostname.endsWith(PUBLIC_BLOB_HOST_SUFFIX)) {
      return { ok: false, error: "업로드된 반듯집수리 사진 URL만 제출할 수 있습니다.", status: 400 };
    }
    if (!parsed.pathname.startsWith(`/${CUSTOMER_UPLOAD_PATH_PREFIX}/`) || parsed.search || parsed.hash) {
      return { ok: false, error: "업로드된 반듯집수리 사진 URL만 제출할 수 있습니다.", status: 400 };
    }

    validatedUrls.push(parsed.toString());
  }

  return { ok: true, urls: validatedUrls };
}

export async function uploadImageToBlob(pathPrefix: string, buffer: Buffer, extension: string, contentType: string) {
  const randomName = crypto.randomUUID();
  const filename = `${pathPrefix}/${randomName}.${extension}`;
  return put(filename, buffer, {
    access: "public",
    contentType,
    maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
  });
}
