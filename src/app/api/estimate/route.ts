import { NextRequest, NextResponse } from "next/server";
import { insertEstimateInquiry } from "@/lib/db";

// 이 API 라우트는 오직 INSERT(신규 문의 저장)만 수행합니다.
// GET, PUT, DELETE 등 다른 메서드는 의도적으로 구현하지 않습니다 (조회 불가).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      photoUrls,
      contact,
      address,
      symptom,
      hasOwnMaterial,
      preferredSchedule,
      extraItems,
      consent,
    } = body ?? {};

    if (!Array.isArray(photoUrls) || photoUrls.length < 3) {
      return NextResponse.json(
        { error: "사진은 최소 3장 이상 필요합니다." },
        { status: 400 }
      );
    }
    if (!contact || !address || !symptom || !preferredSchedule) {
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

    const result = await insertEstimateInquiry({
      photoUrls,
      contact,
      address,
      symptom,
      hasOwnMaterial: hasOwnMaterial ?? "",
      preferredSchedule,
      extraItems: extraItems ?? "",
      consent: Boolean(consent),
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    console.error("[api/estimate] insert failed", error);
    return NextResponse.json(
      { error: "문의 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
