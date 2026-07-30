import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  EXTRA_LABOR_FEE_NOTICE,
  REPAIR_CATEGORIES,
  REPAIR_POLICY_NOTES,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "생활 집수리",
  description:
    "수전·배수구·문고리·조명·방충망·욕실주방 소품 등 생활 속 고장과 불편을 필요한 만큼 신청하는 생활 집수리 서비스입니다.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">생활 집수리</h1>
      <p className="mt-2 text-sm text-slate-600">
        고장 나고 불편한 곳을 필요한 만큼 개별로 신청하는 서비스입니다. 세입자·주거
        케어, 스마트홈 IoT 케어와는 별개의 서비스이며 가격을 함께 표시하지
        않습니다.
      </p>

      <h2 className="mt-10 text-lg font-bold text-brand-navy">작업 카테고리</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPAIR_CATEGORIES.map((service) => (
          <div
            key={service.id}
            className="flex flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm"
          >
            {service.imageSrc && (
              <div className="relative h-40 w-full">
                <Image
                  src={service.imageSrc}
                  alt={`${service.title} 작업 사진`}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-base font-bold text-brand-navy">{service.title}</h3>
              <p className="mt-1 text-sm font-semibold text-brand-teal">
                {service.representativeWork}
              </p>
              <p className="mt-2 flex-1 text-sm text-slate-600">{service.description}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">자재비 별도</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-300 bg-slate-50 p-4">
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-slate-700">
          {REPAIR_POLICY_NOTES.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {EXTRA_LABOR_FEE_NOTICE}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/estimate"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
        >
          사진 3장으로 상담 시작
        </Link>
      </div>
    </div>
  );
}
