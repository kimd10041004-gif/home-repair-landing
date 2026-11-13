"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SITE } from "@/lib/constants";

// Selected from the official channel RSS on 2026-11-14. These are advice videos,
// not project case studies. Keep IDs and editorial descriptions together.
const videos = [
  { id: "3EF9KCWPwAc", title: "에어컨 철거, 누구에게 맡기나요?", category: "설비 · 작업 범위", description: "에어컨과 가전, 철거 전에 담당과 범위를 확인해 보세요." },
  { id: "Z0UbYuqLCm0", title: "현장에 못 가도, 과정은 알아야 하니까.", category: "현장 · 소통", description: "현장에 직접 방문하기 어렵다면, 작업 과정을 어떻게 확인할지 먼저 이야기하세요." },
  { id: "g0JZNPb8GBA", title: "상가 철거, 업종마다 다른 준비.", category: "상가 · 사전 준비", description: "같은 상가라도 업종에 따라 달라지는 철거 준비를 살펴보세요." },
  { id: "V1faT19urTY", title: "철거하는 날, 반려동물은 어디에?", category: "주거 · 사전 준비", description: "반려동물과 함께하는 공간이라면 철거 당일의 동선도 미리 준비하세요." },
];

export default function YouTubeGallery() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const video = videos[selected];

  function selectVideo(index: number) {
    setSelected(index);
    setPlaying(true);
    if (window.matchMedia("(max-width: 700px)").matches) {
      playerRef.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }

  return <section id="videos" className="video-journal section-pad" aria-labelledby="videos-title">
    <div className="section-heading">
      <div><div className="eyebrow">DADA / VIDEO JOURNAL</div><h2 id="videos-title">철거 전의 궁금함,<br /><em>영상으로 먼저.</em></h2></div>
      <p>다다철거가 전하는 짧은 준비 이야기.<br />궁금한 주제를 고르면 여기서 바로 볼 수 있습니다.</p>
    </div>
    <div className="video-journal-layout">
      <div className="video-feature">
        <div className="video-player" id="dada-youtube-player" ref={playerRef}>
          {playing ? <iframe key={video.id} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&hl=ko`} title={`다다철거 — ${video.title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> :
            <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`${video.title} 영상 재생`}>
              <Image src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`} fill sizes="(max-width:700px) 534px, 605px" alt="" />
              <span className="video-play-icon" aria-hidden="true">▶</span><span className="video-poster-label">다다철거 YouTube <span>영상 재생 ↗</span></span>
            </button>}
        </div>
        <div className="video-player-tools"><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a>{playing && <button type="button" onClick={() => setPlaying(false)}>재생 닫기 ×</button>}</div>
      </div>
      <div className="video-editorial">
        <div className="video-selection" aria-live="polite"><span className="eyebrow">{String(selected + 1).padStart(2, "0")} / {video.category}</span><h3>{video.title}</h3><p>{video.description}</p></div>
        <ol className="video-list" aria-label="다다철거 영상 선택">{videos.map((item, index) => <li key={item.id}><button type="button" aria-pressed={selected === index} aria-controls="dada-youtube-player" onClick={() => selectVideo(index)}>
          <span className="video-list-number">0{index + 1}</span><span className="video-list-thumbnail"><Image src={`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`} width={96} height={72} sizes="72px" alt="" /></span><span className="video-list-copy"><small>{item.category}</small><strong>{item.title}</strong></span><span className="video-list-play" aria-hidden="true">▶</span>
        </button></li>)}</ol>
        <div className="video-next-step"><p>우리 공간의 철거도 궁금하다면.</p><a className="text-link" href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer">사진으로 상담하기 <span aria-hidden="true">↗</span></a></div>
      </div>
    </div>
    <div className="video-journal-footer"><p>재생되지 않으면 ‘YouTube에서 보기’를 이용해 주세요.</p><a href={SITE.youtubeUrl} target="_blank" rel="noopener noreferrer">다다철거 채널 더 보기 ↗</a></div>
  </section>;
}
