import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE, getVisibleBusinessFields } from "@/lib/constants";

export const metadata: Metadata = {
 title: "회사 소개",
 description: "다다철거 · 다다 종합시공의 철거 상담 안내와 등록 사업자 정보를 확인하세요.",
 alternates: { canonical: "/about" },
};
export default function AboutPage() {
 const businessFields=getVisibleBusinessFields();
 return <div className="mx-auto max-w-3xl px-4 py-10">
  <h1 className="text-[26px] font-bold text-brand-navy [word-break:keep-all] sm:text-3xl">다다철거 · 다다 종합시공</h1>
  <p className="mt-4 leading-8 text-slate-600">철거할 부분과 남겨야 할 부분, 보양과 반출 조건을 정리하며 다음 공간을 준비합니다. 구체적인 작업 범위와 비용·일정은 현장 조건을 확인한 뒤 협의합니다.</p>
  <section className="mt-8">
   <h2 className="text-2xl font-bold text-brand-navy">사업자 정보</h2>
   <p className="mt-3 text-sm leading-7 text-slate-600">사이트 브랜드는 다다철거 · 다다 종합시공이며, 아래에는 기존에 확인된 등록 사업자 정보를 표시합니다.</p>
   <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">{businessFields.map(field=><div key={field.label}><dt className="inline font-semibold">{field.label}: </dt><dd className="inline">{field.value}</dd></div>)}</dl>
  </section>
  <section className="mt-8">
   <h2 className="text-2xl font-bold text-brand-navy">서비스 지역과 상담</h2>
   <p className="mt-3 leading-7 text-slate-600">{SITE.serviceArea}</p>
   <p className="mt-2 text-sm leading-7 text-slate-600">사진과 함께 공간 용도·면적·층수, 철거 및 보존 대상, 희망 일정과 반출 동선을 준비해 주세요.</p>
   <Link href="/estimate" className="mt-4 inline-flex rounded-lg bg-brand-navy px-5 py-4 font-semibold text-white">철거 사진 상담 안내 ↗</Link>
  </section>
  <figure className="mt-8 rounded-xl bg-brand-cream p-4">
   <Image src="/dada/space.svg" width={760} height={720} alt="철거할 부분과 보존할 부분을 구분하는 공간 설명용 그래픽" className="h-auto w-full" />
   <figcaption className="mt-2 text-sm text-slate-600">공간 이해를 위한 설명용 그래픽입니다. 실제 작업 사례나 시공 실적 사진이 아닙니다.</figcaption>
  </figure>
 </div>;
}
