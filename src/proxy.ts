import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/edgeAuth";

const BLOCKED_HOSTS = new Set(["bandeutjipsuri.co.kr", "www.bandeutjipsuri.co.kr"]);

function getRequestHost(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host") ?? req.nextUrl.host;
  return host.split(":")[0].toLowerCase();
}

// 기존 도메인은 더 이상 리다이렉트하지 않고 모든 경로에서 즉시 차단한다.
// Next.js 16에서는 middleware 대신 proxy 파일 규약을 사용한다.
export async function proxy(req: NextRequest) {
  if (BLOCKED_HOSTS.has(getRequestHost(req))) {
    return new NextResponse("This domain is no longer available.", {
      status: 410,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
