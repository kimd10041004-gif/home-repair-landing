import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAuth";
import { SESSION_COOKIE_NAME } from "@/lib/edgeAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.unauthorizedResponse) return auth.unauthorizedResponse;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
