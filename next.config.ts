import type { NextConfig } from "next";

// 최종 개편안 8번: CSP 등 기본 보안 헤더를 사이트 전역에 적용한다.
// 이 프로젝트는 next/font(자체 호스팅), 로컬 정적 이미지, 사진 미리보기용 blob: URL,
// 관리자가 업로드한 Vercel Blob 공개 이미지와 동일 출처(/api/*) 호출을 허용한다.
// YouTube는 사용자 클릭 후 개인정보 보호 강화 모드 iframe으로만 불러온다.
// 카카오톡 채널 링크는 새 탭에서 여는 일반 <a href> 링크일 뿐 iframe/스크립트 삽입이
// 아니므로 별도 CSP 허용이 필요하지 않다.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // 관리자가 업로드한 사진(Vercel Blob 공개 URL)을 next/image로 최적화해 표시하기 위함.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    return [{ source: "/demolition-support", destination: "/demolition-support/index.html" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
