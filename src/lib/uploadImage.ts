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
    return buffer;
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
  const processedBuffer = await stripExifIfPossible(originalBuffer, file.type);
  return { ok: true, buffer: processedBuffer, extension };
}

export async function uploadImageToBlob(pathPrefix: string, buffer: Buffer, extension: string, contentType: string) {
  const randomName = crypto.randomUUID();
  const filename = `${pathPrefix}/${randomName}.${extension}`;
  return put(filename, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
  });
}
