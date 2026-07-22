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
