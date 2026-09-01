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
  url: "https://home-repair-landing.vercel.app",
  serviceArea: "서울·경기 전 지역 방문 가능합니다",
  phone: "010-2370-5091",
  kakaoUrl: "https://pf.kakao.com/_kHyfX/chat",
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

// ── 헤더 내비게이션 (2026-07-30 최종 개편안 2번: 서비스/케어 패키지/스마트홈/작업 예시/이용안내) ──
// "상담" 메뉴는 삭제한다 — 우측 고정 상담 버튼과 각 페이지의 사진 상담 CTA가 있어 중복이다.
// "작업사례"는 실제 고객 사례가 쌓이기 전까지 "작업 예시"로 표기한다.
export const NAV_ITEMS = [
  { href: "/services", label: "서비스" },
  { href: "/tenant-care", label: "케어 패키지" },
  { href: "/smart-home", label: "스마트홈" },
  { href: "/airbnb-setup", label: "에어비앤비" },
  { href: "/reviews", label: "작업 예시" },
  { href: "/guide", label: "이용안내" },
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
export const PURCHASE_AGENCY_FEE_WON = 30000;
export const EXTRA_LABOR_FEE_NOTICE =
  "추가공임은 작업자 1인 기준 30분당 50,000원이며, 2인 이상 투입 시 인원에 비례합니다. 추가 작업은 내용·금액·승인 시각을 안내하고 고객님이 동의한 뒤에만 진행합니다.";
export const ESTIMATE_VALIDITY_NOTICE = "견적 유효기간은 발송일로부터 7일입니다.";
export const VAT_NOTICE = "홈페이지에 공개된 모든 금액은 부가가치세(VAT)를 포함한 금액입니다.";

// 서비스별 A/S 안내를 통일하기 위한 공통 문구(스펙 8번 "서비스별 A/S 안내 통일").
// 세입자·주거 케어는 asPolicyBody(TENANT_CARE_DETAIL)에 더 상세한 조항을 별도로 둔다.
export const SERVICE_AS_NOTICE =
  "반듯집수리의 설치·시공상 하자에 대한 기본 보증기간은 작업 완료일로부터 6개월입니다. 시공상 하자로 확인되는 경우 무상 A/S를 진행하며 출장·점검비를 청구하지 않습니다.";

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

// ── 상담 진행 절차 ────────────────────────────────────────────────────────
// 메인페이지 "⑥ 진행 과정과 신뢰 기준" 통합 영역은 5단계로 축소한다(최종 개편안 3-⑥).
// 이용안내(/guide) 페이지에는 기존의 더 상세한 5단계 설명을 별도로 유지한다.
export const CONSULT_PROCESS_STEPS = [
  "사진과 요청사항 접수",
  "사전예상액과 방문 범위 안내",
  "견적서 확인 후 진행(케어·IoT는 계약금 30% 결제)",
  "현장 확인과 고객 동의 후 작업",
  "작동 확인·정리·잔금 결제",
] as const;

// 메인페이지 신뢰 기준은 4개만 노출한다(최종 개편안 3-⑥).
export const TRUST_CRITERIA = [
  "동의 없는 추가 작업 없음",
  "작업 전·중·후 기록",
  "제품 하자와 설치 하자 구분",
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

// ── 개인정보처리방침 (최종 개편안 8번: 사업자정보와 마찬가지로 미확정 값은 절대
// 임의로 만들지 않고 "확정 예정" 문구로만 표시한다) ─────────────────────────
export const PRIVACY_PHOTO_RETENTION_NOTICE =
  "상담을 위해 첨부해주신 사진은 상담·견적·작업 진행 목적으로만 사용하며, 상담이 " +
  "종료되거나 작업이 완료된 이후 일정 기간이 지나면 삭제합니다. 정확한 보관·삭제 " +
  "기간은 추후 확정 예정이며, 확정되는 대로 이 페이지에 반영합니다. 삭제를 " +
  "원하시면 아래 연락처로 요청해주실 수 있습니다.";

export const PRIVACY_POLICY_SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "필수항목: 이름, 연락처(전화번호), 방문지역·주소, 상담내용(작업공간·작업종류·문제증상 등), 첨부사진, 희망 방문일정",
      "서비스 이용 과정에서 자동으로 생성되어 수집될 수 있는 정보: 접속 IP, 접속 일시(스팸·부정이용 방지 목적)",
    ],
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    body: [
      "사진 상담·방문 견적·예약 접수 및 일정 조율",
      "작업 진행, A/S 및 사후 문의 응대",
      "부정이용 방지 및 서비스 안정적 운영(요청 빈도 제한 등)",
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용기간",
    body: [
      PRIVACY_PHOTO_RETENTION_NOTICE,
      "이름·연락처·상담내용 등 상담 기록은 상담·작업 완료 후 관련 법령에 따른 보관기간까지 보관하며, 정확한 보유기간은 추후 확정 예정입니다.",
      "관계 법령(전자상거래 등에서의 소비자보호에 관한 법률 등)에 따라 별도 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관합니다.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: [
      "고객님의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.",
      "다만 법령에 특별한 규정이 있거나 수사기관이 적법한 절차에 따라 요청하는 경우는 예외로 합니다.",
    ],
  },
  {
    title: "5. 개인정보 처리위탁",
    body: [
      "사진 첨부파일 저장을 위해 클라우드 스토리지 제공업체(Vercel Blob Storage)를 이용하고 있으며, 위탁받은 업체는 위탁 목적 범위 내에서만 개인정보를 처리합니다.",
    ],
  },
  {
    title: "6. 정보주체의 권리와 행사 방법",
    body: [
      "고객님은 언제든지 본인의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요청하실 수 있습니다.",
      "요청은 아래 연락처(전화 또는 카카오톡 채널)로 접수해주시면 지체 없이 조치합니다.",
    ],
  },
  {
    title: "7. 개인정보 보호책임자 및 문의처",
    body: [
      "개인정보 관련 문의는 아래 연락처로 접수해주세요.",
    ],
  },
  {
    title: "8. 시행일",
    body: ["이 개인정보처리방침의 시행일은 확정 예정입니다."],
  },
] as const;

// 접수완료 화면 등에 표시하는 예상견적 안내 원칙 문구 (용어 원칙: "예상 견적/비용범위", 확정견적 금지)
export const ESTIMATE_DISCLAIMER_TEXT =
  "견적 신청이 접수되었습니다.\n" +
  "보내주신 사진과 내용을 확인한 후 사진 기준 예상 작업 범위와 비용을 안내해 드립니다.\n" +
  "사진만으로 확인하기 어려운 부분이 있는 경우 카카오톡 또는 전화로 추가 사진과 정보를 요청드릴 수 있습니다.\n" +
  "최종 작업금액은 현장을 확인한 뒤 작업 시작 전에 안내하며, 고객님의 동의를 받은 후 작업을 진행합니다.";

// 방문 일정이 확정될 때(상담 단계에서) 안내되는 계약금 정책 문구
// (구 고정 예약금 40,000원 정책은 완전히 폐기되었다 — 스펙 4번)
export const DEPOSIT_NOTICE_TEXT = DEPOSIT_POLICY_TEXT;

// ── ① 생활 집수리 (최종 개편안 3-③: 6개 카드로 축소) ───────────────────────
export type RepairCategory = {
  id: string;
  title: string;
  representativeWork: string;
  description: string;
  imageSrc?: string;
};

// 목록에 없는 작업은 카드로 만들지 않고 별도의 "기타 작업 사진상담" 버튼으로 통합한다.
export const REPAIR_CATEGORIES: RepairCategory[] = [
  {
    id: "water",
    title: "수도·배수",
    representativeWork: "수전 교체·배수구 교체·누수 점검",
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
    title: "욕실·주방·생활소품",
    representativeWork: "욕실·주방·생활소품 설치",
    description: "욕실·주방 소품과 생활소품 설치 작업입니다. 자재비는 별도입니다.",
  },
];

// 메인/서비스 페이지에서 카드 목록 대신 사용하는 "기타 작업" 통합 버튼 문구.
export const REPAIR_OTHER_CTA = {
  title: "기타 작업 사진상담",
  description:
    "목록에 없는 자잘한 생활 불편도 편하게 문의해주세요. 사진을 보내주시면 작업 가능 여부와 예상 비용을 안내해드립니다.",
};

export const REPAIR_POLICY_NOTES = [
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
    priceWon: 150000,
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
    priceWon: 250000,
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
    priceWon: 500000,
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
  ctaNotice:
    "상담 신청만으로 계약이나 결제가 확정되지 않습니다. 사진 확인 후 견적서와 주요 거래조건을 안내하며, 고객 확인과 계약금 30% 결제가 완료되면 일정이 확정됩니다.",
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
    priceWon: 150000,
    priceFrom: false,
    deviceLimit: "일반 장비 최대 4개",
    automationLimit: "자동화 최대 1개",
    visitNote: "방문 1회",
  },
  {
    id: "life",
    name: "스마트 라이프",
    priceWon: 200000,
    priceFrom: false,
    deviceLimit: "일반 장비 최대 10개",
    automationLimit: "자동화 최대 3개",
    visitNote: "방문 1회",
  },
  {
    id: "fullhome",
    name: "스마트 풀홈",
    priceWon: 300000,
    priceFrom: true,
    deviceLimit: "일반 장비 최대 20개",
    automationLimit: "자동화 최대 5개",
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

export type SmartHomeScenarioIconId =
  | "door-exit"
  | "moon"
  | "droplet-alert"
  | "family-check";

export type SmartHomeScenario = {
  id: string;
  title: string;
  iconId: SmartHomeScenarioIconId;
  description: string;
  // 카드 선택 시 아래에 보여주는 "정적인 결과"(스펙 3-⑤). 실시간 견적 계산이 아니라
  // 미리 정해둔 예시 문구를 그대로 보여준다.
  resultFeatures: string;
  resultRecommendation: string;
};

// 최종 개편안 3-⑤: 8개 시나리오를 4개로 축소한다.
export const SMART_HOME_SCENARIOS: SmartHomeScenario[] = [
  {
    id: "away",
    title: "외출할 때",
    iconId: "door-exit",
    description: "외출 시 조명·플러그·커튼을 한 번에 정리합니다.",
    resultFeatures: "외출모드 · 조명·플러그 자동 정리",
    resultRecommendation: "스마트 스타트 검토 대상",
  },
  {
    id: "sleep",
    title: "잠들기 전",
    iconId: "moon",
    description: "취침 시간에 맞춰 조명을 끄고 대기전력을 차단합니다.",
    resultFeatures: "취침모드 · 조명·대기전력 자동 차단",
    resultRecommendation: "스마트 스타트 검토 대상",
  },
  {
    id: "leak-door",
    title: "누수·문 열림이 감지될 때",
    iconId: "droplet-alert",
    description: "누수 감지 센서와 문 열림 감지가 이상을 알아채면 알림을 보냅니다.",
    resultFeatures: "외출모드 · 누수알림 · 문 열림 알림",
    resultRecommendation: "스마트 라이프 검토 대상",
  },
  {
    id: "parents",
    title: "부모님 생활상태를 확인할 때",
    iconId: "family-check",
    description: "거주자 동의를 전제로 생활 패턴 이상 시 알림을 보냅니다.",
    resultFeatures: "부모님 안심 알림 · 생활패턴 이상 감지",
    resultRecommendation: "스마트 라이프 검토 대상",
  },
];

export const SMART_HOME_SCENARIO_FOOTNOTE =
  "장비 호환성과 최종 구성은 모델과 현장 상태 확인 후 결정됩니다.";


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
];

export const SMART_HOME_DEVICE_OPTIONS = [
  "스마트 조명",
  "스마트 플러그",
  "각종 센서(누수/문열림/동작)",
  "스마트 커튼·블라인드",
  "홈캠",
  "도어락",
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

// ── ④ 에어비앤비 세팅 케어 (화장실·가구·배치·마감 공사를 한 번의 계획으로) ──────
// 기존 생활 집수리/세입자·주거 케어/스마트홈 서비스·가격과 절대 혼합하지 않는 독립 서비스.
// 반듯집수리는 시공·세팅 서비스만 제공하며, 숙박업 신고·사업자등록 등 인허가는
// 대행하거나 보장하지 않는다는 점을 페이지 전반에 명확히 안내한다.
export const AIRBNB_SETUP = {
  title: "에어비앤비 세팅 케어",
  subtitle: "게스트를 맞이할 준비까지, 한 번의 계획으로",
  intro:
    "숙소로 운영할 집을 화장실부터 가구·배치, 도배·장판 같은 마감 공사까지 한 번의 계획으로 준비하고 싶으신가요?",
  description:
    "반듯집수리 에어비앤비 세팅 케어는 화장실 리모델링, 가구·소품 배치, 도배·장판·조명 등 마감 공사를 한 번의 계획으로 묶어 진행하는 패키지 서비스입니다. 게스트를 맞이하기 좋은 상태로 공간을 준비해 드립니다.",
  descriptionSub:
    "숙박업 신고, 사업자등록, 소방·건축 기준 충족 등 인허가 절차는 포함되지 않으며 대행하지 않습니다. 실제 작업 범위와 비용은 사진 상담 후 견적서에 명확히 안내합니다.",
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
    "추가 작업이 당일 진행하기 어렵거나 별도의 자재·가구·인력이 필요한 경우 새로운 일정과 견적을 안내할 수 있습니다.",
  licenseNoticeTitle: "숙박업 신고·인허가 안내",
  licenseNoticeBody: [
    "반듯집수리는 화장실·가구·마감 공사 등 시공·세팅 서비스만 제공하며, 외국인관광 도시민박업 등 숙박업 신고, 사업자등록, 소방·건축 기준 충족 여부는 대행하거나 보장하지 않습니다.",
    "숙박업 등록 가능 여부(건축물 용도, 지역 규제, 소방 설비 기준 등)는 관할 구청·소방서 등을 통해 고객님이 직접 사전에 확인하시길 권장드립니다.",
    "임차한 건물인 경우 시설 교체·공사 전에 임대차계약서와 건물 관리규정을 확인하고, 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아야 합니다.",
  ],
  depositNoticeTitle: "계약금 안내",
  depositNoticeBody: [DEPOSIT_POLICY_TEXT],
  cancelPolicyTitle: "변경·취소·환불 안내",
  cancelPolicyBody: [REFUND_POLICY_TEXT],
  asPolicyTitle: "A/S 및 보증 안내",
  asPolicyBody: [SERVICE_AS_NOTICE],
  travelFeeNotice: [
    `출장비는 실제 방문 1회당 ${TRAVEL_FEE_WON.toLocaleString("ko-KR")}원이며, 서울·경기 전 지역 동일하게 적용됩니다.`,
    "실측과 본 시공으로 두 번 방문하면 출장비 총 40,000원입니다.",
    "패키지 가격에는 출장비와 자재비·가구비가 포함되어 있지 않으며, 견적서에서 항목별로 구분해 안내합니다.",
  ],
  consultFlow: CONSULT_PROCESS_STEPS,
  submittedNotice1:
    "상담 신청이 접수되었습니다. 사진과 작업 내용을 확인한 후 작업 범위와 총 예상 결제금액이 포함된 사전견적서를 안내해 드립니다.",
  submittedNotice2:
    "상담 신청만으로 계약이나 예약이 확정되지 않으며, 계약금 30% 결제가 완료되어야 일정이 확정됩니다.",
} as const;

export type AirbnbSetupPackageId = "styling" | "renewal" | "full";

export type AirbnbSetupPackage = {
  id: AirbnbSetupPackageId;
  name: string;
  priceWon: number;
  priceFrom: boolean;
  targetNote: string;
  visitNote: string;
  includes: string[];
};

export const AIRBNB_SETUP_PACKAGES: AirbnbSetupPackage[] = [
  {
    id: "styling",
    name: "스타일링",
    priceWon: 1500000,
    priceFrom: false,
    targetNote: "화장실·마감 공사 없이 가구·소품 배치만 필요한 경우",
    visitNote: "본 시공 1회",
    includes: [
      "가구·소품 배치 및 동선 구성",
      "숙소 등록용 사진 스타일링(조명·소품 연출)",
      "본 시공 1회",
      "가구비·자재비·출장비 별도",
    ],
  },
  {
    id: "renewal",
    name: "리뉴얼",
    priceWon: 3000000,
    priceFrom: false,
    targetNote: "화장실 부분 개선과 가구·배치를 함께 진행하고 싶은 경우",
    visitNote: "필요 시 현장 실측 1회 + 본 시공 1회",
    includes: [
      "화장실 부분 개선(수전·도기·타일 일부 등)",
      "가구·소품 배치 및 스타일링",
      "도배·장판·조명 등 마감 공사 일부",
      "가구비·자재비·출장비 별도",
    ],
  },
  {
    id: "full",
    name: "에어비앤비 풀패키지",
    priceWon: 5000000,
    priceFrom: true,
    targetNote: "화장실부터 가구·마감 공사까지 한 번에 준비하는 경우",
    visitNote: "현장 실측 1회 + 본 시공(공사 규모에 따라 여러 날 진행)",
    includes: [
      "화장실 전체 리모델링",
      "가구·소품 전체 배치 및 스타일링",
      "도배·장판·조명·콘센트 등 마감 공사",
      "숙소 등록용 사진 스타일링",
      "가구비·자재비·출장비 별도",
    ],
  },
];

export const AIRBNB_SETUP_EXCLUSIONS = [
  "숙박업 신고, 사업자등록 등 인허가 절차",
  "스프링클러 등 고정 소방설비 설치",
  "발코니 확장, 구조 변경 등 대수선 공사",
  "오·급수관 이설 등 배관 전체 교체",
  "엘리베이터·공용부 공사",
  "전문 사진작가 촬영(숙소 등록용 스타일링만 포함)",
  "가구·가전 제품비",
  "견적서에 기재되지 않은 작업",
];

export const AIRBNB_SETUP_MATERIAL_OPTIONS = [
  {
    id: "customer",
    title: "고객이 가구·자재를 직접 준비하는 경우",
    body: [
      "고객이 원하는 가구·소품·자재를 직접 구매하여 준비할 수 있습니다.",
      "작업 전 제품명, 모델명, 규격과 배치 장소 사진을 확인하여 설치·배치 가능 여부를 안내합니다.",
      "고객이 직접 준비한 제품의 제조상 결함과 자체 불량은 해당 제품의 제조사 또는 판매처 보증기준이 적용됩니다.",
    ],
  },
  {
    id: "bandeut",
    title: "반듯집수리가 가구·자재를 준비하는 경우",
    body: [
      `가구·자재 준비가 어려운 고객은 구매·운반 대행을 요청할 수 있습니다. 기본 구매대행비는 동일 판매처 1회 주문 기준 ${PURCHASE_AGENCY_FEE_WON.toLocaleString("ko-KR")}원입니다.`,
      "제품명, 모델명, 수량, 가구·자재비와 구매·운반 대행업무 범위를 견적서에 구분하여 사전 안내합니다.",
      "고객이 승인하지 않은 제품이나 대행비는 청구하지 않습니다.",
    ],
  },
];

export const AIRBNB_SETUP_CONSENTS: TenantCareConsent[] = [
  { id: "privacy", label: "개인정보 수집·이용 동의", required: true },
  {
    id: "priceTerms",
    label: "가격·출장비·자재비·계약금 30% 등 주요 거래조건 확인",
    required: true,
  },
  {
    id: "licenseResponsibility",
    label:
      "숙박업 신고·사업자등록 등 인허가는 고객이 직접 진행하며 반듯집수리가 대행·보장하지 않는다는 안내 확인",
    required: true,
  },
  {
    id: "landlordCheck",
    label: "임대차계약 및 임대인·관리주체 확인 책임 안내",
    required: true,
  },
  {
    id: "cancelPolicy",
    label: "변경·취소·환불 안내 확인",
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

export const AIRBNB_SETUP_WORK_ITEMS = [
  "화장실 리모델링",
  "가구·소품 배치",
  "도배·장판",
  "조명·콘센트 교체",
  "방충망",
  "도어락·스마트락",
  "기타(추가 요청사항에 작성)",
];

export const AIRBNB_SETUP_FAQ = [
  {
    q: "정말 500만원이면 에어비앤비를 시작할 수 있나요?",
    a: "화장실 전체 리모델링, 가구·소품 전체 배치, 도배·장판·조명 등 마감 공사를 포함한 풀패키지 기준 대표가격이며, 현장 상태와 선택하신 자재·가구 등급에 따라 최종 금액은 달라질 수 있습니다. 가구·자재비와 숙박업 인허가 관련 비용은 포함되지 않습니다.",
  },
  {
    q: "숙박업 신고나 사업자등록도 대신 해주시나요?",
    a: "아니요. 반듯집수리는 시공·세팅 서비스만 제공하며, 외국인관광 도시민박업 등 숙박업 신고, 사업자등록, 소방·건축 기준 충족 여부 확인은 고객님이 직접 진행하셔야 합니다.",
  },
  {
    q: "임차한 집인데 진행할 수 있나요?",
    a: "가능합니다. 다만 시설 교체·공사 전에 임대차계약서와 건물 관리규정을 확인하시고, 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아 주셔야 합니다.",
  },
  {
    q: "가구·소품은 어떤 걸로 채워주나요?",
    a: "원하시는 컨셉과 예산에 맞춰 가구·소품 목록을 제안해 드리며, 직접 구매를 원하시면 구매대행도 가능합니다. 가구·소품 비용은 시공비와 별도입니다.",
  },
  {
    q: "숙소 등록용 사진도 찍어주시나요?",
    a: "가구·소품 배치와 조명 연출 등 스타일링은 포함되지만, 전문 사진작가 촬영은 별도 옵션이며 필요 시 제휴 업체를 안내해 드립니다.",
  },
  {
    q: "계약금은 얼마인가요?",
    a: "제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하며, 계약금은 총 작업대금에 포함되어 잔금에서 전액 차감됩니다.",
  },
] as const;

// ── 메인 FAQ (최종 개편안 3-⑦: 6문항만 유지, 나머지는 이용안내 전체보기로 이동) ──
export const MAIN_FAQ = [
  {
    q: "출장비는 얼마인가요?",
    a: `출장비는 방문 1회당 ${TRAVEL_FEE_WON.toLocaleString("ko-KR")}원이며, 서울·경기 전 지역 동일하게 적용됩니다. 같은 방문의 여러 작업에는 출장비가 한 번만 적용됩니다.`,
  },
  {
    q: "사진만으로 금액이 확정되나요?",
    a: "사진으로 안내하는 금액은 사전예상액입니다. 최종 금액은 현장 상태와 작업 범위를 확인한 뒤 확정됩니다.",
  },
  {
    q: "자재를 직접 준비해도 되나요?",
    a: "네, 가능합니다. 다만 제품명·모델명·규격을 사전에 확인해 설치 가능 여부를 안내해드립니다.",
  },
  {
    q: "계약금은 얼마인가요?",
    a: "계약금은 세입자·주거 케어와 스마트홈 IoT 케어에만 적용되며, 제품·자재비를 제외한 계약대상 서비스 금액의 30%를 결제하면 일정이 확정됩니다. 생활 집수리(개별 작업)는 계약금이 없으며, 문의 주시면 사진을 확인한 후 바로 견적을 안내해 드립니다.",
  },
  {
    q: "집수리와 스마트홈을 함께 신청할 수 있나요?",
    a: "두 서비스는 가격과 신청 흐름이 완전히 분리되어 있습니다. 각 서비스별로 별도 상담을 진행해주세요.",
  },
  {
    q: "A/S 범위는 어떻게 되나요?",
    a: "반듯집수리의 설치·시공상 하자는 작업 완료일로부터 6개월간 무상 A/S가 적용됩니다. 제품 자체 결함은 시공 문제와 구분하여 안내합니다.",
  },
] as const;

// 메인 FAQ에서 빠진 나머지 문항은 이용안내(/guide) 페이지의 "전체 FAQ 더 보기" 영역에서
// 계속 확인할 수 있도록 별도 상수로 보존한다(최종 개편안 3-⑦).
export const GUIDE_EXTRA_FAQ = [
  {
    q: "제품·자재비는 언제 결제하나요?",
    a: "반듯집수리가 대리구매하는 제품비·자재비는 고객 승인 후 구매 전에 전액 별도로 결제합니다.",
  },
  {
    q: "제품 구매대행이 가능한가요?",
    a: `가능합니다. 기본 구매대행비는 동일 판매처 1회 주문 기준 ${PURCHASE_AGENCY_FEE_WON.toLocaleString("ko-KR")}원이며, 추가 주문·특수 운반은 사전 승인 후 별도로 안내합니다.`,
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
] as const;

// ── 작업 예시 (최종 개편안 7번: 실제 고객 사례가 쌓이기 전까지 예시/시험 콘텐츠로 운영) ──
export type WorkCaseCategory = "repair" | "tenant-care" | "smart-home";

export type WorkCase = {
  id: string;
  category: WorkCaseCategory;
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
// 명확히 표시하는 예시/시연 콘텐츠로 재분류해서 이관했다. 최종 개편안 7번에 따라
// 시험 콘텐츠에서 지역명은 완전히 제거한다.
export const WORK_CASES: WorkCase[] = [
  {
    id: "r1",
    category: "repair",
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
