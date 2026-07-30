// ─────────────────────────────────────────────────────────────────────────
// 반듯집수리 홈페이지 공통 데이터 계층
//
// 이 파일은 "생활 집수리 / 세입자·주거 케어 / 스마트홈 IoT 케어" 세 서비스의
// 가격·정책·문구를 완전히 분리해서 관리한다. 세 서비스의 데이터를 합치거나
// 서로의 값을 재사용하지 않는다(2026-07-30 개편 스펙 2번 항목).
// ─────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: "반듯집수리",
  tagline: "예약형 집수리",
  serviceArea: "서울·경기 전 지역 방문 가능합니다",
  phone: "010-2370-5091",
  kakaoUrl: "http://pf.kakao.com/_kHyfX/chat",
} as const;

// ── 사업자정보: 값이 없는 항목은 화면에 절대 표시하지 않는다 ────────────────
// 기존에 들어있던 사업자등록번호("000-00-00000")와 주소("○○로 00")는
// 실제 값이 아닌 자리표시자이므로 "미입력"으로 간주해 빈 문자열로 둔다.
// 전화·카카오 상담 링크는 실제 작동하는 값이므로 그대로 보존한다.
export type BusinessInfoField = {
  label: string;
  value: string;
};

const RAW_BUSINESS_INFO = {
  상호: "반듯집수리",
  대표자: "권태우",
  사업자등록번호: "",
  통신판매업신고번호: "",
  대표연락처: SITE.phone,
  카카오톡채널: "'반듯집수리' 검색",
  이메일: "",
  정책시행일: "",
} as const;

export function getVisibleBusinessFields(): BusinessInfoField[] {
  return Object.entries(RAW_BUSINESS_INFO)
    .filter(([, value]) => Boolean(value && value.trim()))
    .map(([label, value]) => ({ label, value }));
}

export const BUSINESS = RAW_BUSINESS_INFO;

// 기존 코드 호환용 별칭(전화/카카오/상호/대표자만 실제 값 보존, 나머지는 조건부 표시로 이관)
export const BRAND = {
  name: SITE.name,
  tagline: SITE.tagline,
  serviceArea: SITE.serviceArea,
  phone: SITE.phone,
  kakaoUrl: SITE.kakaoUrl,
  businessName: RAW_BUSINESS_INFO.상호,
  businessOwner: RAW_BUSINESS_INFO.대표자,
} as const;

// ── 헤더 내비게이션 (스펙 7번: 서비스/케어 패키지/스마트홈/작업사례/이용안내/상담) ──
export const NAV_ITEMS = [
  { href: "/services", label: "서비스" },
  { href: "/tenant-care", label: "케어 패키지" },
  { href: "/smart-home", label: "스마트홈" },
  { href: "/reviews", label: "작업사례" },
  { href: "/guide", label: "이용안내" },
  { href: "/estimate", label: "상담" },
] as const;

// 모바일 전체 메뉴에는 헤더에 없는 회사소개도 함께 노출한다.
export const MOBILE_EXTRA_NAV_ITEMS = [
  { href: "/about", label: "회사소개" },
] as const;

export const ESTIMATE_CTA_LABEL = "사진 상담 시작";

// ── 공통 운영정책(스펙 3번) ──────────────────────────────────────────────
export const TRAVEL_FEE_WON = 20000;
export const TRAVEL_FEE_NOTICE =
  "출장비는 방문 1회당 20,000원이며, 같은 방문에서 여러 작업을 진행해도 출장비는 한 번만 적용됩니다. 서울·경기 전 지역 동일하게 적용됩니다.";
export const MIN_SINGLE_VISIT_WON = 150000;
export const PURCHASE_AGENCY_FEE_WON = 30000;
export const EXTRA_LABOR_FEE_NOTICE =
  "추가공임은 작업자 1인 기준 30분당 50,000원이며, 2인 이상 투입 시 인원에 비례합니다. 추가 작업은 내용·금액·승인 시각을 안내하고 고객님이 동의한 뒤에만 진행합니다.";
export const ESTIMATE_VALIDITY_NOTICE = "견적 유효기간은 발송일로부터 7일입니다.";
export const VAT_NOTICE = "홈페이지에 공개된 모든 금액은 부가가치세(VAT)를 포함한 금액입니다.";

export const COMMON_OPERATION_NOTES = [
  "서비스 지역: 서울·경기 전 지역",
  TRAVEL_FEE_NOTICE,
  "유료주차비·고속도로 통행료는 사전 안내 후 실제 발생액만 별도로 청구합니다.",
  "시공상 하자로 확인된 무상 A/S 방문에는 출장비를 청구하지 않습니다.",
  "사진으로 안내하는 금액은 사전예상액이며, 최종 금액은 현장 상태와 작업 범위를 확인한 뒤 확정됩니다.",
  "고객님의 동의 없이 추가 작업을 진행하지 않습니다.",
  `기본 구매대행비는 동일 판매처 1회 주문 기준 ${PURCHASE_AGENCY_FEE_WON.toLocaleString("ko-KR")}원이며, 추가 주문·특수 운반·화물배송은 사전 승인 후 별도로 안내합니다.`,
  ESTIMATE_VALIDITY_NOTICE,
  VAT_NOTICE,
] as const;

// ── 계약금/결제정책(스펙 4번) ────────────────────────────────────────────
export const DEPOSIT_RATE = 0.3;

export const DEPOSIT_POLICY_TEXT =
  "사진상담 또는 필요한 경우 현장 실측 후 견적서를 보내드립니다. 견적서와 주요 거래조건을 확인한 뒤, 제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하면 일정이 확정됩니다. 구매대행 제품·자재비는 고객 승인 후 구매 전에 별도로 결제합니다. 계약금은 총 작업대금에 포함되며 잔금에서 전액 차감됩니다.";

export const REFUND_POLICY_TEXT =
  "계약금은 총 작업대금의 일부로 선지급되는 금액입니다. 취소·환불은 관계 법령을 우선 적용하며, 이미 제공된 실측·작업과 고객 승인 후 구매한 주문제작품 또는 실제로 회수하지 못한 제품·자재비가 있는 경우 증빙을 기준으로 정산합니다. 주문 취소나 반품으로 회수된 금액은 고객 부담액에서 제외합니다. 반듯집수리 사정으로 작업이 취소되는 경우 수령한 계약금과 제품·자재비를 전액 반환합니다.";

export const DEPOSIT_SUMMARY_NOTES = [
  "제품비·자재비를 제외한 계약대상 서비스 금액(공임·설정비·출장비·구매대행비)의 30%를 계약금으로 결제합니다.",
  "계약금은 별도 수수료가 아니라 총대금의 일부이며, 잔금에서 전액 차감됩니다.",
  "반듯집수리가 대리구매하는 제품비·자재비는 고객 승인 후 구매 전에 전액 별도로 결제합니다.",
  "작업 완료와 작동 확인 후 잔금과 고객이 승인한 추가 작업비를 결제합니다.",
  "계약금 30%는 자동 환불불가 위약금이 아니며, 취소·환불은 관계 법령과 실제 제공된 범위를 기준으로 정산합니다.",
] as const;

// ── 상담 진행 절차(스펙 8-⑥) ─────────────────────────────────────────────
export const CONSULT_PROCESS_STEPS = [
  "사진과 요청사항 접수",
  "사전예상액과 방문 범위 안내",
  "필요한 경우 실측 및 견적서 발송",
  "계약금 30% 결제 후 일정 확정",
  "현장 확인과 고객 동의 후 작업",
  "작동 확인·정리·사용 안내",
  "잔금 결제",
] as const;

export const TRUST_CRITERIA = [
  "사진 기준 사전예상액",
  "현장 확인 후 최종 금액 확정",
  "동의 없는 추가 작업 없음",
  "작업 전·중·후 기록",
  "제품 하자와 설치 하자 구분",
  "고객 계정과 개인정보 보호",
  "작업 후 주변 정리",
] as const;

// ── 견적 신청폼: 작업유형 조건분기 (생활 집수리 챗봇용, 기존 로직 보존) ─────
export type WorkCategoryId = "general" | "interior";

export const WORK_CATEGORIES: {
  id: WorkCategoryId;
  label: string;
  examples: string;
}[] = [
  {
    id: "general",
    label: "일반 생활수리",
    examples: "수전·누수·배수구·전등·콘센트·도어락 등",
  },
  {
    id: "interior",
    label: "인테리어·규격교체",
    examples: "방충망·문·창문·타일·벽/바닥·거울·선반·가구 등",
  },
];

export const WORK_TYPES_BY_CATEGORY: Record<WorkCategoryId, string[]> = {
  general: [
    "수전교체",
    "누수수리",
    "배수구",
    "전등/콘센트",
    "도어락",
    "기타 생활수리",
  ],
  interior: [
    "방충망",
    "문 교체",
    "창문",
    "타일",
    "벽/바닥",
    "거울/선반/가구",
    "기타 인테리어·규격교체",
  ],
};

export type PhotoSlot = {
  id: string;
  label: string;
  required: boolean;
  hint: string;
  goodExample: string;
  badExample: string;
};

// 작업유형(일반수리 vs 규격교체)에 따라 필수 업로드칸 구성이 달라집니다.
export const PHOTO_SLOTS_BY_CATEGORY: Record<WorkCategoryId, PhotoSlot[]> = {
  general: [
    {
      id: "overall",
      label: "전체 사진",
      required: true,
      hint: "고장 부위와 주변 작업 공간이 함께 보이도록 촬영해 주세요.",
      goodExample: "부위 전체와 주변 환경이 함께 보이는 사진",
      badExample: "너무 가까이 찍혀 주변이 안 보이거나 흔들린 사진",
    },
    {
      id: "closeup",
      label: "근접 사진",
      required: true,
      hint: "누수, 파손, 부식 등 문제가 발생한 부분을 선명하게 촬영해 주세요.",
      goodExample: "누수·파손·고장 부위가 선명하게 보이는 사진",
      badExample: "초점이 맞지 않아 문제 부위가 흐릿한 사진",
    },
    {
      id: "connector",
      label: "연결부·제품정보 사진",
      required: true,
      hint: "연결부, 모델명, 제조사 또는 제품 규격이 보이도록 촬영해 주세요.",
      goodExample: "제품 뒷면·측면의 모델명 스티커가 보이는 사진",
      badExample: "라벨 부분이 가려지거나 잘려 나온 사진",
    },
    {
      id: "extra",
      label: "추가 사진 (선택)",
      required: false,
      hint: "설명이 더 필요한 부분이 있다면 추가로 첨부",
      goodExample: "",
      badExample: "",
    },
  ],
  interior: [
    {
      id: "front",
      label: "정면 전체 사진",
      required: true,
      hint: "설치·교체할 부위의 정면 전체가 보이도록 촬영",
      goodExample: "방충망/문/창문 등 전체 틀이 다 보이는 정면 사진",
      badExample: "비스듬히 찍혀 전체 규격을 가늠하기 어려운 사진",
    },
    {
      id: "widthMeasure",
      label: "가로 측정 사진",
      required: true,
      hint: "줄자를 가로 방향으로 대고 시작점과 끝점, 숫자가 모두 보이도록 촬영해 주세요.",
      goodExample: "줄자 눈금과 측정 대상이 함께 선명하게 보이는 사진",
      badExample: "줄자 눈금이 보이지 않거나 초점이 안 맞는 사진",
    },
    {
      id: "heightMeasure",
      label: "세로 측정 사진",
      required: true,
      hint: "줄자를 세로 방향으로 대고 위·아래 기준점과 숫자가 모두 보이도록 촬영해 주세요.",
      goodExample: "줄자 눈금과 측정 대상이 함께 선명하게 보이는 사진",
      badExample: "줄자 눈금이 보이지 않거나 초점이 안 맞는 사진",
    },
    {
      id: "extra",
      label: "두께·깊이·연결부 추가 사진 (선택)",
      required: false,
      hint: "두께, 깊이, 연결부 등 추가로 확인이 필요한 부분",
      goodExample: "",
      badExample: "",
    },
  ],
};

// 필수 업로드칸 미충족 시 카테고리별로 다르게 노출하는 제출 차단 안내 문구
export const PHOTO_VALIDATION_ERROR_BY_CATEGORY: Record<WorkCategoryId, string> = {
  general: "정확한 견적 확인을 위해 필수 사진 3장을 모두 등록해 주세요.",
  interior: "정면 전체 사진과 가로·세로 측정 사진을 모두 등록해 주세요.",
};

export const WORKSPACE_OPTIONS = [
  "주방",
  "욕실",
  "거실",
  "방",
  "현관",
  "발코니/베란다",
  "기타",
];

// 방문 시 함께 점검을 유도하기 위한 마지막 단계 선택 항목("현재 작업만 필요"는 단독 선택)
export const BUNDLE_ITEMS = [
  "전등·스위치",
  "수전·배수",
  "문고리·도어락",
  "실리콘·부분마감",
  "방충망·창문",
  "벽·바닥·타일",
  "현재 작업만 필요",
] as const;
export const BUNDLE_NONE_OPTION = "현재 작업만 필요";

export const PRIVACY_CONSENT_TEXT =
  "수집목적: 방문 견적 상담 및 예약, 작업 진행을 위해 개인정보를 수집·이용합니다.\n" +
  "수집항목: 이름, 연락처, 방문지역·주소, 상담내용(작업공간·작업종류·문제증상 등), 첨부사진, 희망 방문일정.\n" +
  "보유기간: 상담·작업 완료 후 관련 법령에 따른 보관기간까지 보관하며, 정확한 보유기간은 추후 확정 예정입니다.\n" +
  "처리근거: 정보주체의 동의(개인정보보호법 제15조).\n" +
  "고객님은 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으며, 동의하지 않으실 경우 견적 상담 접수가 제한될 수 있습니다.\n" +
  "포트폴리오·후기 활용, 광고성 정보 수신은 별도의 선택 동의 항목이며, 선택 동의를 거부하셔도 상담·계약·시공·A/S 진행에는 제한이 없습니다.";

// 접수완료 화면 등에 표시하는 예상견적 안내 원칙 문구 (용어 원칙: "예상 견적/비용범위", 확정견적 금지)
export const ESTIMATE_DISCLAIMER_TEXT =
  "견적 신청이 접수되었습니다.\n" +
  "보내주신 사진과 내용을 확인한 후 사진 기준 예상 작업 범위와 비용을 안내해 드립니다.\n" +
  "사진만으로 확인하기 어려운 부분이 있는 경우 카카오톡 또는 전화로 추가 사진과 정보를 요청드릴 수 있습니다.\n" +
  "최종 작업금액은 현장을 확인한 뒤 작업 시작 전에 안내하며, 고객님의 동의를 받은 후 작업을 진행합니다.";

// 방문 일정이 확정될 때(상담 단계에서) 안내되는 계약금 정책 문구
// (구 고정 예약금 40,000원 정책은 완전히 폐기되었다 — 스펙 4번)
export const DEPOSIT_NOTICE_TEXT = DEPOSIT_POLICY_TEXT;

// ── ① 생활 집수리 (스펙 2-A, 8-③) ────────────────────────────────────────
export type RepairCategory = {
  id: string;
  title: string;
  representativeWork: string;
  description: string;
  imageSrc?: string;
};

export const REPAIR_CATEGORIES: RepairCategory[] = [
  {
    id: "water",
    title: "수도·배수",
    representativeWork: "수전 교체·누수 점검·싱크대 배수구 교체",
    description:
      "주방·욕실 수전 교체와 누수 점검, 배수구 막힘·교체 작업입니다. 자재비는 별도이며 제품별 가격 차이가 큽니다.",
    imageSrc: "/brand/kitchen-faucet.png",
  },
  {
    id: "door",
    title: "문·도어락",
    representativeWork: "문고리·도어락 교체",
    description: "문고리 교체와 디지털 도어락 설치입니다. 자재비는 별도입니다.",
    imageSrc: "/brand/entryway-doorlock.png",
  },
  {
    id: "electric",
    title: "조명·전기부속",
    representativeWork: "LED 조명·스위치·콘센트 교체",
    description: "LED 조명, 스위치, 콘센트 교체 작업입니다. 자재비는 별도입니다.",
    imageSrc: "/brand/outlet-switch.png",
  },
  {
    id: "screen",
    title: "방충망",
    representativeWork: "방충망 교체",
    description:
      "방충망 교체 및 보수 작업입니다. 규격 확인을 위해 줄자 측정 사진이 필요하며 자재비는 별도입니다.",
    imageSrc: "/brand/window-screen.png",
  },
  {
    id: "curtain",
    title: "커튼·블라인드",
    representativeWork: "커튼·블라인드 설치",
    description: "커튼과 블라인드 설치 작업입니다. 자재비는 별도입니다.",
  },
  {
    id: "bathroom-kitchen",
    title: "욕실·주방 설치",
    representativeWork: "욕실·주방 소품 설치",
    description: "욕실·주방 소품 설치 작업입니다. 자재비는 별도입니다.",
  },
  {
    id: "living-goods",
    title: "생활소품 설치",
    representativeWork: "생활소품 설치",
    description: "생활소품 설치 작업입니다. 자재비는 별도입니다.",
  },
  {
    id: "etc",
    title: "기타 사진상담",
    representativeWork: "기타 생활 불편 수리",
    description:
      "목록에 없는 자잘한 생활 불편도 편하게 문의해주세요. 사진을 보내주시면 작업 가능 여부와 예상 비용을 안내해드립니다.",
    imageSrc: "/brand/livingroom-paint.png",
  },
];

export const REPAIR_POLICY_NOTES = [
  `단독 방문 최소 결제금액 ${MIN_SINGLE_VISIT_WON.toLocaleString("ko-KR")}원`,
  `출장비 방문 1회당 ${TRAVEL_FEE_WON.toLocaleString("ko-KR")}원 별도`,
  "자재비 별도",
  "공개 금액은 VAT 포함",
  "가격이 확정되지 않은 작업에 임의의 최저가를 표시하지 않습니다.",
  "자격이나 등록이 필요한 작업을 직접 할 수 있는 것처럼 표현하지 않습니다.",
] as const;

// 기존 코드 호환용 별칭
export const SERVICE_CATEGORIES = REPAIR_CATEGORIES;
export const PRICE_NOTE =
  "작업비는 작업 종류, 난이도, 현장 구조, 이동 거리 등에 따라 달라질 수 있습니다. 보내주신 사진을 기준으로 사전예상액을 안내하며, 현장에서 추가 작업이나 금액 변경이 필요한 경우에는 작업 전에 먼저 설명드리고 동의를 받습니다.";

// ── ② 세입자·주거 케어 패키지 (스펙 2-B) ──────────────────────────────────
// 기존 생활 집수리 서비스/가격, 스마트홈 서비스/가격과 절대 혼합하지 않는 독립 서비스.

export const TENANT_CARE = {
  title: "세입자·주거 케어",
  subtitle: "여러 집수리를 한 번의 계획으로",
  intro:
    "입주·퇴거·공실 정비, 부모님 댁 정비처럼 여러 설치와 교체를 한 번의 계획으로 묶어 진행하고 싶으신가요?",
  description:
    "반듯집수리 세입자·주거 케어는 여러 집수리를 한 번의 계획으로 묶어 진행하는 패키지 서비스입니다. 건물의 손상과 구조 변경을 최소화하고, 원상복구를 고려하여 필요한 시설을 교체·설치합니다.",
  descriptionSub:
    "탈거한 기존 부품은 품목별로 분류·포장하여 고객님께 인도하며, 실제 작업 범위와 비용은 사진 상담 후 견적서에 명확히 안내합니다.",
  ctaPrimary: "사진으로 상담 시작",
  ctaSecondary: "카카오톡으로 상담하기",
  ctaNotice:
    "상담 신청만으로 계약이나 결제가 확정되지 않습니다. 사진 확인 후 견적서와 주요 거래조건을 안내하며, 고객 확인과 계약금 30% 결제가 완료되면 일정이 확정됩니다.",
  packageFootnote:
    "안내된 작업 예시가 모두 자동으로 포함되는 것은 아닙니다. 최종 범위는 견적서의 작업 항목과 수량으로 확정됩니다.",
  exclusionNotice:
    "패키지 기본 범위에 포함되지 않는 작업은 사진 또는 현장 확인 후 별도의 사전예상액을 안내합니다.",
  extraWorkNotice1:
    "상담 시 확정된 작업 범위를 초과하거나 현장에서 새로운 작업이 필요한 경우, 작업 내용과 추가 예상금액을 먼저 안내합니다. 고객님의 동의를 받은 후에만 추가 작업을 진행하며, 사전에 동의받지 않은 추가 비용은 청구하지 않습니다.",
  extraWorkNotice2:
    "추가 작업이 당일 진행하기 어렵거나 별도의 자재·인력·장비가 필요한 경우 새로운 일정과 견적을 안내할 수 있습니다.",
  travelFeeNotice: [
    `출장비는 실제 방문 1회당 ${TRAVEL_FEE_WON.toLocaleString("ko-KR")}원이며, 서울·경기 전 지역 동일하게 적용됩니다.`,
    "실측과 본 시공으로 두 번 방문하면 출장비 총 40,000원입니다.",
    "패키지 가격에는 출장비와 자재비가 포함되어 있지 않으며, 견적서에서 항목별로 구분해 안내합니다.",
    "유료주차비와 고속도로 통행료는 실제 발생 여부와 금액을 미리 확정하기 어려워 대표가격에서 제외되며, 발생 가능성을 사전에 안내하고 실제 발생 내역을 확인할 수 있는 경우에만 잔금 정산 시 별도로 청구합니다.",
  ],
  tenantNoticeTitle: "임차인 사전 확인",
  tenantNoticeBody: [
    "본 서비스는 건물의 손상과 변경을 최소화하고 원상복구를 고려한 시공을 지향합니다.",
    "다만 건물의 노후 상태, 기존 마감재 재질, 제품의 접착 방식과 사용 기간에 따라 퇴거 시 미세한 흔적이나 변색이 남을 수 있습니다.",
    "고객은 시설 교체 또는 설치 전에 임대차계약서와 건물 관리규정을 확인하고, 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아야 합니다.",
    "반듯집수리는 고객이 제공한 현장 정보와 확인 내용을 기준으로 작업합니다.",
  ],
  partsHandoverTitle: "기존 부품 인도",
  partsHandoverBody: [
    "수전, 전등, 손잡이, 스위치 등 탈거한 기존 부품은 품목별로 분류·포장하여 작업 완료 후 고객에게 인도합니다.",
    "인도 이후 부품의 보관, 분실, 파손, 부식과 변형에 대한 관리 책임은 고객에게 있습니다.",
    "기존 부품의 상태가 달라지면 퇴거 시 재설치 가능 여부와 작업비가 변경될 수 있습니다.",
  ],
  returnServiceTitle: "퇴거 시 철거·재설치·복구",
  returnServiceBody: [
    "세입자·주거 케어 이용 고객은 퇴거 시 보관 중인 기존 부품을 활용한 재설치 작업을 별도로 신청할 수 있습니다.",
    "퇴거 시 철거·재설치·복구는 패키지에 포함된 무료 서비스가 아니라 별도의 유상 서비스입니다.",
    "보관 부품의 상태와 퇴거 당시 현장 상태를 확인한 후 작업 범위와 사전예상액을 안내합니다.",
  ],
  depositNoticeTitle: "계약금 안내",
  depositNoticeBody: [DEPOSIT_POLICY_TEXT],
  cancelPolicyTitle: "변경·취소·환불 안내",
  cancelPolicyBody: [REFUND_POLICY_TEXT],
  asPolicyTitle: "A/S 및 보증 안내",
  asPolicyBody: [
    "반듯집수리의 설치·시공상 하자에 대한 기본 보증기간은 작업 완료일로부터 6개월입니다.",
    "구체적인 보증 대상과 제외사항은 견적서 또는 작업확인서에 표시합니다.",
    "시공상 하자로 확인되는 경우 무상 A/S를 진행하며 출장·점검비를 청구하지 않습니다.",
    "이미 시공 하자 확인을 위한 출장·점검비를 수령한 경우 해당 출장·점검비를 반환합니다.",
    "제품 자체 결함처럼 보이는 경우에도 설치 상태 확인이 필요할 수 있으므로, 먼저 원인을 확인한 후 시공 문제와 제품 문제를 구분하여 안내합니다.",
  ],
  asExclusions: [
    "고객이 직접 준비한 제품의 제조상 결함",
    "고객의 임의 분해 또는 변형",
    "외부 충격",
    "정상적인 사용에 따른 마모",
    "시공 전에 통상적인 방법으로 발견하기 어려웠던 내부 구조 문제",
  ],
  consultFlow: CONSULT_PROCESS_STEPS,
  submittedNotice1:
    "상담 신청이 접수되었습니다. 사진과 작업 내용을 확인한 후 작업 범위와 총 예상 결제금액이 포함된 사전견적서를 안내해 드립니다.",
  submittedNotice2:
    "상담 신청만으로 계약이나 예약이 확정되지 않으며, 계약금 30% 결제가 완료되어야 일정이 확정됩니다.",
} as const;

export type TenantCarePackageId = "light" | "standard" | "total";

export type TenantCarePackage = {
  id: TenantCarePackageId;
  name: string;
  priceWon: number;
  targetNote: string;
  visitNote: string;
  includes: string[];
};

export const TENANT_CARE_PACKAGES: TenantCarePackage[] = [
  {
    id: "light",
    name: "라이트",
    priceWon: 590000,
    targetNote: "소형 설치·교체 작업 중심",
    visitNote: "본 시공 1회",
    includes: [
      "본 시공 1회",
      "자재비·출장비 별도",
      "소형 설치·교체 작업 중심",
      "기존 철거 부품 분류·포장·고객 인도",
    ],
  },
  {
    id: "standard",
    name: "스탠다드",
    priceWon: 990000,
    targetNote: "여러 작업을 함께 진행",
    visitNote: "본 시공 1회",
    includes: [
      "본 시공 1회",
      "자재비·출장비 별도",
      "커튼·블라인드·전등·수전·손잡이·생활소품 등 여러 작업 진행",
      "기존 철거 부품 분류·포장·고객 인도",
    ],
  },
  {
    id: "total",
    name: "토탈",
    priceWon: 1490000,
    targetNote: "필요 시 현장 실측 포함",
    visitNote: "필요 시 현장 실측 1회 + 본 시공 1회",
    includes: [
      "필요 시 현장 실측 1회 + 본 시공 1회",
      "자재비·출장비 별도",
      "상담·작업계획·실측·설치·확인·기존 부품 포장 포함",
    ],
  },
];

export const TENANT_CARE_EXCLUSIONS = [
  "넓은 면적의 바닥재 또는 데크타일 시공",
  "넓은 면적의 인테리어 필름 시공",
  "맞춤 제작 가구",
  "벽체 내부 배선 수리",
  "전기 회로 증설",
  "벽·천장 자체의 파손 보수",
  "대량 폐기물 처리",
  "층고가 높은 고소 작업",
  "견적서에 기재되지 않은 작업",
  "현장 구조상 추가 인력이나 전문장비가 필요한 작업",
];

export const TENANT_CARE_MATERIAL_OPTIONS = [
  {
    id: "customer",
    title: "고객이 제품을 직접 준비하는 경우",
    body: [
      "고객이 교체하거나 설치할 제품을 직접 구매하여 준비할 수 있습니다.",
      "작업 전 제품명, 모델명, 규격과 설치 장소 사진을 확인하여 설치 가능 여부를 안내합니다.",
      "고객이 직접 준비한 제품의 제조상 결함과 자체 불량은 해당 제품의 제조사 또는 판매처 보증기준이 적용됩니다.",
      "규격이나 설치 조건이 맞지 않아 작업할 수 없는 경우에는 작업 전에 고객에게 안내합니다.",
    ],
  },
  {
    id: "bandeut",
    title: "반듯집수리가 제품을 준비하는 경우",
    body: [
      `제품 준비가 어려운 고객은 구매·운반 대행을 요청할 수 있습니다. 기본 구매대행비는 동일 판매처 1회 주문 기준 ${PURCHASE_AGENCY_FEE_WON.toLocaleString("ko-KR")}원입니다.`,
      "제품명, 모델명, 수량, 자재비와 구매·운반 대행업무 범위를 견적서에 구분하여 사전 안내합니다.",
      "고객이 승인하지 않은 제품이나 대행비는 청구하지 않습니다.",
      "주문제작품, 개봉 후 반품이 제한되는 제품 또는 환불할 수 없는 자재가 있는 경우에는 증빙자료를 바탕으로 실제로 회수하지 못한 비용만 안내합니다.",
      "주문 취소나 반품으로 회수된 금액은 고객 부담금에서 제외합니다.",
    ],
  },
];

export type TenantCareConsent = {
  id: string;
  label: string;
  required: boolean;
};

// 모든 체크박스는 화면에서 기본 미선택 상태로 렌더링해야 합니다.
export const TENANT_CARE_CONSENTS: TenantCareConsent[] = [
  { id: "privacy", label: "개인정보 수집·이용 동의", required: true },
  {
    id: "priceTerms",
    label: "가격·출장비·자재비·계약금 30% 등 주요 거래조건 확인",
    required: true,
  },
  {
    id: "cancelPolicy",
    label: "변경·취소·환불 안내 확인",
    required: true,
  },
  {
    id: "landlordCheck",
    label: "임대차계약 및 임대인·관리주체 확인 책임 안내",
    required: true,
  },
  {
    id: "noGuarantee",
    label:
      "원상복구를 고려한 시공이며 완벽한 복구를 보장하지 않는다는 안내 확인",
    required: true,
  },
  {
    id: "photoUse",
    label: "작업 전·후 사진의 포트폴리오 활용 동의",
    required: false,
  },
  {
    id: "reviewUse",
    label: "고객이 직접 작성한 후기의 공개 활용 동의",
    required: false,
  },
  { id: "marketing", label: "광고성 정보 수신 동의", required: false },
];

export const TENANT_CARE_RESIDENCE_TYPES = ["자가", "전세", "월세", "기타"] as const;

export const TENANT_CARE_WORK_ITEMS = [
  "커튼/블라인드 설치",
  "전등 교체",
  "수전 교체",
  "방문 손잡이 교체",
  "스위치·콘센트 플레이트 교체",
  "욕실·주방 생활 소품 설치",
  "기타(추가 요청사항에 작성)",
];

export const TENANT_CARE_FAQ = [
  {
    q: "정말 원상복구가 완벽하게 되나요?",
    a: "건물의 손상과 변경을 최소화하고 퇴거 시 재설치를 고려한 시공을 지향하지만, 건물 노후 상태와 마감재, 사용 기간에 따라 미세한 흔적이나 변색이 남을 수 있어 완벽한 원상복구를 보장드리지는 않습니다.",
  },
  {
    q: "임대인에게 미리 알려야 하나요?",
    a: "네, 시설 교체·설치 전에 임대차계약서와 건물 관리규정을 확인하시고 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아 주셔야 합니다.",
  },
  {
    q: "떼어낸 기존 부품은 어떻게 되나요?",
    a: "품목별로 분류·포장하여 작업 완료 후 고객님께 인도해드리며, 인도 이후 보관·분실·파손에 대한 관리 책임은 고객님께 있습니다.",
  },
  {
    q: "퇴거할 때 다시 설치해주나요?",
    a: "보관 중인 기존 부품을 활용한 재설치를 별도로 신청하실 수 있습니다. 다만 이는 패키지에 포함된 무료 서비스가 아닌 별도의 유상 서비스입니다.",
  },
  {
    q: "계약금은 얼마인가요?",
    a: "제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하며, 계약금은 총 작업대금에 포함되어 잔금에서 전액 차감됩니다.",
  },
] as const;

// ── ③ 스마트홈 IoT 케어 패키지 (스펙 2-C) ─────────────────────────────────
export const SMART_HOME = {
  title: "스마트홈 IoT 케어",
  subtitle: "집이 상황을 알아서 움직이도록",
  description:
    "조명·플러그·센서·커튼·홈캠·출입·생활가전을 앱과 자동화로 연결하는 서비스입니다. 표시 가격은 제품가격이 아니라 설치·연결·설정 공임입니다.",
  priceNote:
    "제품비·부자재비·앱·클라우드 구독료는 고객이 부담합니다. 모든 장비가 하나의 앱으로 통합되는 것은 아니며, 모델별 호환성을 사전에 확인한 뒤 안내해 드립니다.",
  windowAutomationNotice:
    "창호 구조, 전원, 구동력, 수동 해제와 안전장치를 확인한 뒤 조건부로 제공되는 실측형 옵션입니다.",
} as const;

export type SmartHomePackageId = "start" | "life" | "fullhome";

export type SmartHomePackage = {
  id: SmartHomePackageId;
  name: string;
  priceWon: number;
  priceFrom: boolean;
  deviceLimit: string;
  automationLimit: string;
  visitNote: string;
  extraNote?: string;
};

export const SMART_HOME_PACKAGES: SmartHomePackage[] = [
  {
    id: "start",
    name: "스마트 스타트",
    priceWon: 490000,
    priceFrom: false,
    deviceLimit: "일반 장비 최대 4개",
    automationLimit: "자동화 최대 2개",
    visitNote: "방문 1회",
  },
  {
    id: "life",
    name: "스마트 라이프",
    priceWon: 990000,
    priceFrom: false,
    deviceLimit: "일반 장비 최대 10개",
    automationLimit: "자동화 최대 5개",
    visitNote: "방문 1회",
  },
  {
    id: "fullhome",
    name: "스마트 풀홈",
    priceWon: 1990000,
    priceFrom: true,
    deviceLimit: "일반 장비 최대 20개",
    automationLimit: "자동화 최대 10개",
    visitNote: "최대 2회 방문",
    extraNote: "현장 실측과 호환성 확인 후 범위 확정",
  },
];

export const SMART_HOME_COMMON_NOTES = [
  "제품비·부자재비·출장비 별도",
  "일반 장비는 별도 전기공사나 구조변경이 필요하지 않은 스마트 플러그·전구·독립형 센서·허브 등을 의미합니다.",
  TRAVEL_FEE_NOTICE,
] as const;

export const SMART_HOME_EXCLUDED_DEVICES = [
  "도어락",
  "고정형 홈캠·CCTV",
  "전동 커튼",
  "매립형 스위치",
  "추가 배선",
  "창문 자동개폐",
  "별도 타공·보강이 필요한 장비",
  "구조변경이나 전문 인력이 필요한 작업",
];

export type SmartHomeScenario = {
  id: string;
  title: string;
  icon: string;
  description: string;
};

export const SMART_HOME_SCENARIOS: SmartHomeScenario[] = [
  { id: "away", title: "외출모드", icon: "🚪", description: "외출 시 조명·플러그·커튼을 한 번에 정리합니다." },
  { id: "home", title: "귀가모드", icon: "🏠", description: "귀가 시각에 맞춰 조명과 실내 환경을 미리 준비합니다." },
  { id: "sleep", title: "취침모드", icon: "🌙", description: "취침 시간에 조명을 끄고 대기전력을 차단합니다." },
  { id: "leak", title: "누수알림", icon: "💧", description: "누수 감지 센서가 이상을 감지하면 알림을 보냅니다." },
  { id: "door-window", title: "문·창문 열림 알림", icon: "🔔", description: "문이나 창문이 열리면 즉시 알림을 받습니다." },
  { id: "parents", title: "부모님 안심 알림", icon: "👨‍👩‍👧", description: "거주자 동의를 전제로 생활 패턴 이상 시 알림을 보냅니다." },
  { id: "tenant-nodrill", title: "세입자용 비타공 스마트홈", icon: "🔌", description: "타공 없이 설치 가능한 장비 중심으로 구성합니다." },
  { id: "window-auto", title: "창문 자동화", icon: "🪟", description: "조건부 실측형 옵션이며 모든 창문에 적용되지는 않습니다." },
];

export const SMART_HOME_ANXIETY_OPTION_NOTICE =
  "여성 1인 가구 등을 위한 안심 자동화 옵션은 알림·자동화 기능으로만 안내하며, 공포심을 자극하는 이미지나 문구는 사용하지 않습니다.";

export const SMART_HOME_CUSTOMER_PROTECTION = [
  "고객이 본인 명의로 계정을 생성하고 비밀번호를 직접 입력합니다.",
  "반듯집수리는 비밀번호·인증번호를 보관하지 않습니다.",
  "완료 후 계정 통제권과 관리자 권한을 고객에게 인계합니다.",
  "홈캠 영상을 반듯집수리가 저장하지 않습니다.",
  "부모님 케어 기능은 거주자 동의를 전제로 설정합니다.",
  "의료·건강상태를 판단하는 서비스가 아닙니다.",
  "인터넷·클라우드 장애 시 일부 원격 기능이 제한될 수 있습니다.",
  "매립형 전기작업 등 자격·등록이 필요한 작업은 전문업체에 이관합니다.",
];

export const SMART_HOME_DEVICE_OPTIONS = [
  "스마트 조명",
  "스마트 플러그",
  "각종 센서(누수/문열림/동작)",
  "스마트 커튼·블라인드",
  "홈캠",
  "도어락(전문업체 이관 대상)",
  "생활가전 연동",
  "기타(추가 요청사항에 작성)",
];

export const SMART_HOME_CONSENTS: TenantCareConsent[] = [
  { id: "privacy", label: "개인정보 수집·이용 동의", required: true },
  {
    id: "priceTerms",
    label: "가격·출장비·제품비·계약금 30% 등 주요 거래조건 확인",
    required: true,
  },
  {
    id: "customerProtection",
    label:
      "계정·비밀번호 본인 관리, 홈캠 영상 미저장 등 스마트홈 고객보호 안내 확인",
    required: true,
  },
  {
    id: "compatibility",
    label: "장비 호환성은 현장 확인 후 최종 결정된다는 안내 확인",
    required: true,
  },
  {
    id: "photoUse",
    label: "작업 전·후 사진의 포트폴리오 활용 동의",
    required: false,
  },
  {
    id: "reviewUse",
    label: "고객이 직접 작성한 후기의 공개 활용 동의",
    required: false,
  },
  { id: "marketing", label: "광고성 정보 수신 동의", required: false },
];

export const SMART_HOME_FAQ = [
  {
    q: "스마트홈 장비는 앱 하나로 모두 사용할 수 있나요?",
    a: "모든 장비가 하나의 앱으로 통합되는 것은 아닙니다. 모델별 호환성을 사전에 확인한 뒤 안내해드립니다.",
  },
  {
    q: "인터넷이 끊기면 어떻게 되나요?",
    a: "인터넷·클라우드 장애 시 일부 원격 기능이 제한될 수 있습니다.",
  },
  {
    q: "창문 자동개폐는 모든 창문에 가능한가요?",
    a: "창호 구조, 전원, 구동력, 수동 해제와 안전장치를 확인한 뒤 조건부로 제공되는 실측형 옵션이며, 모든 창문에 적용되는 것은 아닙니다.",
  },
  {
    q: "세입자도 설치할 수 있나요?",
    a: "타공이 필요 없는 장비 중심의 세입자용 비타공 스마트홈 구성이 가능하며, 임대차계약과 관리규정 확인은 고객님께서 진행해 주셔야 합니다.",
  },
] as const;

// ── 메인 FAQ (스펙 8-⑦, 12문항) ───────────────────────────────────────────
export const MAIN_FAQ = [
  {
    q: "출장비는 얼마인가요?",
    a: `출장비는 방문 1회당 ${TRAVEL_FEE_WON.toLocaleString("ko-KR")}원이며, 서울·경기 전 지역 동일하게 적용됩니다. 같은 방문의 여러 작업에는 출장비가 한 번만 적용됩니다.`,
  },
  {
    q: "사진만으로 견적이 확정되나요?",
    a: "사진으로 안내하는 금액은 사전예상액입니다. 최종 금액은 현장 상태와 작업 범위를 확인한 뒤 확정됩니다.",
  },
  {
    q: "계약금은 얼마인가요?",
    a: "제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하면 일정이 확정됩니다. 계약금은 잔금에서 전액 차감됩니다.",
  },
  {
    q: "제품·자재비는 언제 결제하나요?",
    a: "반듯집수리가 대리구매하는 제품비·자재비는 고객 승인 후 구매 전에 전액 별도로 결제합니다.",
  },
  {
    q: "자재를 직접 준비해도 되나요?",
    a: "네, 가능합니다. 다만 제품명·모델명·규격을 사전에 확인해 설치 가능 여부를 안내해드립니다.",
  },
  {
    q: "제품 구매대행이 가능한가요?",
    a: `가능합니다. 기본 구매대행비는 동일 판매처 1회 주문 기준 ${PURCHASE_AGENCY_FEE_WON.toLocaleString("ko-KR")}원이며, 추가 주문·특수 운반은 사전 승인 후 별도로 안내합니다.`,
  },
  {
    q: "집수리와 스마트홈을 함께 신청할 수 있나요?",
    a: "두 서비스는 가격과 신청 흐름이 완전히 분리되어 있습니다. 각 서비스별로 별도 상담을 진행해주세요.",
  },
  {
    q: "세입자도 설치할 수 있나요?",
    a: "네, 다만 시설 교체·설치 전 임대차계약서와 건물 관리규정을 확인하고 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아 주셔야 합니다.",
  },
  {
    q: "스마트홈 장비는 앱 하나로 모두 사용할 수 있나요?",
    a: "모든 장비가 하나의 앱으로 통합되는 것은 아닙니다. 모델별 호환성을 사전에 확인한 뒤 안내해드립니다.",
  },
  {
    q: "인터넷이 끊기면 어떻게 되나요?",
    a: "인터넷·클라우드 장애 시 일부 원격 기능이 제한될 수 있습니다.",
  },
  {
    q: "창문 자동개폐는 모든 창문에 가능한가요?",
    a: "창호 구조, 전원, 구동력, 수동 해제와 안전장치를 확인한 뒤 조건부로 제공되는 실측형 옵션이며, 모든 창문에 적용되는 것은 아닙니다.",
  },
  {
    q: "A/S 범위는 어떻게 되나요?",
    a: "반듯집수리의 설치·시공상 하자는 작업 완료일로부터 6개월간 무상 A/S가 적용됩니다. 제품 자체 결함은 시공 문제와 구분하여 안내합니다.",
  },
] as const;

// ── 작업사례 (스펙 10번) ─────────────────────────────────────────────────
export type WorkCaseCategory = "repair" | "tenant-care" | "smart-home";

export type WorkCase = {
  id: string;
  category: WorkCaseCategory;
  region: string;
  workType: string;
  problemSolved: string;
  scope: string;
  materials: string;
  siteDifference: string;
  isRealCase: boolean;
  caseTypeLabel: string;
  photoUrl: string;
};

// 기존에 있던 3건의 후기 콘텐츠는 실제 시공 여부를 확인할 수 없어(사진에는 이미
// "이해를 돕기 위한 이미지입니다" 배지가 붙어 있음), 삭제하지 않고 "실제 사례 여부"를
// 명확히 표시하는 예시/시연 콘텐츠로 재분류해서 이관한다(스펙 10번, 15번 준수).
export const WORK_CASES: WorkCase[] = [
  {
    id: "r1",
    category: "repair",
    region: "일산동구",
    workType: "수전교체",
    problemSolved: "주방 수전 누수",
    scope: "주방 수전 탈거 후 신품 수전 교체",
    materials: "고객 제공 수전 1개",
    siteDifference: "제품 규격에 따라 연결부 어댑터 추가가 필요할 수 있음",
    isRealCase: false,
    caseTypeLabel: "자체 기능시험",
    photoUrl: "/brand/kitchen-faucet-3.png",
  },
  {
    id: "r2",
    category: "repair",
    region: "일산서구",
    workType: "방충망 교체",
    problemSolved: "베란다 방충망 파손",
    scope: "기존 방충망 철거 후 규격 실측·재제작 방충망 설치",
    materials: "방충망 프레임·망 1식",
    siteDifference: "창틀 규격이 비정형인 경우 맞춤 제작이 필요함",
    isRealCase: false,
    caseTypeLabel: "시연용 설치",
    photoUrl: "/brand/window-screen-2.png",
  },
  {
    id: "r3",
    category: "repair",
    region: "덕양구",
    workType: "문고리 교체",
    problemSolved: "방문 손잡이 헐거움",
    scope: "기존 손잡이 철거 후 신품 손잡이 설치",
    materials: "고객 제공 손잡이 1개",
    siteDifference: "문 두께·타공 규격에 따라 부속 교체가 필요할 수 있음",
    isRealCase: false,
    caseTypeLabel: "자체 기능시험",
    photoUrl: "/brand/doorlock-3.png",
  },
];

export const WORK_CASE_CATEGORY_LABELS: Record<WorkCaseCategory, string> = {
  repair: "생활 집수리",
  "tenant-care": "세입자·주거 케어",
  "smart-home": "스마트홈 IoT",
};

// 기존 코드 호환용 별칭 (구 REVIEWS 사용처 점진 이관용)
export type Review = WorkCase;
export const REVIEWS = WORK_CASES;
