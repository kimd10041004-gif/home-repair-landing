// ─────────────────────────────────────────────────────────────────────────
// 관리자 인증 (Node 런타임 전용: 로그인 API 라우트에서만 사용)
//
// 사장님 1명만 로그인하면 되는 사이트이므로 역할(role) 구분 없이 아이디/비밀번호
// 하나만 검증한다. bcrypt 같은 별도 네이티브 의존성을 추가하지 않고, Node와
// Edge 런타임 모두에서 동일하게 동작하는 Web Crypto(`crypto.subtle`)의 PBKDF2와
// HMAC만으로 비밀번호 해시/검증과 세션 토큰 서명을 구현한다.
// ─────────────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_HASH = "SHA-256";
const PBKDF2_KEY_LENGTH_BITS = 256;

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of buf) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: PBKDF2_HASH },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BITS
  );
  return new Uint8Array(derived);
}

/** 저장 형식: pbkdf2$<iterations>$<saltBase64Url>$<hashBase64Url> */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  const salt = fromBase64Url(parts[2]);
  const expected = fromBase64Url(parts[3]);
  const actual = await pbkdf2(password, salt, iterations);
  if (actual.length !== expected.length) return false;
  // 타이밍 공격 방지를 위한 상수 시간 비교.
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export { createSessionToken } from "./edgeAuth";
