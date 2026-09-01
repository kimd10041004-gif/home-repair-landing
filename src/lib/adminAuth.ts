import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/edgeAuth";

export async function requireAdminSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return {
      session: null,
      unauthorizedResponse: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }),
    };
  }

  return {
    session,
    unauthorizedResponse: null,
  };
}
