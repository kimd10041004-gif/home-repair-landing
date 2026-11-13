import Image from "next/image";
import Link from "next/link";
import HeroVideos from "./HeroVideos";
import ConsultationBrief from "./ConsultationBrief";
import YouTubeGallery from "./YouTubeGallery";
import { SITE } from "@/lib/constants";

const services = [
  { number: "01", title: "상가 · 사무실", en: "COMMERCIAL", image: "/dada/film/dada-brand-desktop.jpg", width: 1344, height: 768, description: "이전과 폐업, 새로운 시작을 앞둔 공간의 내부 철거.", detail: "내부 철거 · 집기 · 마감" },
  { number: "02", title: "주택 · 부분 철거", en: "RESIDENTIAL", image: "/dada/editorial/residential.webp", width: 1122, height: 1402, description: "철거할 곳과 남길 곳을 구분하는 필요한 만큼의 작업.", detail: "주방 · 욕실 · 바닥 · 천장" },
  { number: "03", title: "원상복구", en: "RESTORATION", image: "/dada/editorial/material-study.webp", width: 1122, height: 1402, description: "임대차 조건과 인계 기준에 맞춰 정리하는 작업 범위.", detail: "반환 조건 · 복구 범위 협의" },
];
const principles = [
  ["01", "비울 곳과 남길 곳의 구분", "철거 대상과 보존할 마감·설비를 함께 확인합니다. 구조와 설비의 상태는 현장에서 확인합니다."],
  ["02", "작업 공간 밖까지 살피는 시선", "출입구·복도·승강기, 차량 접근과 공용부 보양 범위를 먼저 살펴봅니다."],
  ["03", "마무리까지 분명한 작업 범위", "폐기물 반출·처리와 정리 범위, 다음 공정을 위한 인계 상태를 사전에 협의합니다."],
];
const questions = [
  ["어느 지역까지 작업하나요?", "서울·경기 전 지역에서 작업합니다. 그 외 지역은 출장비 20만원이 발생하며, 현장 위치와 작업 범위는 상담에서 확인합니다."],
  ["사진만으로 견적을 받을 수 있나요?", "사진으로 공간과 작업 범위를 먼저 확인할 수 있습니다. 실제 비용과 일정은 면적, 구조·설비 상태, 반출 조건, 폐기물 종류와 양 등에 따라 달라져 현장 확인 후 협의가 필요할 수 있습니다."],
  ["부분 철거도 상담할 수 있나요?", "네. 철거할 부분과 남길 부분을 각각 알려주세요. 두 범위가 맞닿는 사진과 후속 공사 계획이 있으면 상담에 도움이 됩니다. 작업 가능 여부는 현장 조건을 확인한 뒤 판단합니다."],
  ["폐기물 처리와 보양도 포함되나요?", "포함 여부와 범위는 상담에서 확인합니다. 폐기물 분류·반출·처리, 공용부와 보존 대상의 보양, 작업 후 정리 상태를 계약 전에 구체적으로 협의합니다."],
  ["어떻게 상담을 시작하나요?", "사진 상담 버튼을 누르면 다다 철거 카카오톡 채널로 연결됩니다. 현장 사진과 지역, 희망 일정을 보내주세요. 전화 상담도 가능합니다. 상담 메모는 준비용이며 자동 전송되지 않습니다."],
];

export default function DemolitionHome() {
  return <div className="dada-home">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow"><span className="orange-dot" /> DADA DEMOLITION</div>
        <p className="hero-edition">서울 · 경기 실내 철거 &amp; 원상복구</p>
        <h1 id="hero-title">잘 비워야,<br /><span>다음이 보입니다.</span></h1>
        <p className="hero-description">비울 공간과 남길 가치.<br />그 경계까지 생각하는 다다철거.</p>
        <div className="hero-actions"><a className="primary-button" href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer">사진으로 상담하기 <span aria-hidden="true">↗</span></a><a className="text-link" href="#services">서비스 살펴보기 <span aria-hidden="true">↓</span></a></div>
        <a className="hero-phone" href={`tel:${SITE.phone}`}><span>전화 상담</span><strong>{SITE.phone}</strong></a>
        <div className="hero-footnote"><span>상가 · 주택 · 부분 철거 · 원상복구</span><span>01 — A NEW BEGINNING</span></div>
      </div>
      <div className="hero-media"><HeroVideos /><div className="hero-media-caption" aria-hidden="true"><span>SPACE<br />FOR WHAT’S NEXT.</span><span>DADA<br />FILM / 01</span></div></div>
    </section>
    <div className="service-band"><div><span>WORK AREA</span><strong>서울 · 경기 전 지역</strong></div><p>서울·경기 외 지역 출장비 20만원</p><Link href="/estimate">상담 준비 안내 <span aria-hidden="true">↗</span></Link></div>

    <section id="services" className="services section-pad" aria-labelledby="services-title">
      <div className="section-heading"><div><div className="eyebrow">01 / OUR SERVICES</div><h2 id="services-title">당신의 공간에 맞는<br /><em>비움의 방식.</em></h2></div><p>전체를 비우거나, 필요한 부분만 바꾸거나.<br />공간의 다음 계획에 맞춰 시작합니다.</p></div>
      <div className="service-cards">{services.map(service => <a key={service.number} className="service-card" href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${service.title} 카카오톡 상담`}><div className="service-image"><Image src={service.image} width={service.width} height={service.height} sizes="(max-width:700px) 88vw, 28vw" alt={`${service.title}의 공간감을 표현한 AI 연출 이미지`} /><span>{service.number} / {service.en}</span><span className="service-arrow" aria-hidden="true">↗</span></div><div className="service-card-copy"><h3>{service.title}</h3><p>{service.description}</p><div><span>{service.detail}</span><strong>상담하기 ↗</strong></div></div></a>)}</div>
      <div className="section-footnote"><p>이미지는 AI 공간 연출이며 실제 시공 사례가 아닙니다.</p><p>작업 범위·비용·일정은 현장 확인 후 협의합니다.</p></div>
      <aside className="support-callout"><div><span>상가 철거 · 폐업 준비</span><h3>점포철거 지원금도 확인해 보세요.</h3><p>실제 지급액은 공단 심사로 결정되는 참고 계산입니다.</p></div><a href="/demolition-support">내 조건으로 계산하기 <span aria-hidden="true">↗</span></a></aside>
    </section>

    <YouTubeGallery />

    <section id="approach" className="approach section-pad" aria-labelledby="approach-title">
      <div className="approach-visual"><Image src="/dada/editorial/material-study.webp" width={1122} height={1402} sizes="(max-width:700px) 88vw, 42vw" alt="마감과 구조의 경계를 표현한 AI 공간 연출 이미지" /><span>AI 공간 연출 이미지</span><div aria-hidden="true">The art<br />of making room.</div></div>
      <div className="approach-copy"><div className="eyebrow">02 / OUR STANDARD</div><h2 id="approach-title">남길 것을 아는<br /><em>철거의 기준.</em></h2><p className="section-description">철거는 공간을 비우는 일이자,<br />다음 공정의 바탕을 만드는 일입니다.</p><div className="principles">{principles.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div>
    </section>

    <section id="checklist" className="process section-pad" aria-labelledby="process-title"><div className="section-heading"><div><div className="eyebrow">03 / HOW WE BEGIN</div><h2 id="process-title">첫 사진부터,<br /><em>분명한 계획까지.</em></h2></div><p>아직 모든 것을 정하지 않아도 괜찮습니다.<br />아는 내용부터 차근차근 이야기하세요.</p></div><ol className="process-grid"><li><span>01 / SHARE</span><h3>사진과 일정 전달</h3><p>전체 공간·철거할 부분·출입구 사진과<br />지역, 면적, 희망 일정을 알려주세요.</p></li><li><span>02 / REVIEW</span><h3>현장 조건 확인</h3><p>보존 대상과 반출 동선,<br />현장 확인이 필요한 부분을 살펴봅니다.</p></li><li><span>03 / PLAN</span><h3>비용과 범위 협의</h3><p>작업에 포함되는 항목과 정리 범위,<br />일정을 함께 확인합니다.</p></li></ol></section>

    <section id="consultation" className="consultation section-pad" aria-labelledby="consultation-title"><div className="consultation-intro"><div className="eyebrow">LET’S MAKE ROOM.</div><h2 id="consultation-title">공간의 다음,<br /><em>함께 이야기할까요?</em></h2><p>현장 사진과 지역, 희망 일정.<br />세 가지로 첫 상담을 시작하세요.</p><div className="consultation-region">서울 · 경기 전 지역<span>그 외 지역 출장비 20만원</span></div></div><div className="consultation-card"><span className="eyebrow">CONTACT DADA</span><a className="consultation-primary" href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer"><span><small>카카오톡에 현장 사진 보내기</small><strong>사진으로 상담하기</strong></span><span aria-hidden="true">↗</span></a><a className="consultation-phone" href={`tel:${SITE.phone}`}><span>전화 상담</span><strong>{SITE.phone}</strong></a><Link className="contact-guide-link" href="/estimate">어떤 사진을 준비하면 되나요? <span aria-hidden="true">↗</span></Link></div></section>
    <section id="consultation-brief" className="brief-section section-pad"><details className="brief-disclosure"><summary><span><small>상담 전, 필요한 분만</small><strong>보낼 내용을 미리 정리해 보세요.</strong></span><span aria-hidden="true">+</span></summary><p className="brief-explainer">아는 내용만 선택해 상담 메모를 만들 수 있습니다. 입력 내용은 이 브라우저 안에서만 작성되며, 저장되거나 자동 전송되지 않습니다.</p><ConsultationBrief /></details></section>

    <section className="faq section-pad"><div><div className="eyebrow">A FEW ANSWERS</div><h2>먼저 궁금한<br /><em>몇 가지.</em></h2></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="dada-social section-pad" aria-labelledby="dada-social-title"><div><div className="eyebrow">DADA JOURNAL</div><h2 id="dada-social-title">다다철거의 이야기.</h2></div><div className="journal-links"><a href={SITE.blogUrl} target="_blank" rel="noopener noreferrer">네이버 블로그 <span aria-hidden="true">↗</span></a><a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">인스타그램 <span aria-hidden="true">↗</span></a><a href={SITE.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a><a href={SITE.bloggerUrl} target="_blank" rel="noopener noreferrer">Blogger <span aria-hidden="true">↗</span></a></div></section>
    <div className="brand-signoff" aria-hidden="true"><span>DADA</span><p>DEMOLITION &amp; RESTORATION<br />공간의 다음을 준비합니다.</p></div>
  </div>;
}
