import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EXTRA_LABOR_FEE_NOTICE, REPAIR_OTHER_CTA, SERVICE_AS_NOTICE } from "@/lib/constants";
import { getSiteData } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "생활 집수리",
  description:
    "수전·배수구·문고리·조명·방충망·욕실주방 소품 등 생활 속 고장과 불편을 필요한 만큼 신청하는 생활 집수리 서비스입니다.",
  alternates: { canonical: "/services" },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const site = await getSiteData();
  const repairCategories = [...site.repairCategories].sort((a, b) => a.order - b.order);
  const repairPolicyNotes = [
    `출장비 방문 1회당 ${site.policy.travelFeeWon.toLocaleString("ko-KR")}원 별도`,
    "자재비 별도",
    "공개 금액은 VAT 포함",
    "가격범위를 표시한 항목도 현장 상태에 따라 최종 금액이 달라질 수 있습니다.",
    "자격이나 등록이 필요한 작업을 직접 할 수 있는 것처럼 표현하지 않습니다.",
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">생활 집수리</h1>
      <p className="mt-2 text-sm text-slate-600">
        고장 나고 불편한 곳을 필요한 만큼 개별로 신청하는 서비스입니다. 세입자·주거
        케어, 스마트홈 IoT 케어와는 별개의 서비스입니다.
      </p>

      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">작업 카테고리</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {repairCategories.map((service) => (
          <div
            key={service.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200"
          >
            {service.imageUrl && (
              <div className="relative h-40 w-full">
                <Image
                  src={service.imageUrl}
                  alt={`${service.title} 작업 사진`}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-lg font-bold text-brand-navy">{service.title}</h3>
              <p className="mt-1 text-sm font-semibold text-brand-teal-dark">
                {service.representativeWork}
              </p>
              <p className="mt-2 flex-1 text-sm text-slate-600">{service.description}</p>
              {service.priceRangeText && (
                <p className="mt-2 text-sm font-bold text-brand-navy">{service.priceRangeText}</p>
              )}
              <p className="mt-2 text-xs font-medium text-slate-500">자재비 별도</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-brand-cream p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{REPAIR_OTHER_CTA.description}</p>
        <Link
          href="/estimate"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-brand-navy px-5 font-semibold text-brand-navy hover:bg-white"
        >
          {REPAIR_OTHER_CTA.title}
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-300 bg-slate-50 p-4">
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-slate-700">
          {repairPolicyNotes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {EXTRA_LABOR_FEE_NOTICE}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <h3 className="text-lg font-bold text-brand-navy">A/S 안내</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{SERVICE_AS_NOTICE}</p>
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
