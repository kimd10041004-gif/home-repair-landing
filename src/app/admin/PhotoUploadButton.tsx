"use client";

import { useRef, useState } from "react";
import { compressImageFile } from "./imageCompress";

type Props = {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
};

// 드래그앤드롭 + 파일선택 버튼 겸용 사진 업로드 컴포넌트.
// 모바일에서 아이폰 카메라로 찍은 사진도 바로 선택/촬영해서 올릴 수 있도록
// <input type="file" accept="image/*"> 를 사용한다.
export default function PhotoUploadButton({ currentUrl, onUploaded, label = "사진 업로드" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/admin/photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
          dragOver ? "border-brand-teal-dark bg-brand-cream" : "border-slate-300"
        }`}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className="h-32 w-full rounded-lg object-cover" />
        ) : (
          <p className="text-sm text-slate-500">사진을 끌어다 놓거나 아래 버튼으로 선택하세요.</p>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="min-h-11 rounded-lg border border-brand-navy px-4 text-sm font-semibold text-brand-navy hover:bg-brand-cream disabled:opacity-60"
        >
          {uploading ? "업로드 중..." : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
