import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import CtaBar from "@/components/CtaBar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://home-repair-landing.vercel.app"),
  title: `${BRAND.name} | ${BRAND.tagline}`,
  description:
    "사진으로 먼저 확인하고, 작업 전 금액을 사전예상으로 안내하는 예약형 집수리 서비스, 반듯집수리. 서울·경기 전지역 방문 가능합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <Nav />
        <CtaBar />
        <main className="flex-1">{children}</main>
        <CtaBar />
        <Footer />
      </body>
    </html>
  );
}
