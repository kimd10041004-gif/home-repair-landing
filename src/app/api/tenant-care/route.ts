import { NextRequest, NextResponse } from "next/server";

/**
 * 세입자 안심 케어 전용 상담 신청 접수 라우트.
 * 이 프로젝트의 DB에는 저장하지 않고, 기존 /api/estimate와 동일하게
 * home-repair-promo의 write-only 전용 엔드포인트로 그대로 전달(proxy)만 한다.
 *
 * ⚠️ 참고: 세입자 안심 케어 전용 접수 엔드포인트가 아직 backend(home-repair-promo)에
 * 준비되지 않았을 수 있다. 준비 여부는 배포 전 별도 확인이 필요하며,
 * 미준비 시 이 라우트는 404/오류를 반환할 수 있다 (최종 보고서에 명시).
 */
const TENANT_CARE_ESTIMATE_ENDPOINT =
  process.env.TENANT_CARE_ESTIMATE_ENDPOINT ??
  "https://home-repair-promo.vercel.app/api/public-tenant-care-estimate";

export async function POST(req: NextRequest) {
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

    if (!name || !contact || !region || !residenceType || !packageId) {
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
    if (!Array.isArray(photoUrls) || photoUrls.length < 1) {
      return NextResponse.json(
        { error: "현장사진을 최소 1장 이상 첨부해주세요." },
        { status: 400 }
      );
    }

    const requiredConsentIds = [
      "privacy",
      "priceTerms",
      "cancelPolicy",
      "landlordCheck",
      "noGuarantee",
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

    const upstreamRes = await fetch(TENANT_CARE_ESTIMATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "tenant-care",
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
        photoUrls,
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
    console.error("[api/tenant-care] proxy failed", error);
    return NextResponse.json(
      { error: "상담 신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
