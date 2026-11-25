"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SITE } from "@/lib/constants";
function buildBrief(data: FormData) {
  const scope = data.getAll('scope');
  const retain = data.getAll('retain');
  const note = String(data.get('notes') || '').trim();
  return ['다다철거 · 상담 준비 메모', '다다 종합시공', '', `공간 유형: ${data.get('space') || '기타·미정'}`, `철거할 부분: ${scope.length ? scope.join(', ') : '상담 후 결정'}`, `남겨야 할 부분: ${retain.length ? retain.join(', ') : '현장 확인 필요'}`, '', '추가로 전달할 내용', note || '아직 정리하지 않았습니다.', '', '상담 시 함께 확인할 항목', '□ 면적 / 층수 / 현재 공간 사용 여부', '□ 구조·설비 상태와 철거 가능 범위', '□ 출입구 / 승강기 / 차량 접근 / 반출 동선', '□ 보존 대상과 공용부 보양 범위', '□ 폐기물 분류·반출·처리 포함 여부', '□ 희망 일정 / 건물 작업 규정 / 후속 공정', '□ 작업 후 정리 및 인계 범위', '□ 비용에 포함되는 항목과 추가 비용 조건', '', '이 메모는 상담 준비용이며 견적서나 계약서가 아닙니다.', '작성 내용은 전송되지 않았으며 상담이 접수된 것은 아닙니다.'].join('\n');
}

export default function ConsultationBrief() {
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
return (<div className="brief-tool">
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
);
}
