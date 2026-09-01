import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateSubmittedPhotoUrls } from "@/lib/uploadImage";

/**
 * 에어비앤비 세팅 케어 전용 상담 신청 접수 라우트.
 * 이 프로젝트의 DB에는 저장하지 않고, 세입자·주거 케어/스마트홈과 동일하게
 * home-repair-promo의 write-only 전용 엔드포인트로 그대로 전달(proxy)만 한다.
 */
const AIRBNB_SETUP_ESTIMATE_ENDPOINT =
  process.env.AIRBNB_SETUP_ESTIMATE_ENDPOINT ??
  "https://home-repair-promo.vercel.app/api/public-airbnb-setup-estimate";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`airbnb-setup:${ip}`, 5, 60_000);
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
      contact,
      region,
      residenceType,
      packageId,
      workItems,
      workQuantities,
      hasOwnMaterial,
      preferredSchedule1,
      preferredSchedule2,
      photoUrls,
      extraNote,
      consents,
    } = body ?? {};

    if (!name || !contact || !region || !packageId) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }
    if (!preferredSchedule1) {
      return NextResponse.json(
        { error: "희망 방문일 1지망을 입력해주세요." },
        { status: 400 }
      );
    }
    const validatedPhotoUrls = validateSubmittedPhotoUrls(photoUrls);
    if (!validatedPhotoUrls.ok) {
      return NextResponse.json({ error: validatedPhotoUrls.error }, { status: validatedPhotoUrls.status });
    }

    const requiredConsentIds = [
      "privacy",
      "priceTerms",
      "licenseResponsibility",
      "landlordCheck",
      "cancelPolicy",
    ];
    const consentMap: Record<string, boolean> =
      consents && typeof consents === "object" ? consents : {};
    const missingRequired = requiredConsentIds.some(
      (id) => !consentMap[id]
    );
    if (missingRequired) {
      return NextResponse.json(
        { error: "필수 동의 항목에 모두 동의해주세요." },
        { status: 400 }
      );
    }

    const upstreamRes = await fetch(AIRBNB_SETUP_ESTIMATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "airbnb-setup",
        name,
        contact,
        region,
        residenceType,
        packageId,
        workItems: Array.isArray(workItems) ? workItems : [],
        workQuantities: workQuantities ?? "",
        hasOwnMaterial: Boolean(hasOwnMaterial),
        preferredSchedule1,
        preferredSchedule2: preferredSchedule2 ?? "",
        photoUrls: validatedPhotoUrls.urls,
        extraNote: extraNote ?? "",
        consents: consentMap,
      }),
    });

    const upstreamData = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error:
            upstreamData.error ||
            "상담 신청 접수에 실패했습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: upstreamRes.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/airbnb-setup] proxy failed", error);
    return NextResponse.json(
      { error: "상담 신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
