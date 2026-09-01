import type { NextRequest } from "next/server";

/**
 * 아주 단순한 인메모리(in-memory) IP 기반 rate limit.
 *
 * ⚠️ 한계: Vercel 서버리스 환경에서는 함수 인스턴스가 여러 개로 분리되거나
 * 콜드 스타트로 재시작될 수 있어, 이 메모리 카운터가 완벽하게 전역적으로
 * 공유되지 않는다. 즉 "분당 N회"는 인스턴스별 best-effort 제한이며, 완전한
 * 어뷰징 방지가 필요하다면 Redis 등 외부 저장소 기반 rate limit(예:
 * Upstash Ratelimit)로 교체해야 한다. 지금은 단순 스팸/폭주성 요청을 줄이기
 * 위한 최소한의 안전장치로만 사용한다.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// 오래된 IP 항목이 메모리에 무한히 쌓이지 않도록 가끔 청소한다.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfNeeded(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(req: NextRequest): string {
  // Vercel/프록시 환경에서는 x-forwarded-for의 첫 번째 IP가 실제 클라이언트다.
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * 지정한 key(보통 "라우트이름:IP")에 대해 windowMs 동안 limit회까지만 허용한다.
 * 허용되면 true, 초과했으면 false를 반환한다.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupIfNeeded(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
