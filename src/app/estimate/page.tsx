import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import EstimateChat from "@/components/EstimateChat";
import "../dada.css";

export const metadata: Metadata = {
  title: "사진 상담",
  description:
    "다다철거 상담은 전화·다다 철거 카카오톡 채널로 진행하세요. 기존 집수리 사진 접수도 이용할 수 있습니다.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  return (
    <div className="dada-home dada-contact-page">
      <section className="contact-hero section-pad">
        <div><div className="eyebrow"><span className="orange-dot" /> DADA / LET’S TALK</div><h1>공간의 다음,<br /><span>사진으로 시작하세요.</span></h1><p>무엇부터 알려야 할지 고민하지 마세요.<br />현장 사진과 지역, 희망 일정부터 보내주시면 됩니다.</p><div className="contact-hero-actions"><a href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer" className="primary-button">카카오톡으로 사진 보내기 <span aria-hidden="true">↗</span></a><a className="contact-phone" href={`tel:${SITE.phone}`}>전화 상담 <strong>{SITE.phone}</strong></a></div><p className="contact-area">서울 · 경기 전 지역 / 그 외 지역 출장비 20만원</p></div>
        <div className="photo-guide"><div className="eyebrow">상담에 도움이 되는 사진 3가지</div><ol><li><span>01</span><div><strong>공간 전체</strong><p>입구에서 안쪽을 향해 넓게 찍어주세요.</p></div></li><li><span>02</span><div><strong>철거할 부분과 남길 부분</strong><p>벽·바닥·천장 등 필요한 부분이 보이도록 찍어주세요.</p></div></li><li><span>03</span><div><strong>출입구와 반출 경로</strong><p>복도·계단·승강기 등 이동 조건을 알려주세요.</p></div></li></ol><p>도면이나 원상복구 조건이 있다면 함께 보내주세요.<br />사진은 카카오톡 채널 <strong>다다 철거</strong>에서 전달할 수 있습니다.</p></div>
      </section>
      <section className="contact-detail section-pad"><div><div className="eyebrow">BEFORE WE BEGIN</div><h2>범위를 함께 확인하고,<br />비용을 이야기합니다.</h2><p>철거 범위와 비용은 면적·층수·반출 조건 등 현장 상황에 따라 달라집니다. 보양, 폐기물 반출·처리, 마무리 정리의 포함 범위를 상담에서 확인해 주세요.</p><Link className="contact-brief-link" href="/#consultation">보낼 내용을 미리 정리하고 싶다면, 상담 메모 만들기 ↗</Link></div>
      <details className="legacy-contact">
        <summary className="cursor-pointer text-lg font-semibold">기존 집수리 사진 접수</summary>
        <p className="mt-4 text-sm leading-7 text-slate-600">생활 집수리·주거 케어·스마트홈 신청서입니다. 철거 견적이나 철거 접수로 처리되는 양식은 아닙니다.</p>
        <div className="mt-6"><EstimateChat /></div>
      </details>
      </section>
    </div>
  );
}
