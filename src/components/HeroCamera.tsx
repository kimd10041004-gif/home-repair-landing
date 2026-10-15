"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getImageProps } from "next/image";

const alt = "문틀과 실내 공간을 확인하는 안전장비 착용 성인 · 연출 예시";
const { props: { srcSet: desktop } } = getImageProps({ src: "/dada/hero-wide.webp", width: 1672, height: 941, alt, sizes: "100vw" });
const { props: { srcSet: mobile, ...image } } = getImageProps({ src: "/dada/hero-mobile.webp", width: 752, height: 1344, alt, sizes: "100vw", loading: "eager", fetchPriority: "high" });
const scenes = ["진입하는 시선", "동선을 따라", "공간을 둘러보다"];
const media = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
 const query = window.matchMedia(media);
 query.addEventListener("change", callback);
 return () => query.removeEventListener("change", callback);
}
const reducedSnapshot = () => window.matchMedia(media).matches;
const serverSnapshot = () => true;

export default function HeroCamera() {
 const [scene, setScene] = useState(0);
 const [paused, setPaused] = useState(false);
 const [away, setAway] = useState(false);
 const [hidden, setHidden] = useState(false);
 const [failed, setFailed] = useState(false);
 const root = useRef<HTMLDivElement>(null);
 const reduced = useSyncExternalStore(subscribe, reducedSnapshot, serverSnapshot);
 const running = !paused && !reduced && !away && !hidden && !failed;

 useEffect(() => {
  const visibility = () => setHidden(document.hidden);
  document.addEventListener("visibilitychange", visibility);
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting)) : null;
  if (root.current) observer?.observe(root.current);
  return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); };
 }, []);

 return <div ref={root} className="camera-tour" data-running={running} data-scene={scene}>
  <picture key={scene} className={`hero-scene camera-motion camera-motion-${scene}`} onAnimationEnd={() => { if (running) setScene(value => (value + 1) % scenes.length); }}>
   <source media="(min-width: 701px)" srcSet={desktop} sizes="100vw" />
   <source srcSet={mobile} sizes="100vw" />
   {/* Responsive art direction keeps a separate crop on small screens. */}
   <img {...image} alt={alt} onError={() => setFailed(true)} />
  </picture>
  <div className="camera-shade" aria-hidden="true" />
  <div className="camera-controls" role="group" aria-label="상단 사진 움직임">
   <div className="camera-control-heading"><span>SPACE JOURNEY</span><span>0{scene + 1} / 03</span></div>
   <div className="camera-scenes">{scenes.map((label, index) => <button key={label} type="button" aria-label={`${index + 1}번 움직임: ${label}`} aria-pressed={scene === index} onClick={() => setScene(index)}><span>0{index + 1}</span>{label}</button>)}</div>
   <div className="camera-control-foot"><span>{reduced ? "움직임 줄이기 설정 적용" : "사진에 더한 카메라 움직임"}</span><button type="button" aria-pressed={paused} disabled={reduced || failed} onClick={() => setPaused(value => !value)}>{paused ? "자동순환 재생" : "자동순환 일시정지"}</button></div>
  </div>
 </div>;
}
