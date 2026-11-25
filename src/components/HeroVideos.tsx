"use client";
import { useEffect, useRef, useState } from "react";

const filmBase = "/dada/film/dada-brand";
type Connection = EventTarget & { saveData?: boolean };

export default function HeroVideos() {
  const video = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLVideoElement>(null);
  const toggle = useRef<() => void>(() => {});
  const syncPlayback = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let stopped = false;
    let explicitlyPlaying = false;
    let inView = true;
    let disposed = false;
    let attempt = 0;
    const shouldPlay = () => !disposed && !stopped && inView && !document.hidden && !dialog.current?.open &&
      (explicitlyPlaying || (!motion.matches && !connection?.saveData));
    const pause = () => { attempt++; film.pause(); };
    const sync = async () => {
      if (!shouldPlay()) {
        pause();
        if (!explicitlyPlaying && (motion.matches || connection?.saveData)) {
          setStatus(motion.matches ? "동작 줄이기 설정 · 정지 이미지" : "데이터 절약 설정 · 정지 이미지");
        }
        return;
      }
      if (!film.getAttribute("src")) {
        const size = window.matchMedia("(max-width: 700px)").matches ? "mobile" : "desktop";
        film.src = `${filmBase}-${size}.mp4`;
        film.load();
      }
      const token = ++attempt;
      try {
        await film.play();
        if (!shouldPlay()) film.pause();
      } catch {
        if (!disposed && token === attempt) setStatus("정지 이미지 · 재생 버튼을 눌러주세요.");
      }
    };
    const started = () => { film.dataset.ready = "true"; setPlaying(true); setStatus(""); };
    const paused = () => setPlaying(false);
    const failed = () => { pause(); film.dataset.ready = "false"; setStatus("영상을 불러오지 못해 정지 이미지를 표시합니다."); };
    const preferenceChanged = () => { explicitlyPlaying = false; void sync(); };
    toggle.current = () => {
      if (!film.paused) { stopped = true; pause(); }
      else {
        stopped = false;
        explicitlyPlaying = true;
        if (film.error) { film.removeAttribute("src"); film.load(); }
        void sync();
      }
    };
    syncPlayback.current = () => { void sync(); };
    film.addEventListener("playing", started);
    film.addEventListener("pause", paused);
    film.addEventListener("error", failed);
    motion.addEventListener("change", preferenceChanged);
    connection?.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", sync);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; void sync(); }, { threshold: 0.01 });
    observer.observe(film);
    void sync();
    return () => {
      disposed = true;
      observer.disconnect();
      film.removeEventListener("playing", started);
      film.removeEventListener("pause", paused);
      film.removeEventListener("error", failed);
      motion.removeEventListener("change", preferenceChanged);
      connection?.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", sync);
      pause();
      film.removeAttribute("src");
      film.load();
    };
  }, []);

  function openFilm() {
    setPreviewOpen(true);
    dialog.current?.showModal();
    syncPlayback.current();
  }
  function closeFilm() {
    preview.current?.pause();
    setPreviewOpen(false);
    syncPlayback.current();
  }

  return <>
    <div className="hero-scene hero-video-scene" aria-hidden="true">
      <picture><source media="(max-width: 700px)" srcSet={`${filmBase}-mobile.jpg`} />
        {/* A lightweight poster stays available before JavaScript and when playback is disabled. */}
        <img src={`${filmBase}-desktop.jpg`} alt="" fetchPriority="high" width={1344} height={768} />
      </picture>
      <video ref={video} muted playsInline loop preload="none" tabIndex={-1} />
    </div>
    <span className="scene-caption">AI 브랜드 필름 · 실제 시공 기록 아님</span>
    <div className="hero-video-controls">
      <div><button type="button" onClick={() => toggle.current()} aria-label={playing ? "배경 영상 일시 정지" : "배경 영상 재생"}>{playing ? "Ⅱ 일시 정지" : "▷ 영상 재생"}</button><button type="button" onClick={openFilm}>필름 보기 ↗</button></div>
      <span role="status">{status}</span>
    </div>
    <dialog ref={dialog} className="film-dialog" aria-labelledby="film-title" onClose={closeFilm}>
      <div className="film-dialog-heading"><h2 id="film-title">다다철거 / 공간의 다음</h2><button type="button" onClick={() => dialog.current?.close()} autoFocus aria-label="브랜드 필름 닫기">닫기 ×</button></div>
      {previewOpen ? <video ref={preview} src={`${filmBase}-desktop.mp4`} poster={`${filmBase}-desktop.jpg`} controls autoPlay muted playsInline preload="metadata" /> : null}
      <p>AI로 제작한 브랜드 연출 영상입니다. 실제 시공 현장이나 전후 기록이 아닙니다. 음성 없는 영상입니다.</p>
    </dialog>
  </>;
}
