import type { Metadata } from "next";
import Image from "next/image";
import AiExampleBadge from "@/components/AiExampleBadge";
import { DEPOSIT_NOTICE_TEXT, GUIDE_EXTRA_FAQ } from "@/lib/constants";
import { getSiteData } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "이용 안내",
  description: "반듯집수리의 상담부터 작업 완료까지 진행 절차와 계약금 정책을 안내합니다.",
  alternates: { canonical: "/guide" },
};

export const revalidate = 60;

const STEPS = [
  {
    title: "1. 사진 견적 신청",
    desc: "고장 부위 사진 최소 3장과 필요한 정보를 챗봇으로 남겨주시면, 방문 전에 작업 범위와 예상 비용을 먼저 확인해드립니다.",
  },
  {
    title: "2. 방문 및 현장 확인",
    desc: "예약된 일정에 방문하여 현장 상태를 확인합니다. 사전에 안내드린 예상 범위와 실제 현장이 다를 경우, 그 자리에서 다시 설명드립니다.",
  },
  {
    title: "3. 사전예상액 안내 및 동의",
    desc: "작업을 시작하기 전에 사전예상액을 먼저 안내하고, 고객님의 동의를 받은 뒤에만 작업을 진행합니다. 동의 없는 추가 작업은 절대 진행하지 않습니다.",
  },
  {
    title: "4. 작업 진행 및 사진 기록",
    desc: "작업 전/중/후 사진을 촬영하여 어떤 상태에서 어떤 작업이 이루어졌는지 기록으로 남겨드립니다.",
  },
  {
    title: "5. 작업 완료 및 내역 안내",
    desc: "작업이 끝나면 최종 내역과 사진을 다시 한 번 안내해드리고 마무리합니다.",
  },
];

const GUIDE_PHOTOS = [
  { src: "/brand/customer-handoff.png", alt: "작업 완료 후 고객님과 인사하는 모습" },
  { src: "/brand/paint-work-room.png", alt: "도장 작업 준비된 방" },
  { src: "/brand/kitchen-faucet-4.png", alt: "싱크대 배수구 클로즈업 사진 예시" },
  { src: "/brand/doorlock-4.png", alt: "도어락 설치 완료 사진 예시" },
];

export default async function GuidePage() {
  const site = await getSiteData();
  const mainFaqs = site.faqs.filter((f) => f.category === "main").sort((a, b) => a.order - b.order);
  const allFaqs = [
    ...mainFaqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    ...GUIDE_EXTRA_FAQ.map((f, i) => ({ id: `guide-extra-${i}`, question: f.q, answer: f.a })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">
        이용 안내
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        반듯집수리는 아래와 같은 방식으로 작업을 진행합니다.
      </p>

      <div className="relative mx-auto mt-6 aspect-[3/2] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <Image
          src="/brand/collage-8panel.png"
          alt="반듯집수리가 작업을 진행하는 방식 요약"
          fill
          sizes="(min-width: 768px) 576px, 100vw"
          className="object-contain"
        />
        <AiExampleBadge />
      </div>

      <ol className="mt-6 flex flex-col gap-6">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-2xl border border-slate-200 p-4">
            <h3 className="text-lg font-bold text-brand-navy">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        현장 사진으로 보는 작업 모습
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {GUIDE_PHOTOS.map((photo) => (
          <div
            key={photo.src}
            className="relative aspect-square w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 340px, 50vw"
              className="object-cover"
            />
            <AiExampleBadge />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-brand-cream p-5">
        <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">신뢰 포인트</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          작업 시작 전 사전예상액을 고객 동의 하에 안내하며, 동의 없는 추가
          작업은 진행하지 않습니다. 작업 전/중/후 사진을 제공하여 어떤 작업이
          어떻게 이루어졌는지 투명하게 확인하실 수 있습니다.
        </p>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl border border-brand-teal/30 bg-white p-5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
          i
        </span>
        <div>
          <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">계약금 안내</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            생활 집수리(개별 작업)는 계약금이 없습니다. 문의 주시면 사진을 확인한
            후 바로 견적을 안내해 드립니다. 아래 계약금 정책은 세입자·주거
            케어와 스마트홈 IoT 케어에만 적용됩니다.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {DEPOSIT_NOTICE_TEXT}
          </p>
        </div>
      </div>

      {/* 메인페이지 FAQ 6개 + 이용안내 전용 추가 FAQ = 전체 FAQ (최종 개편안 3-⑦) */}
      <h2 id="faq" className="mt-10 scroll-mt-24 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        전체 자주 묻는 질문
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {allFaqs.map((item) => (
          <details key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer text-base font-semibold text-brand-navy">
              {item.question}
            </summary>
            <p className="mt-2 text-base leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
