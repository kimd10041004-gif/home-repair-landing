export const BRAND = {
  name: "반듯집수리",
  tagline: "예약형 집수리",
  serviceArea: "서울·경기 전지역 방문 가능합니다",
  serviceAreaNote: "다만 외곽 지역은 출장비가 추가될 수 있습니다.",
  phone: "010-2370-5091",
  kakaoUrl: "http://pf.kakao.com/_kHyfX/chat",
  businessName: "반듯집수리",
  businessRegistrationNumber: "000-00-00000",
  businessOwner: "권태우",
  businessAddress: "경기도 고양시 일산동구 ○○로 00",
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/services", label: "서비스/가격" },
  { href: "/tenant-care", label: "세입자 안심 케어" },
  { href: "/reviews", label: "작업내용 소개" },
  { href: "/estimate", label: "견적문의" },
  { href: "/guide", label: "이용안내" },
  { href: "/about", label: "회사소개" },
] as const;

export const PRICE_NOTE =
  "작업비는 작업 종류, 난이도, 현장 구조, 이동 거리 등에 따라 달라질 수 있습니다. 보내주신 사진을 기준으로 사전예상액을 안내하며, 현장에서 추가 작업이나 금액 변경이 필요한 경우에는 작업 전에 먼저 설명드리고 동의를 받습니다.";

// ── 견적 신청폼: 작업유형 조건분기 ────────────────────────────────
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
  "고객님은 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으며, 동의하지 않으실 경우 견적 상담 접수가 제한될 수 있습니다.";

// 접수완료 화면 등에 표시하는 예상견적 안내 원칙 문구 (용어 원칙: "예상 견적/비용범위", 확정견적 금지)
export const ESTIMATE_DISCLAIMER_TEXT =
  "견적 신청이 접수되었습니다.\n" +
  "보내주신 사진과 내용을 확인한 후 사진 기준 예상 작업 범위와 비용을 안내해 드립니다.\n" +
  "사진만으로 확인하기 어려운 부분이 있는 경우 카카오톡 또는 전화로 추가 사진과 정보를 요청드릴 수 있습니다.\n" +
  "최종 작업금액은 현장을 확인한 뒤 작업 시작 전에 안내하며, 고객님의 동의를 받은 후 작업을 진행합니다.";

// 방문 일정이 확정될 때(상담 단계에서) 안내되는 예약금 정책 문구
export const DEPOSIT_NOTICE_TEXT =
  "예약금 안내: 방문 일정이 확정되면 예약금 4만원을 입금해주셔야 예약이 확정됩니다. " +
  "예약금은 일정 확보 및 사전 준비 비용으로 사용되어 환불이 어려운 점 양해 부탁드립니다.";

export type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "faucet",
    title: "수전교체",
    description: "주방·욕실 수전 교체 작업입니다. 제품별 가격 차이가 커서 예상 인건비와 자재비를 나누어 안내드립니다.",
    imageSrc: "/brand/kitchen-faucet.png",
  },
  {
    id: "drain",
    title: "배수구",
    description: "막힘·누수 등 배수구 관련 작업입니다.",
    imageSrc: "/brand/kitchen-faucet-2.png",
  },
  {
    id: "doorknob",
    title: "문고리",
    description: "문고리 교체 및 수리 작업입니다.",
    imageSrc: "/brand/doorlock-2.png",
  },
  {
    id: "doorlock",
    title: "도어락",
    description: "디지털 도어락은 제품·설치 난이도에 따라 자재비 차이가 커서 예상 인건비와 자재비를 나누어 사전 안내드립니다.",
    imageSrc: "/brand/entryway-doorlock.png",
  },
  {
    id: "screen",
    title: "방충망",
    description: "방충망 교체 및 보수 작업입니다. 규격 확인을 위해 줄자 측정 사진이 필요하며, 예상 인건비와 자재비를 나누어 안내드립니다.",
    imageSrc: "/brand/window-screen.png",
  },
  {
    id: "electric",
    title: "전등/콘센트",
    description: "전등 및 콘센트 교체 작업입니다.",
    imageSrc: "/brand/outlet-switch.png",
  },
  {
    id: "etc",
    title: "기타수리",
    description: "목록에 없는 자잘한 생활수리도 편하게 문의해주세요. 사진을 보내주시면 작업 가능 여부와 예상 비용을 안내해드립니다.",
    imageSrc: "/brand/livingroom-paint.png",
  },
];

export type Review = {
  id: string;
  region: string;
  workType: string;
  content: string;
  photoUrl: string;
};

export const REVIEWS: Review[] = [
  {
    id: "r1",
    region: "고양시 일산동구",
    workType: "수전교체",
    content:
      "주방 수전에서 물이 새서 문의드렸는데, 사진만 보내드렸는데도 예상 비용을 미리 안내해주셔서 부담 없이 예약했습니다. 방문하셔서 상태 확인 후 최종 금액을 먼저 말씀해주시고 동의 후 작업을 시작하셔서 믿음이 갔습니다. 교체 후 물도 잘 나오고 마감도 깔끔합니다.",
    photoUrl: "/brand/kitchen-faucet-3.png",
  },
  {
    id: "r2",
    region: "일산서구",
    workType: "방충망 교체",
    content:
      "베란다 방충망이 낡아서 전체 교체를 요청드렸습니다. 사이즈가 특이해서 미리 줄자로 가로세로 재서 사진을 보내달라고 하시더라구요. 덕분에 방문 당일 바로 맞는 자재로 작업이 끝났습니다. 작업 전후 사진도 챙겨주셔서 확인하기 편했습니다.",
    photoUrl: "/brand/window-screen-2.png",
  },
  {
    id: "r3",
    region: "고양시 덕양구",
    workType: "문고리 교체",
    content:
      "오래된 방문 손잡이가 헐거워져서 문의드렸습니다. 방문 전 상담 챗봇으로 사진을 보내니 예상 비용대와 필요한 준비물을 미리 알려주셔서 좋았습니다. 실제 방문해서도 안내받은 범위 내에서 견적이 나왔고 추가 비용 없이 마무리됐습니다.",
    photoUrl: "/brand/doorlock-3.png",
  },
];

// ── 세입자 안심 케어 패키지 (원상복구를 고려한 시공) ─────────────────────
// 기존 일반 집수리 서비스/가격과 절대 혼합하지 않는 독립된 서비스 카테고리입니다.

export const TENANT_CARE = {
  title: "세입자 안심 케어",
  subtitle: "원상복구를 고려한 시공",
  intro:
    "집을 나만의 스타일로 꾸미고 싶지만, 나중에 이사할 때 기존 상태로 되돌리는 문제가 걱정되시나요?",
  description:
    "반듯집수리 안심 케어는 건물의 손상과 구조 변경을 최소화하고, 퇴거 시 재설치를 고려하여 필요한 시설을 교체·설치하는 서비스입니다.",
  descriptionSub:
    "탈거한 기존 부품은 품목별로 분류·포장하여 고객님께 인도하며, 실제 작업 범위와 비용은 사진 상담 후 견적서에 명확히 안내합니다.",
  heroHighlights: [
    "서울·경기 기본권역 총 예상 결제금액 640,000원부터",
    "경기 외곽권역 총 예상 결제금액 670,000원부터",
    "자재비 별도",
    "모든 표시 금액은 부가가치세 포함",
    "사진 상담 후 작업 항목·수량·총 예상 결제금액 안내",
  ],
  ctaPrimary: "사진으로 총 예상액 받기",
  ctaSecondary: "카카오톡으로 상담하기",
  ctaNotice:
    "상담 신청만으로 계약이나 결제가 확정되지 않습니다. 사진 확인 후 견적서와 주요 거래조건을 안내하며, 고객 확인과 예약금 결제가 완료되면 일정이 확정됩니다.",
  packageFootnote:
    "안내된 작업은 선택 가능한 예시입니다. 모든 작업이 동시에 포함되는 것은 아니며, 실제 작업 범위는 견적서에 기재된 항목과 수량으로 확정됩니다.",
  exclusionNotice:
    "패키지 기본 범위에 포함되지 않는 작업은 사진 또는 현장 확인 후 별도의 사전예상액을 안내합니다.",
  extraWorkNotice1:
    "상담 시 확정된 작업 범위를 초과하거나 현장에서 새로운 작업이 필요한 경우, 작업 내용과 추가 예상금액을 먼저 안내합니다. 고객님의 동의를 받은 후에만 추가 작업을 진행하며, 사전에 동의받지 않은 추가 비용은 청구하지 않습니다.",
  extraWorkNotice2:
    "추가 작업이 당일 진행하기 어렵거나 별도의 자재·인력·장비가 필요한 경우 새로운 일정과 견적을 안내할 수 있습니다.",
  travelFeeNotice: [
    "서울·경기 기본권역: 계약당 50,000원 (부가가치세 포함)",
    "경기 외곽권역: 계약당 80,000원 (부가가치세 포함)",
    "패키지 가격 카드에는 해당 출장비가 이미 포함된 총 예상 결제금액을 표시합니다.",
    "정확한 출장권역과 적용 출장비는 고객의 작업 주소를 확인한 뒤 사전견적서에 표시합니다.",
    "토탈 패키지에 현장 실측이 포함되는 경우, 계약된 실측 1회와 본 시공 1회에 대해 출장비를 중복 청구하지 않습니다.",
    "유료주차비와 고속도로 통행료는 실제 발생 여부와 금액을 미리 확정하기 어려워 대표가격에서 제외될 수 있으며, 발생 가능성을 사전에 안내하고 실제 발생 내역을 확인할 수 있는 경우에만 잔금 정산 시 별도로 청구합니다.",
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
  returnServiceTitle: "퇴거 시 원상복구 리턴 서비스",
  returnServiceBody: [
    "안심 케어 이용 고객은 퇴거 시 보관 중인 기존 부품을 활용한 재설치 작업을 별도로 신청할 수 있습니다.",
    "리턴 서비스는 현재 패키지에 포함된 무료 서비스가 아니라 별도의 유상 서비스입니다.",
    "보관 부품의 상태와 퇴거 당시 현장 상태를 확인한 후 작업 범위와 사전예상액을 안내합니다.",
  ],
  depositNoticeTitle: "예약금 안내",
  depositNoticeBody: [
    "일정 확보와 작업 준비를 위해 예약 확정 시 40,000원의 예약금을 받습니다.",
    "예약금은 별도의 수수료가 아니며 총 작업대금에 포함됩니다. 잔금 결제 시 예약금 전액을 차감합니다.",
    "예약은 사전견적서와 주요 거래조건을 확인하고 예약금 결제가 완료된 시점에 최종 확정됩니다.",
  ],
  cancelPolicyTitle: "변경·취소·환불 안내",
  cancelPolicyBody: [
    "비대면 계약에는 관계 법령에 따른 청약철회와 환불 기준을 우선 적용합니다.",
    "이미 제공된 실측이나 작업은 실제 제공된 범위를 기준으로 정산합니다.",
    "고객이 승인한 주문제작품 또는 실제로 환불받지 못한 자재비만 증빙 후 반영합니다.",
    "주문 취소나 반품을 통해 회수된 금액은 고객 부담액에서 제외합니다.",
    "반듯집수리 사정으로 작업을 진행하지 못하면 예약금을 반환합니다.",
    "세부 기준은 계약 전 견적서 또는 변경·취소 안내 문서에서 확인하실 수 있습니다.",
  ],
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
  consultFlow: [
    "고객이 사진과 작업내용 제출",
    "관리자가 사진과 작업 범위 확인",
    "견적번호가 포함된 사전견적서 발송",
    "고객이 작업 항목·수량·자재비·출장비·총 예상 결제금액 확인",
    "주요 거래조건 동의",
    "예약금 40,000원 결제",
    "예약 일정 최종 확정",
    "작업 완료 후 작업확인서와 기존 부품 인도 확인",
  ],
  submittedNotice1:
    "상담 신청이 접수되었습니다. 사진과 작업 내용을 확인한 후 작업 범위와 총 예상 결제금액이 포함된 사전견적서를 안내해 드립니다.",
  submittedNotice2: "상담 신청만으로 계약이나 예약이 확정되지 않습니다.",
} as const;

export type TenantCarePackageId = "light" | "standard" | "total";

export type TenantCarePackage = {
  id: TenantCarePackageId;
  name: string;
  targetNote: string;
  priceBaseWon: number;
  priceOuterWon: number;
  laborIncludedWon: number;
  includes: string[];
  examples: string[];
};

export const TENANT_CARE_PACKAGES: TenantCarePackage[] = [
  {
    id: "light",
    name: "안심 라이트 케어",
    targetNote: "소형 작업 중심",
    priceBaseWon: 640000,
    priceOuterWon: 670000,
    laborIncludedWon: 590000,
    includes: [
      "패키지 기본 공임 590,000원 포함",
      "해당 권역 출장비 포함",
      "자재비 별도",
      "부가가치세 포함",
      "1인 작업자 본 시공 1회 기준",
    ],
    examples: [
      "무타공 커튼 또는 블라인드 설치",
      "일반 전등 교체",
      "방문 손잡이 교체",
      "스위치·콘센트 플레이트 교체",
      "탈거한 기존 부품 분류·포장 후 고객 인도",
    ],
  },
  {
    id: "standard",
    name: "안심 스탠다드 케어",
    targetNote: "원룸·소형 주거공간 중심",
    priceBaseWon: 1040000,
    priceOuterWon: 1070000,
    laborIncludedWon: 990000,
    includes: [
      "패키지 기본 공임 990,000원 포함",
      "해당 권역 출장비 포함",
      "자재비 별도",
      "부가가치세 포함",
      "1인 작업자 본 시공 1회 기준",
    ],
    examples: [
      "커튼 또는 블라인드 설치",
      "일반 전등 교체",
      "욕실 또는 주방 수전 교체",
      "방문 손잡이 교체",
      "스위치·콘센트 플레이트 교체",
      "욕실·주방 생활 소품 설치",
      "탈거한 기존 부품 분류·포장 후 고객 인도",
    ],
  },
  {
    id: "total",
    name: "안심 토탈 케어",
    targetNote: "필요 시 현장 실측 1회, 본 시공 1회 기준",
    priceBaseWon: 1540000,
    priceOuterWon: 1570000,
    laborIncludedWon: 1490000,
    includes: [
      "패키지 기본 공임 1,490,000원 포함",
      "해당 권역 출장비 포함",
      "자재비 별도",
      "부가가치세 포함",
      "필요 시 현장 실측 1회",
      "본 시공 1회 기준",
    ],
    examples: [
      "사전 사진 상담",
      "맞춤형 작업계획 수립",
      "필요 시 현장 실측",
      "현장 구조와 사용 목적에 적합한 제품 안내",
      "견적서에 명시된 설치·교체 작업",
      "탈거한 기존 부품 분류·라벨링·포장",
      "작업 완료 후 설치 상태 확인",
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
      "제품 준비가 어려운 고객은 구매·운반 대행을 요청할 수 있습니다.",
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
    label: "가격·출장비·자재비와 주요 거래조건 확인",
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
  "무타공 커튼/블라인드 설치",
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
    a: "보관 중인 기존 부품을 활용한 재설치(리턴 서비스)를 별도로 신청하실 수 있습니다. 다만 이는 패키지에 포함된 무료 서비스가 아닌 별도의 유상 서비스입니다.",
  },
  {
    q: "예약금은 환불되나요?",
    a: "예약금은 총 작업대금에 포함되는 금액이며, 관계 법령에 따른 청약철회·환불 기준을 우선 적용합니다. 반듯집수리 사정으로 작업을 진행하지 못하면 예약금을 반환해드립니다.",
  },
] as const;
