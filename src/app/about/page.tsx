import type { Metadata } from "next";
import Image from "next/image";
import { SITE, getVisibleBusinessFields } from "@/lib/constants";
import AiExampleBadge from "@/components/AiExampleBadge";

export const metadata: Metadata = {
  title: "회사 소개",
  description: "반듯집수리의 사업자 정보와 서비스 지역을 안내합니다.",
  alternates: { canonical: "/about" },
};

const WORK_PHOTOS = [
  { src: "/brand/switch-outlet-2.png", alt: "스위치·콘센트 클로즈업 작업 현장" },
  { src: "/brand/outlet-switch-3.png", alt: "천장 조명 교체 작업 현장", ai: true },
];

export default function AboutPage() {
  const businessFields = getVisibleBusinessFields();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">
        회사 소개
      </h1>

      {/* 값이 입력된 사업자정보 항목만 표시하고, 미입력 항목은 표시하지 않는다. */}
      {businessFields.length > 0 && (
        <section className="mt-6">
          <h2 className="font-bold text-brand-navy">사업자 정보</h2>
          <dl className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {businessFields.map((field) => (
              <div key={field.label}>
                <dt className="inline font-medium text-slate-700">{field.label}: </dt>
                <dd className="inline">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-bold text-brand-navy">서비스 지역</h2>
        <p className="mt-2 text-sm text-slate-600">{SITE.serviceArea}</p>
        <div className="relative mx-auto mt-4 aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <Image
            src="/brand/service-area-map.png"
            alt="반듯집수리 출장 가능 지역 안내: 서울·경기 전 지역 방문 가능"
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-contain"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-brand-navy">우리가 하는 일</h2>
        <p className="mt-2 text-sm text-slate-600">
          현장에서 직접 진행한 작업 사진으로 반듯집수리가 하는 일을 소개합니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {WORK_PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-square w-full overflow-hidden rounded-lg shadow-sm"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 340px, 50vw"
                className="object-cover"
              />
              {photo.ai && <AiExampleBadge />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
