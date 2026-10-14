"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";

const links = [
  {href:"/#approach",label:"작업의 기준"},
  {href:"/#checklist",label:"철거 전 확인"},
  {href:"/about",label:"사업자 정보"},
];
export default function Nav() {
 const [open,setOpen]=useState(false);
 useEffect(() => {
  const desktop = window.matchMedia("(min-width: 901px)");
  const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
  const closeOnEscape = (event: KeyboardEvent) => {
   if (event.key === "Escape" && document.querySelector(".dada-menu-button")?.getAttribute("aria-expanded") === "true") {
    setOpen(false);
    document.querySelector<HTMLButtonElement>(".dada-menu-button")?.focus();
   }
  };
  desktop.addEventListener("change", closeOnDesktop);
  window.addEventListener("keydown", closeOnEscape);
  return () => {
   desktop.removeEventListener("change", closeOnDesktop);
   window.removeEventListener("keydown", closeOnEscape);
  };
 }, []);
 return <header className="dada-header">
  <div className="dada-header-row">
   <Link href="/" className="dada-brand" onClick={()=>setOpen(false)}><span className="dada-mark" aria-hidden="true">ㄷㄷ</span><span>{SITE.name}<small>{SITE.tagline}</small></span></Link>
   <nav className="dada-desktop" aria-label="주요 메뉴">{links.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/estimate">사진 상담 ↗</Link></nav>
   <button className="dada-menu-button" type="button" aria-label={open?"메뉴 닫기":"메뉴 열기"} aria-expanded={open} aria-controls="dada-mobile-menu" onClick={()=>setOpen(!open)}>{open?"닫기":"메뉴"}</button>
  </div>
  {open && <nav id="dada-mobile-menu" className="dada-mobile-menu" aria-label="모바일 메뉴">{[...links,{href:"/estimate",label:"사진 상담"}].map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}>{item.label}</Link>)}</nav>}
 </header>;
}
