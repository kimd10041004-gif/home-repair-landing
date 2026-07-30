import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * 이 라우트는 견적 문의를 이 프로젝트의 DB에 저장하지 않습니다.
 * home-repair-promo가 제공하는 write-only 전용 엔드포인트로 그대로 전달(proxy)만 합니다.
 * 이 사이트는 고객 데이터를 절대 조회(SELECT)하지 않으며, 저장/조회 로직은
 * home-repair-promo 쪽에서 전담합니다.
 */
const PUBLIC_ESTIMATE_ENDPOINT =
  process.env.PUBLIC_ESTIMATE_ENDPOINT ??
  "https://home-repair-promo.vercel.app/api/public-estimate";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`estimate:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      photoUrls,
      contact,
      address,
      workspace,
      category,
      workType,
      symptom,
      hasOwnMaterial,
      preferredSchedule,
      bundleItems,
      extraItems,
      consent,
    } = body ?? {};

    if (!Array.isArray(photoUrls) || photoUrls.length < 3) {
      return NextResponse.json(
        { error: "사진은 최소 3장 이상 필요합니다." },
        { status: 400 }
      );
    }
    if (!name || !contact || !address || !symptom || !preferredSchedule) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "개인정보 수집·이용에 동의가 필요합니다." },
        { status: 400 }
      );
    }

    const upstreamRes = await fetch(PUBLIC_ESTIMATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        photoUrls,
        contact,
        address,
        workspace: workspace ?? "",
        category: category ?? "",
        workType: workType ?? "",
        symptom,
        hasOwnMaterial: Boolean(hasOwnMaterial),
        preferredSchedule,
        bundleItems: Array.isArray(bundleItems) ? bundleItems : [],
        // extraItems는 이전 버전과의 하위호환을 위해 유지 (묶음유도 답변은 bundleItems로 전달)
        extraItems: extraItems ?? "",
        consent: Boolean(consent),
      }),
    });

    const upstreamData = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: upstreamData.error || "문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: upstreamRes.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/estimate] proxy failed", error);
    return NextResponse.json(
      { error: "문의 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
