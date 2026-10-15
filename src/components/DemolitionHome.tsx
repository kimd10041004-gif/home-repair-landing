"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroVideos from "./HeroVideos";
import { SITE } from "@/lib/constants";
function buildBrief(data: FormData) {
  const scope = data.getAll('scope');
  const retain = data.getAll('retain');
  const note = String(data.get('notes') || '').trim();
  return ['다다철거 · 상담 준비 메모', '다다 종합시공', '', `공간 유형: ${data.get('space') || '기타·미정'}`, `철거할 부분: ${scope.length ? scope.join(', ') : '상담 후 결정'}`, `남겨야 할 부분: ${retain.length ? retain.join(', ') : '현장 확인 필요'}`, '', '추가로 전달할 내용', note || '아직 정리하지 않았습니다.', '', '상담 시 함께 확인할 항목', '□ 면적 / 층수 / 현재 공간 사용 여부', '□ 구조·설비 상태와 철거 가능 범위', '□ 출입구 / 승강기 / 차량 접근 / 반출 동선', '□ 보존 대상과 공용부 보양 범위', '□ 폐기물 분류·반출·처리 포함 여부', '□ 희망 일정 / 건물 작업 규정 / 후속 공정', '□ 작업 후 정리 및 인계 범위', '□ 비용에 포함되는 항목과 추가 비용 조건', '', '이 메모는 상담 준비용이며 견적서나 계약서가 아닙니다.', '작성 내용은 전송되지 않았으며 상담이 접수된 것은 아닙니다.'].join('\n');
}

export default function DemolitionHome() {
 const home=useRef<HTMLDivElement>(null);
 useEffect(() => {
  if (!home.current || !('IntersectionObserver' in window)) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) return;
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (entry.isIntersecting) {
     entry.target.setAttribute("data-entered", "true");
     observer.unobserve(entry.target);
    }
   });
  }, { threshold: 0.12 });
  home.current.querySelectorAll(".section-intro, .checklist-heading, .check-grid article, .consultation-intro, .brief-tool, .faq-list, .space-story-heading, .space-frame").forEach(element => observer.observe(element));
  return () => observer.disconnect();
 }, []);
 const [count,setCount]=useState(0);
 const [brief,setBrief]=useState("");
 const [status,setStatus]=useState("");
 const resultTitle=useRef<HTMLHeadingElement>(null);
 const output=useRef<HTMLTextAreaElement>(null);
 useEffect(() => { if(brief) { resultTitle.current?.focus({preventScroll:true}); resultTitle.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",block:"start"}); } },[brief]);
 function generate(event: FormEvent<HTMLFormElement>) {event.preventDefault();setBrief(buildBrief(new FormData(event.currentTarget)));setStatus("");}

 async function copy() {
  const copied = "상담 메모를 복사했어요. 문자 앱에 붙여넣고 내용을 확인한 뒤 직접 전송해 주세요.";
  output.current?.focus();
  output.current?.select();
  try {
   if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
   await Promise.race([navigator.clipboard.writeText(brief),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error("Clipboard timed out")),2000))]);
   setStatus(copied);
  } catch {
   output.current?.focus(); output.current?.select();
   try { if (document.execCommand("copy")) { setStatus(copied); return; } } catch { /* Keep manual selection available. */ }
   setStatus("내용을 선택했어요. 복사 메뉴 또는 Ctrl+C / ⌘C를 사용해 주세요.");
  }
 }

 function download() {const url=URL.createObjectURL(new Blob(["\uFEFF",brief],{type:"text/plain;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="다다철거_상담준비메모.txt";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("텍스트 파일 저장을 요청했어요.");}
 return <div className="dada-home" ref={home}>
<section className="hero" aria-labelledby="hero-title">
<HeroVideos />
<div className="hero-copy">
<div className="eyebrow">
<span className="orange-dot">
</span> DEMOLITION, WITH INTENTION</div>
<div className="hero-edition">DADA / INTERIOR DEMOLITION<span>서울 · 경기</span></div>
<h1 id="hero-title">잘 비워야,<br /><span>다음이 보입니다.</span>
</h1>
<div className="hero-bottom">
<p>철거는 끝내는 일이자,<br />새로운 공간을 시작하는 일.<br />
<strong>남길 것까지 생각하는 다다철거.</strong>
</p>
<a className="primary-button" href="#consultation">상담 내용 정리하기 <span aria-hidden="true">↗</span>
</a>
</div>
</div>
<a href="#checklist" className="hero-note">
<span className="hero-note-label">SCROLL TO EXPLORE</span><span>무엇을 철거할지보다 먼저,<br /><strong>무엇을 남길지 확인합니다.</strong></span>
<span aria-hidden="true">↓</span>
</a>
</section>
<div className="ticker" aria-hidden="true">
<span>REMOVE WITH CARE.</span>
<span className="asterisk">✳</span>
<span>MAKE ROOM FOR WHAT’S NEXT.</span>
<span className="asterisk">✳</span>
<span>다음 공간을 위한 첫 작업.</span>
</div>
<section className="space-story section-pad" aria-labelledby="space-story-title">
<div className="space-story-heading"><div className="eyebrow">DADA / A DIFFERENT PERSPECTIVE</div><h2 id="space-story-title">비우는 일의 깊이.<br /><span>다음을 보는 시선.</span></h2><p>입구에서 안쪽 공간까지.<br />철거할 곳과 지켜야 할 곳을<br />하나의 흐름으로 살펴봅니다.</p></div>
<div className="space-frames">
<figure className="space-frame"><div className="space-frame-image"><Image src="/dada/video/01-entry-poster.jpg" width={1280} height={720} sizes="(max-width:700px) 88vw, 37vw" alt="입구의 동선과 남길 마감을 생각하기 위한 AI 공간 연출 이미지" /><span aria-hidden="true">01</span></div><figcaption><span>ENTRY / 첫 경계</span><strong>들어가는 길부터 생각합니다.</strong><p>출입구와 이동 경로, 공용부의 조건.</p></figcaption></figure>
<figure className="space-frame"><div className="space-frame-image"><Image src="/dada/video/02-corridor-poster.jpg" width={1280} height={720} sizes="(max-width:700px) 88vw, 37vw" alt="이동과 반출 경로를 생각하기 위한 AI 복도 연출 이미지" /><span aria-hidden="true">02</span></div><figcaption><span>PASSAGE / 연결되는 공간</span><strong>작업의 바깥까지 살핍니다.</strong><p>반출 동선과 보양할 부분의 연결.</p></figcaption></figure>
</div><p className="image-disclosure">AI 연출 예시 · 실제 시공 현장이나 작업 전후 기록이 아닙니다.</p>
</section>
<section id="approach" className="approach section-pad">
<div className="section-intro">
<div className="eyebrow">01 / THE APPROACH</div>
<h2>남길 것을 아는<br />철거의 기준<span className="orange-text">.</span>
</h2>
<p>공간은 비슷해 보여도 조건은 다릅니다.<br />사진 밖의 동선부터 남겨야 할 마감까지.<br />작업을 이야기하기 전, 현장을 읽는 순서입니다.</p>
</div>
<div className="principles">
<article>
<span className="row-number">01</span>
<div>
<h3>비울 것과 남길 것을 구분합니다.</h3>
<p>철거 대상뿐 아니라 유지할 벽체, 설비, 마감도 함께 확인합니다. 구조와 설비의 상태는 현장에서 전문가의 확인이 필요합니다.</p>
<span className="micro-label">SCOPE &amp; PRESERVATION</span>
</div>
<span className="principle-icon" aria-hidden="true">↗</span>
</article>
<article>
<span className="row-number">02</span>
<div>
<h3>작업 공간 밖까지 살핍니다.</h3>
<p>출입구, 복도, 승강기, 차량 접근 조건을 확인합니다. 공용부 보양과 건물의 작업 가능 시간도 함께 정리할 항목입니다.</p>
<span className="micro-label">ACCESS &amp; PROTECTION</span>
</div>
<span className="principle-icon" aria-hidden="true">↗</span>
</article>
<article>
<span className="row-number">03</span>
<div>
<h3>마무리의 범위를 먼저 맞춥니다.</h3>
<p>폐기물 분류·반출·처리와 정리 범위는 사전에 협의해야 합니다. 다음 공정에 필요한 인계 상태까지 미리 확인합니다.</p>
<span className="micro-label">REMOVAL &amp; HANDOVER</span>
</div>
<span className="principle-icon" aria-hidden="true">↗</span>
</article>
</div>
<figure className="scope-diagram">
<Image src="/dada/space.svg" width={760} height={720} sizes="(max-width:700px) 88vw, 40vw" alt="주황색 철거 범위와 회색 보존 대상을 구분한 공간 설명용 그래픽" />
<figcaption><span className="eyebrow">SCOPE STUDY / 작업 범위의 이해</span><strong>경계를 분명하게.<br />다음 공정은 자연스럽게.</strong><p>비울 부분과 남길 부분을 함께 확인합니다.<br />공간 설명용 그래픽 · 실제 현장 도면이 아닙니다.</p></figcaption>
</figure>
</section>
<section id="checklist" className="checklist section-pad">
<div className="checklist-heading">
<div>
<div className="eyebrow">02 / BEFORE WE BEGIN</div>
<h2>좋은 시작은,<br />구체적인 확인에서.</h2>
</div>
<p>상담 전 아래 내용을 정리해 두면<br />필요한 작업을 더 정확하게 이야기할 수 있습니다.</p>
</div>
<div className="check-grid">
<article>
<span className="check-index">A / SPACE</span>
<h3>어떤 공간인가요?</h3>
<p>주거, 상가, 사무실 등 공간의 용도와 대략적인 면적, 층수, 현재 사용 여부를 확인해 주세요.</p>
<div className="check-foot">용도 · 면적 · 층수</div>
</article>
<article>
<span className="check-index">B / SCOPE</span>
<h3>어디까지 비우나요?</h3>
<p>전체 또는 부분 철거인지, 철거할 대상과 남겨야 할 부분을 구분해 주세요. 임대 공간은 원상복구 조건도 확인합니다.</p>
<div className="check-foot">철거 범위 · 보존 대상</div>
</article>
<article>
<span className="check-index">C / ACCESS</span>
<h3>어떻게 드나드나요?</h3>
<p>승강기 사용, 계단과 복도 폭, 차량 진입과 적재 위치 등 반출에 영향을 주는 조건을 확인해 주세요.</p>
<div className="check-foot">반출 동선 · 공용부 보양</div>
</article>
<article>
<span className="check-index">D / TIMING</span>
<h3>다음 일정은 언제인가요?</h3>
<p>희망 작업 시기와 후속 공정 일정을 알려 주세요. 관리 주체의 작업 시간·소음 관련 안내도 함께 확인합니다.</p>
<div className="check-foot">희망 일정 · 관리 규정</div>
</article>
</div>
<div className="safety-note">
<span aria-hidden="true">↳</span>
<p>사진만으로 판단하기 어려운 구조·설비·유해물질 여부는 별도 확인이 필요합니다.<br />직접 해체하기보다, 현장 확인과 필요한 전문 절차를 먼저 진행해 주세요.</p>
</div>
</section>
<section id="consultation" className="consultation section-pad">
<div className="consultation-intro">
<div className="eyebrow">03 / YOUR NEXT STEP</div>
<h2>공간 이야기부터<br />시작해 볼까요?</h2>
<p>아직 정확히 몰라도 괜찮습니다.<br />아는 내용만 골라 나만의 상담 메모를 만들어 보세요.</p>
<div className="contact-links">
<Link href="/estimate">사진 상담 안내 ↗</Link>
<a href={`tel:${SITE.phone}`}>전화 {SITE.phone}</a>
<a href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer">카카오톡 상담 ↗</a>
<p>{SITE.serviceArea}</p>
</div>
<div className="local-note">
<span className="local-icon" aria-hidden="true">⌘</span>
<p>
<strong>이 브라우저 안에서만 작성됩니다.</strong>
<br />입력 내용은 전송되거나 저장되지 않습니다.<br />완성한 메모는 복사하거나 파일로 보관해 주세요.</p>
</div>
<div className="consultation-stamp" aria-hidden="true">A CLEAR SCOPE.<br />A BETTER START.<span>다다철거</span>
</div>
</div>
<div className="brief-tool">
<form id="brief-form" onSubmit={generate}>
<fieldset>
<legend>
<span>01</span> 공간 유형</legend>
<div className="choices space-choices">
<label>
<input type="radio" name="space" value="주거" />
<span>주거</span>
</label>
<label>
<input type="radio" name="space" value="상가" />
<span>상가</span>
</label>
<label>
<input type="radio" name="space" value="사무실" />
<span>사무실</span>
</label>
<label>
<input type="radio" name="space" value="기타·미정" defaultChecked />
<span>기타·미정</span>
</label>
</div>
</fieldset>
<fieldset>
<legend>
<span>02</span> 철거할 부분 <small>여러 개 선택할 수 있어요</small>
</legend>
<div className="choices">
<label>
<input type="checkbox" name="scope" value="내부 전체" />
<span>내부 전체</span>
</label>
<label>
<input type="checkbox" name="scope" value="벽체·칸막이" />
<span>벽체·칸막이</span>
</label>
<label>
<input type="checkbox" name="scope" value="바닥·천장" />
<span>바닥·천장</span>
</label>
<label>
<input type="checkbox" name="scope" value="주방·욕실" />
<span>주방·욕실</span>
</label>
<label>
<input type="checkbox" name="scope" value="집기·가구" />
<span>집기·가구</span>
</label>
<label>
<input type="checkbox" name="scope" value="상담 후 결정" />
<span>상담 후 결정</span>
</label>
</div>
</fieldset>
<fieldset>
<legend>
<span>03</span> 남겨야 할 부분</legend>
<div className="choices">
<label>
<input type="checkbox" name="retain" value="기존 마감" />
<span>기존 마감</span>
</label>
<label>
<input type="checkbox" name="retain" value="설비·배관" />
<span>설비·배관</span>
</label>
<label>
<input type="checkbox" name="retain" value="창호·문" />
<span>창호·문</span>
</label>
<label>
<input type="checkbox" name="retain" value="가구·집기" />
<span>가구·집기</span>
</label>
<label>
<input type="checkbox" name="retain" value="현장 확인 필요" />
<span>현장 확인 필요</span>
</label>
</div>
</fieldset>
<div className="notes-field">
<label htmlFor="notes">
<span>04</span> 더 알려주고 싶은 내용</label>
<textarea id="notes" onChange={(event) => setCount(event.target.value.length)} name="notes" rows={3} maxLength={1000} placeholder="대략적인 면적과 층수, 희망 시기, 승강기 유무 등">
</textarea>
<div className="field-hint">
<span>이름·전화번호 등 개인정보는 입력하지 않아도 됩니다.</span>
<span id="character-count">{count.toLocaleString("ko-KR")} / 1,000</span>
</div>
</div>
<button type="submit" className="primary-button generate-button">상담 메모 만들기 <span aria-hidden="true">↗</span>
</button>
</form>
<section id="brief-result" className="brief-result" aria-labelledby="result-title" hidden={!brief}>
<div className="result-header">
<div>
<span className="eyebrow">YOUR CONSULTATION BRIEF</span>
<h3 id="result-title" ref={resultTitle} tabIndex={-1}>상담 메모가 준비됐어요.</h3>
</div>
<span aria-hidden="true">↗</span>
</div>
<p>메모를 복사해 <strong>{SITE.phone}</strong>로 직접 문자 보내 주세요. 이 화면에서 상담이 접수되거나 문자가 전송되지는 않습니다.</p>
<label className="sr-only" htmlFor="brief-output">작성된 상담 메모</label>
<textarea id="brief-output" ref={output} value={brief} rows={16} readOnly>
</textarea>
<div className="result-actions">
<button id="copy-brief" onClick={copy} type="button">1. 상담 메모 복사 <span aria-hidden="true">⧉</span>
</button>
<button id="download-brief" onClick={download} type="button">텍스트 파일 저장 <span aria-hidden="true">↓</span>
</button>
</div>
<p className="status" id="copy-status" role="status" aria-live="polite">{status}</p>
<div className="manual-sms" aria-labelledby="manual-sms-title">
<h4 id="manual-sms-title">2. 문자에 붙여넣고 직접 전송</h4>
<p>휴대폰에서는 아래 버튼으로 문자 앱을 연 뒤, 복사한 메모를 붙여넣어 주세요. 받는 번호와 내용을 확인하고 문자 앱의 전송 버튼을 직접 눌러야 합니다.</p>
<a className="sms-link" href={`sms:${SITE.phone.replaceAll("-", "")}`}>문자 앱 열기 ↗</a>
<p>PC이거나 문자 앱이 열리지 않나요? 휴대폰 문자 앱에서 받는 번호 <strong>{SITE.phone}</strong>를 입력하고 위 메모를 복사해 보내 주세요. 필요하면 텍스트 파일로 옮길 수 있습니다.</p>
<p>복사가 안 되면 위 메모를 길게 눌러 전체 선택 후 복사하거나, PC에서 Ctrl+C / ⌘C를 사용해 주세요. 문자 앱을 열거나 내용을 복사하는 것만으로는 전송되지 않습니다. 통신 요금제에 따라 문자 요금이 발생할 수 있습니다.</p>
</div>
</section>
</div>
</section>
<section className="dada-social section-pad" aria-labelledby="dada-social-title">
<div className="eyebrow">DADA / MORE STORIES</div>
<h2 id="dada-social-title">다다철거 소식</h2>
<div className="contact-links"><a href={SITE.blogUrl} target="_blank" rel="noopener noreferrer"><span><strong>네이버 블로그 ↗</strong><br />실내 철거 이야기와 상담 준비 안내</span></a><a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer"><span><strong>인스타그램 ↗</strong><br />@dada_cheolgeo · 다다철거의 사진과 소식</span></a><a href={SITE.bloggerUrl} target="_blank" rel="noopener noreferrer"><span><strong>Blogger ↗</strong><br />철거 전 확인할 내용과 상담 준비 이야기</span></a><a href={SITE.youtubeUrl} target="_blank" rel="noopener noreferrer"><span><strong>YouTube ↗</strong><br />@dadacheolgeo · 다다철거 영상 안내</span></a></div>
</section>
<section className="faq section-pad">
<div>
<div className="eyebrow">04 / A FEW ANSWERS</div>
<h2>먼저 궁금한 것들.</h2>
</div>
<div className="faq-list">
<details>
<summary>사진만으로 견적을 받을 수 있나요?<span aria-hidden="true">+</span>
</summary>
<p>사진은 공간과 작업 범위를 이해하는 데 도움이 됩니다. 다만 실제 비용과 일정은 면적, 구조·설비 상태, 반출 조건, 폐기물 종류와 양 등에 따라 달라져 현장 확인 후 협의가 필요할 수 있습니다.</p>
</details>
<details>
<summary>부분 철거는 어떤 내용을 정리하면 되나요?<span aria-hidden="true">+</span>
</summary>
<p>철거할 대상과 유지할 대상을 각각 정리해 주세요. 두 범위가 맞닿는 부분의 사진과 후속 공사 계획이 있으면 상담에 도움이 됩니다. 해체 가능 여부는 현장의 구조와 설비를 확인한 뒤 판단해야 합니다.</p>
</details>
<details>
<summary>폐기물 처리와 보양도 확인해야 하나요?<span aria-hidden="true">+</span>
</summary>
<p>네. 폐기물 분류·반출·처리의 포함 여부, 반출 동선, 공용부와 보존 대상의 보양 범위, 작업 후 정리 상태를 계약 전에 구체적으로 확인하는 것이 좋습니다.</p>
</details>
<details>
<summary>여기서 상담을 신청할 수 있나요?<span aria-hidden="true">+</span>
</summary>
<p>철거 상담은 사진 상담 안내 페이지의 전화·다다 철거 카카오톡 채널로 진행할 수 있습니다. 아래 메모 도구는 준비용이며 자동으로 문의를 전송하지 않습니다.</p>
</details>
</div>
</section>
<section className="closing">
<p>철거, 그다음을 생각합니다.</p>
<a href="#consultation">다다철거<span aria-hidden="true">↗</span>
</a>
<div>
<span>다다 종합시공</span>
<span>MAKE ROOM FOR WHAT’S NEXT.</span>
</div>
</section>
</div>;
}
