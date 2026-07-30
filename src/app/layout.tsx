import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import MobileBottomBar from "@/components/MobileBottomBar";
import Footer from "@/components/Footer";
import { SITE, getVisibleBusinessFields } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "생활 집수리, 세입자·주거 케어, 스마트홈 IoT 설치까지 서비스별로 구분해 안내하는 예약형 집수리 서비스, 반듯집수리. 서울·경기 전 지역 방문 가능합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://home-repair-landing.vercel.app"),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 구조화 데이터(JSON-LD)에는 실제로 입력된 사업자정보만 포함하고,
  // 미입력 값(사업자등록번호, 주소 등)은 절대 채워 넣지 않는다.
  const businessFields = getVisibleBusinessFields();
  const businessInfoMap = Object.fromEntries(
    businessFields.map((f) => [f.label, f.value])
  );
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: businessInfoMap["상호"] ?? SITE.name,
    telephone: SITE.phone,
    areaServed: SITE.serviceArea,
    ...(businessInfoMap["대표자"] ? { founder: businessInfoMap["대표자"] } : {}),
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Nav />
        {/* 모바일 하단 고정바(높이 약 4.5rem)에 본문이 가려지지 않도록 여백 확보 */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  );
}

