"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SITE } from "@/lib/constants";
import { fieldVideos as videos } from "@/lib/field-videos";

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
      <div><div className="eyebrow">DADA / FIELD RECORDS</div><h2 id="videos-title">직접 비운 공간,<br /><em>현장으로 보여드립니다.</em></h2></div>
      <p>다다철거가 작업한 현장의 사진·영상 기록.<br />현장을 선택해 철거 전후와 작업 결과를 확인하세요.</p>
    </div>
    <div className="video-journal-layout">
      <div className="video-feature">
        <div className="video-player" id="dada-youtube-player" ref={playerRef}>
          {playing ? <iframe key={video.id} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&hl=ko`} title={`다다철거 — ${video.title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> :
            <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`${video.title} 영상 재생`}>
              <Image src={`https://i.ytimg.com/vi/${video.id}/maxres1.jpg`} fill sizes="(max-width:700px) 534px, 605px" alt="" />
              <span className="video-play-icon" aria-hidden="true">▶</span><span className="video-poster-label">다다철거 YouTube <span>영상 재생 ↗</span></span>
            </button>}
        </div>
        <div className="video-player-tools"><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a>{playing && <button type="button" onClick={() => setPlaying(false)}>재생 닫기 ×</button>}</div>
      </div>
      <div className="video-editorial">
        <div className="video-selection" aria-live="polite"><span className="eyebrow">{String(selected + 1).padStart(2, "0")} / {video.category}</span><h3>{video.title}</h3><p>{video.description}</p></div>
        <ol className="video-list" aria-label="다다철거 현장 영상 선택">{videos.map((item, index) => <li key={item.id}><button type="button" aria-pressed={selected === index} aria-controls="dada-youtube-player" onClick={() => selectVideo(index)}>
          <span className="video-list-number">0{index + 1}</span><span className="video-list-thumbnail"><Image src={`https://i.ytimg.com/vi/${item.id}/hq1.jpg`} width={96} height={72} sizes="72px" alt="" /></span><span className="video-list-copy"><small>{item.category}</small><strong>{item.title}</strong></span><span className="video-list-play" aria-hidden="true">▶</span>
        </button></li>)}</ol>
        <div className="video-next-step"><p>우리 공간의 철거도 궁금하다면.</p><a className="text-link" href={SITE.kakaoUrl} target="_blank" rel="noopener noreferrer">사진으로 상담하기 <span aria-hidden="true">↗</span></a></div>
      </div>
    </div>
    <div className="video-journal-footer"><p>재생되지 않으면 ‘YouTube에서 보기’를 이용해 주세요.</p><a href={SITE.youtubeUrl} target="_blank" rel="noopener noreferrer">다다철거 채널 더 보기 ↗</a></div>
  </section>;
}
