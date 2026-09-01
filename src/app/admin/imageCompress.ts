// 브라우저에서 실행되는 이미지 압축 유틸. 아이폰 등에서 찍은 고용량 원본 사진을
// 업로드 전에 적당한 크기로 줄여 업로드 시간과 서버 처리 부담을 줄인다.
// (서버 측에서도 sharp로 재인코딩/EXIF 제거를 한 번 더 수행하므로, 여기서는
// "업로드를 빠르게 하기 위한" 용도로만 사용하고 보안 목적의 검증은 서버에 맡긴다.)
export async function compressImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 1600, quality = 0.85 } = options;

  // GIF는 애니메이션이 깨질 수 있어 압축하지 않고 그대로 사용한다.
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".jpg");
    return new File([blob], newName, { type: outputType });
  } catch (error) {
    console.error("[imageCompress] 압축 실패, 원본 파일을 그대로 사용합니다.", error);
    return file;
  }
}
