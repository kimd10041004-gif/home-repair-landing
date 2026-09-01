import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/edgeAuth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_ATTEMPTS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10분

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`admin-login:${ip}`, MAX_ATTEMPTS_PER_WINDOW, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminUsername || !adminPasswordHash) {
    console.error("[api/admin/login] ADMIN_USERNAME 또는 ADMIN_PASSWORD_HASH 환경변수가 설정되지 않았습니다.");
    return NextResponse.json({ error: "관리자 로그인이 아직 설정되지 않았습니다." }, { status: 500 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  // 아이디는 상수 시간 비교가 아니어도 큰 위험이 없다(단일 계정, 값 자체가 비밀이 아님).
  if (username !== adminUsername) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const ok = await verifyPassword(password, adminPasswordHash);
  if (!ok) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
  return res;
}
