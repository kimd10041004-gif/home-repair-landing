"use client";
import { useEffect, useRef, useState } from "react";

const scenes = ["01-entry", "02-corridor", "03-room"];
const labels = ["입구", "복도", "실내"];
const asset = (index: number, suffix: string) => `/dada/video/${scenes[index]}${suffix}`;

export default function HeroVideos() {
  const video = useRef<HTMLVideoElement>(null);
  const toggle = useRef<() => void>(() => {});
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let index = 0;
    let stopped = false;
    let disposed = false;
    let attempt = 0;
    const pause = () => { attempt++; film.pause(); };
    const play = async () => {
      if (disposed || stopped || motion.matches || document.hidden) return;
      const token = ++attempt;
      try {
        await film.play();
        if (disposed || stopped || motion.matches || document.hidden) film.pause();
      } catch {
        if (!disposed && token === attempt) {
          film.dataset.ready = "false";
          setPlaying(false);
          setStatus("정지 이미지 · 재생 버튼으로 다시 시도할 수 있습니다.");
        }
      }
    };
    const load = () => {
      film.dataset.ready = "false";
      film.poster = asset(index, "-poster.jpg");
      film.src = asset(index, ".mp4");
      film.load();
      setScene(index);
      void play();
    };
    const sync = () => {
      if (motion.matches) {
        pause();
        film.dataset.ready = "false";
        film.removeAttribute("src");
        film.load();
        setStatus("동작 줄이기 · 정지 이미지");
      } else if (document.hidden) pause();
      else if (!film.getAttribute("src")) load();
      else void play();
    };
    const ended = () => { index = (index + 1) % scenes.length; load(); };
    const requested = () => setPlaying(true);
    const started = () => { film.dataset.ready = "true"; setStatus(""); };
    const paused = () => setPlaying(false);
    const failed = () => { pause(); film.dataset.ready = "false"; setStatus("영상을 불러오지 못해 정지 이미지를 표시합니다."); };
    toggle.current = () => {
      if (motion.matches) return;
      if (!film.paused) { stopped = true; pause(); }
      else { stopped = false; if (film.error) load(); else void play(); }
    };
    film.addEventListener("ended", ended);
    film.addEventListener("play", requested);
    film.addEventListener("playing", started);
    film.addEventListener("pause", paused);
    film.addEventListener("error", failed);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      film.removeEventListener("ended", ended);
      film.removeEventListener("play", requested);
      film.removeEventListener("playing", started);
      film.removeEventListener("pause", paused);
      film.removeEventListener("error", failed);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      pause();
      film.removeAttribute("src");
      film.load();
    };
  }, []);

  return <>
    <div className="hero-scene hero-video-scene" data-scene={scene} aria-hidden="true">
      {/* Native poster remains visible without JavaScript, reduced motion, or successful playback. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(scene, "-poster.jpg")} alt="" fetchPriority="high" />
      <video ref={video} muted playsInline preload="none" poster={asset(scene, "-poster.jpg")} tabIndex={-1} />
    </div>
    <span className="scene-caption">AI 연출 예시 · {labels[scene]}</span>
    <div className="hero-video-controls">
      <button type="button" onClick={() => toggle.current()} aria-label={playing ? "배경 영상 일시 정지" : "배경 영상 재생"}>{playing ? "영상 일시 정지" : "영상 재생"}</button>
      <span role="status">{status}</span>
    </div>
  </>;
}
