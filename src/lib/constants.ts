export const BRAND = {
  name: "반듯집수리",
  tagline: "예약형 집수리",
  serviceArea: "서울·경기 전지역 방문 가능합니다",
  serviceAreaNote: "다만 외곽 지역은 출장비가 추가될 수 있습니다.",
  phone: "010-0000-0000",
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
