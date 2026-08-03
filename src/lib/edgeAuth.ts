// ─────────────────────────────────────────────────────────────────────────
// Edge 런타임에서도 안전하게 동작하는 세션 토큰 서명/검증.
//
// middleware.ts는 Edge 런타임에서 실행되므로 여기서 쓰는 코드는 Web Crypto API만
// 사용해야 한다(Node 전용 `crypto`/`Buffer` 모듈 금지).
//
// ⚠️ 주의(자매 프로젝트 home-repair-promo에서 실제로 겪은 버그):
// 쿠키 payload를 `atob()`로 base64 디코딩한 문자열을 곧바로 `JSON.parse`하면,
// atob은 바이트를 라틴-1(1바이트=1문자)로 해석하기 때문에 한글 등 멀티바이트
// 문자가 깨진다. 반드시 `TextDecoder("utf-8")`로 바이트 배열을 디코딩한 뒤
// JSON.parse해야 한다. 아래 base64UrlDecodeToString이 이를 처리한다.
// ─────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7일

type SessionPayload = {
  u: string; // username
  exp: number; // epoch ms
};

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// 한글 등 멀티바이트 문자가 깨지지 않도록 반드시 TextDecoder를 거친다.
function base64UrlDecodeToString(value: string): string {
  return new TextDecoder("utf-8").decode(base64UrlDecodeToBytes(value));
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET 환경변수가 설정되어 있지 않습니다. 관리자 로그인을 사용하려면 반드시 설정해야 합니다."
    );
  }
  return secret;
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = getSessionSecret();
  const payload: SessionPayload = { u: username, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = base64UrlEncodeString(JSON.stringify(payload));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const sigB64 = base64UrlEncodeBytes(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

/** 서명이 유효하고 만료되지 않았으면 payload를, 아니면 null을 반환한다. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  try {
    const secret = getSessionSecret();
    const key = await importHmacKey(secret);
    const signature = base64UrlDecodeToBytes(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as BufferSource,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const json = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.u !== "string" || !payload.u) return null;
    return payload;
  } catch (error) {
    console.error("[edgeAuth] verifySessionToken failed", error);
    return null;
  }
}
