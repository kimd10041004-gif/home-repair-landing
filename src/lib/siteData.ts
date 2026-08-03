// ─────────────────────────────────────────────────────────────────────────
// 관리자 CMS 데이터 계층
//
// 사장님이 /admin 화면에서 편집하는 값(사진, 서비스 항목, 가격)을 Vercel Blob에
// JSON 파일 하나로 저장한다. 이 파일에서 절대 지켜야 할 원칙:
//
// 1) 공개 페이지는 이 파일이 던지는 예외를 잡아서라도 반드시 값을 반환해야 한다
//    (Blob 연결 실패, 파일 없음, 파싱 오류, 필드 누락 어떤 경우에도 빈 화면 금지).
// 2) 병합은 "필드 단위"로 한다 — 저장된 JSON에 일부 값만 있어도 나머지는
//    기본값(DEFAULT_SITE_DATA)으로 채운다. 배열은 저장된 값이 배열이고
//    비어있지 않을 때만 기본값을 대체한다(실수로 빈 배열을 저장해도 화면에서
//    카드가 전부 사라지지 않도록).
// 3) 계약금 정책, A/S 안내, 서비스 지역 등 "고정 정책 문구"는 이 파일이 아니라
//    계속 src/lib/constants.ts에 하드코딩한다 — 관리자가 편집할 수 있는 범위는
//    사진 / 서비스 항목 / 가격으로 명확히 제한한다.
// ─────────────────────────────────────────────────────────────────────────

import { list, put } from "@vercel/blob";

// ── 타입 ────────────────────────────────────────────────────────────────
export type RepairCategoryData = {
  id: string;
  title: string;
  representativeWork: string;
  description: string;
  /** 비워두면(빈 문자열) 화면에 가격을 표시하지 않는다(기존 정책 유지). */
  priceRangeText: string;
  imageUrl: string;
  order: number;
};

export type TenantCarePackageData = {
  id: "light" | "standard" | "total";
  name: string;
  priceWon: number;
  targetNote: string;
  visitNote: string;
  includes: string[];
};

export type SmartHomePackageData = {
  id: "start" | "life" | "fullhome";
  name: string;
  priceWon: number;
  priceFrom: boolean;
  deviceLimit: string;
  automationLimit: string;
  visitNote: string;
  extraNote: string;
};

export type AirbnbSetupPackageData = {
  id: "styling" | "renewal" | "full";
  name: string;
  priceWon: number;
  priceFrom: boolean;
  targetNote: string;
  visitNote: string;
  includes: string[];
};

export type WorkCaseData = {
  id: string;
  category: "repair" | "tenant-care" | "smart-home";
  workType: string;
  problemSolved: string;
  scope: string;
  materials: string;
  siteDifference: string;
  isRealCase: boolean;
  caseTypeLabel: string;
  photoUrl: string;
  order: number;
};

export type AboutPhotoData = {
  id: string;
  src: string;
  alt: string;
  /** true면 실제 현장 사진이 아닌 작업 예시/시연용 사진임을 뱃지로 표시 */
  isExample?: boolean;
  order: number;
};

export type FaqData = {
  id: string;
  category: "main" | "tenant-care" | "smart-home" | "airbnb-setup";
  question: string;
  answer: string;
  order: number;
};

// 편집 가능한 마케팅 카피 문구만 모아둔 타입. 계약금·A/S·취소·서비스지역 등
// "고정 정책 문구"는 여기 포함하지 않고 계속 constants.ts에 하드코딩한다.
export type SiteCopy = {
  heroTitle: string;
  heroSubtitle: string;
  servicesIntro: string;
  tenantCareIntro: string;
  tenantCareDescription: string;
  smartHomeDescription: string;
  airbnbSetupIntro: string;
  airbnbSetupDescription: string;
};

export type SitePolicy = {
  travelFeeWon: number;
  purchaseAgencyFeeWon: number;
};

export type SiteData = {
  version: number;
  updatedAt: string;
  policy: SitePolicy;
  copy: SiteCopy;
  repairCategories: RepairCategoryData[];
  tenantCarePackages: TenantCarePackageData[];
  smartHomePackages: SmartHomePackageData[];
  airbnbSetupPackages: AirbnbSetupPackageData[];
  workCases: WorkCaseData[];
  aboutPhotos: AboutPhotoData[];
  faqs: FaqData[];
};

// ── 기본값: 현재 constants.ts에 하드코딩되어 있던 값 그대로 이관 ─────────────
// Blob에 저장된 데이터가 없거나 손상된 경우 이 값으로 완전히 대체되므로,
// 라이브 사이트의 지금 모습과 100% 동일해야 한다.
export const DEFAULT_SITE_DATA: SiteData = {
  version: 0,
  updatedAt: "",
  policy: {
    travelFeeWon: 20000,
    purchaseAgencyFeeWon: 30000,
  },
  copy: {
    heroTitle: "고장 난 곳은 반듯하게,\n생활은 더 편리하게.",
    heroSubtitle: "생활 집수리부터 주거 케어, 스마트홈 IoT까지\n필요한 서비스를 구분해 안내합니다.",
    servicesIntro:
      "고장 나고 불편한 곳을 필요한 만큼 개별로 신청하는 서비스입니다. 세입자·주거 케어, 스마트홈 IoT 케어와는 별개의 서비스입니다.",
    tenantCareIntro:
      "입주·퇴거·공실 정비, 부모님 댁 정비처럼 여러 설치와 교체를 한 번의 계획으로 묶어 진행하고 싶으신가요?",
    tenantCareDescription:
      "반듯집수리 세입자·주거 케어는 여러 집수리를 한 번의 계획으로 묶어 진행하는 패키지 서비스입니다. 건물의 손상과 구조 변경을 최소화하고, 원상복구를 고려하여 필요한 시설을 교체·설치합니다.",
    smartHomeDescription:
      "조명·플러그·센서·커튼·홈캠·출입·생활가전을 앱과 자동화로 연결하는 서비스입니다. 표시 가격은 제품가격이 아니라 설치·연결·설정 공임입니다.",
    airbnbSetupIntro:
      "숙소로 운영할 집을 화장실부터 가구·배치, 도배·장판 같은 마감 공사까지 한 번의 계획으로 준비하고 싶으신가요?",
    airbnbSetupDescription:
      "반듯집수리 에어비앤비 세팅 케어는 화장실 리모델링, 가구·소품 배치, 도배·장판·조명 등 마감 공사를 한 번의 계획으로 묶어 진행하는 패키지 서비스입니다. 게스트를 맞이하기 좋은 상태로 공간을 준비해 드립니다.",
  },
  repairCategories: [
    {
      id: "water",
      title: "수도·배수",
      representativeWork: "수전 교체·배수구 교체·누수 점검",
      description:
        "주방·욕실 수전 교체와 누수 점검, 배수구 막힘·교체 작업입니다. 자재비는 별도이며 제품별 가격 차이가 큽니다.",
      priceRangeText: "",
      imageUrl: "/brand/kitchen-faucet.png",
      order: 0,
    },
    {
      id: "door",
      title: "문·도어락",
      representativeWork: "문고리·도어락 교체",
      description: "문고리 교체와 디지털 도어락 설치입니다. 자재비는 별도입니다.",
      priceRangeText: "",
      imageUrl: "/brand/entryway-doorlock.png",
      order: 1,
    },
    {
      id: "electric",
      title: "조명·전기부속",
      representativeWork: "LED 조명·스위치·콘센트 교체",
      description: "LED 조명, 스위치, 콘센트 교체 작업입니다. 자재비는 별도입니다.",
      priceRangeText: "",
      imageUrl: "/brand/outlet-switch.png",
      order: 2,
    },
    {
      id: "screen",
      title: "방충망",
      representativeWork: "방충망 교체",
      description:
        "방충망 교체 및 보수 작업입니다. 규격 확인을 위해 줄자 측정 사진이 필요하며 자재비는 별도입니다.",
      priceRangeText: "",
      imageUrl: "/brand/window-screen.png",
      order: 3,
    },
    {
      id: "curtain",
      title: "커튼·블라인드",
      representativeWork: "커튼·블라인드 설치",
      description: "커튼과 블라인드 설치 작업입니다. 자재비는 별도입니다.",
      priceRangeText: "",
      imageUrl: "",
      order: 4,
    },
    {
      id: "bathroom-kitchen",
      title: "욕실·주방·생활소품",
      representativeWork: "욕실·주방·생활소품 설치",
      description: "욕실·주방 소품과 생활소품 설치 작업입니다. 자재비는 별도입니다.",
      priceRangeText: "",
      imageUrl: "",
      order: 5,
    },
  ],
  tenantCarePackages: [
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
  ],
  smartHomePackages: [
    {
      id: "start",
      name: "스마트 스타트",
      priceWon: 150000,
      priceFrom: false,
      deviceLimit: "일반 장비 최대 4개",
      automationLimit: "자동화 최대 1개",
      visitNote: "방문 1회",
      extraNote: "",
    },
    {
      id: "life",
      name: "스마트 라이프",
      priceWon: 200000,
      priceFrom: false,
      deviceLimit: "일반 장비 최대 10개",
      automationLimit: "자동화 최대 3개",
      visitNote: "방문 1회",
      extraNote: "",
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
  ],
  airbnbSetupPackages: [
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
  ],
  workCases: [
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
      order: 0,
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
      order: 1,
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
      order: 2,
    },
  ],
  aboutPhotos: [
    { id: "a1", src: "/brand/switch-outlet-2.png", alt: "스위치·콘센트 클로즈업 작업 현장", order: 0 },
    { id: "a2", src: "/brand/outlet-switch-3.png", alt: "천장 조명 교체 작업 현장", isExample: true, order: 1 },
  ],
  faqs: [
    // main
    {
      id: "faq-main-1",
      category: "main",
      question: "출장비는 얼마인가요?",
      answer:
        "출장비는 방문 1회당 20,000원이며, 서울·경기 전 지역 동일하게 적용됩니다. 같은 방문의 여러 작업에는 출장비가 한 번만 적용됩니다.",
      order: 0,
    },
    {
      id: "faq-main-2",
      category: "main",
      question: "사진만으로 금액이 확정되나요?",
      answer: "사진으로 안내하는 금액은 사전예상액입니다. 최종 금액은 현장 상태와 작업 범위를 확인한 뒤 확정됩니다.",
      order: 1,
    },
    {
      id: "faq-main-3",
      category: "main",
      question: "자재를 직접 준비해도 되나요?",
      answer: "네, 가능합니다. 다만 제품명·모델명·규격을 사전에 확인해 설치 가능 여부를 안내해드립니다.",
      order: 2,
    },
    {
      id: "faq-main-4",
      category: "main",
      question: "계약금은 얼마인가요?",
      answer:
        "계약금은 세입자·주거 케어와 스마트홈 IoT 케어에만 적용되며, 제품·자재비를 제외한 계약대상 서비스 금액의 30%를 결제하면 일정이 확정됩니다. 생활 집수리(개별 작업)는 계약금이 없으며, 문의 주시면 사진을 확인한 후 바로 견적을 안내해 드립니다.",
      order: 3,
    },
    {
      id: "faq-main-5",
      category: "main",
      question: "집수리와 스마트홈을 함께 신청할 수 있나요?",
      answer: "두 서비스는 가격과 신청 흐름이 완전히 분리되어 있습니다. 각 서비스별로 별도 상담을 진행해주세요.",
      order: 4,
    },
    {
      id: "faq-main-6",
      category: "main",
      question: "A/S 범위는 어떻게 되나요?",
      answer:
        "반듯집수리의 설치·시공상 하자는 작업 완료일로부터 6개월간 무상 A/S가 적용됩니다. 제품 자체 결함은 시공 문제와 구분하여 안내합니다.",
      order: 5,
    },
    // tenant-care
    {
      id: "faq-tenant-care-1",
      category: "tenant-care",
      question: "정말 원상복구가 완벽하게 되나요?",
      answer:
        "건물의 손상과 변경을 최소화하고 퇴거 시 재설치를 고려한 시공을 지향하지만, 건물 노후 상태와 마감재, 사용 기간에 따라 미세한 흔적이나 변색이 남을 수 있어 완벽한 원상복구를 보장드리지는 않습니다.",
      order: 0,
    },
    {
      id: "faq-tenant-care-2",
      category: "tenant-care",
      question: "임대인에게 미리 알려야 하나요?",
      answer:
        "네, 시설 교체·설치 전에 임대차계약서와 건물 관리규정을 확인하시고 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아 주셔야 합니다.",
      order: 1,
    },
    {
      id: "faq-tenant-care-3",
      category: "tenant-care",
      question: "떼어낸 기존 부품은 어떻게 되나요?",
      answer:
        "품목별로 분류·포장하여 작업 완료 후 고객님께 인도해드리며, 인도 이후 보관·분실·파손에 대한 관리 책임은 고객님께 있습니다.",
      order: 2,
    },
    {
      id: "faq-tenant-care-4",
      category: "tenant-care",
      question: "퇴거할 때 다시 설치해주나요?",
      answer:
        "보관 중인 기존 부품을 활용한 재설치를 별도로 신청하실 수 있습니다. 다만 이는 패키지에 포함된 무료 서비스가 아닌 별도의 유상 서비스입니다.",
      order: 3,
    },
    {
      id: "faq-tenant-care-5",
      category: "tenant-care",
      question: "계약금은 얼마인가요?",
      answer: "제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하며, 계약금은 총 작업대금에 포함되어 잔금에서 전액 차감됩니다.",
      order: 4,
    },
    // smart-home
    {
      id: "faq-smart-home-1",
      category: "smart-home",
      question: "스마트홈 장비는 앱 하나로 모두 사용할 수 있나요?",
      answer: "모든 장비가 하나의 앱으로 통합되는 것은 아닙니다. 모델별 호환성을 사전에 확인한 뒤 안내해드립니다.",
      order: 0,
    },
    {
      id: "faq-smart-home-2",
      category: "smart-home",
      question: "인터넷이 끊기면 어떻게 되나요?",
      answer: "인터넷·클라우드 장애 시 일부 원격 기능이 제한될 수 있습니다.",
      order: 1,
    },
    {
      id: "faq-smart-home-3",
      category: "smart-home",
      question: "창문 자동개폐는 모든 창문에 가능한가요?",
      answer:
        "창호 구조, 전원, 구동력, 수동 해제와 안전장치를 확인한 뒤 조건부로 제공되는 실측형 옵션이며, 모든 창문에 적용되는 것은 아닙니다.",
      order: 2,
    },
    {
      id: "faq-smart-home-4",
      category: "smart-home",
      question: "세입자도 설치할 수 있나요?",
      answer:
        "타공이 필요 없는 장비 중심의 세입자용 비타공 스마트홈 구성이 가능하며, 임대차계약과 관리규정 확인은 고객님께서 진행해 주셔야 합니다.",
      order: 3,
    },
    // airbnb-setup
    {
      id: "faq-airbnb-setup-1",
      category: "airbnb-setup",
      question: "정말 500만원이면 에어비앤비를 시작할 수 있나요?",
      answer:
        "화장실 전체 리모델링, 가구·소품 전체 배치, 도배·장판·조명 등 마감 공사를 포함한 풀패키지 기준 대표가격이며, 현장 상태와 선택하신 자재·가구 등급에 따라 최종 금액은 달라질 수 있습니다. 가구·자재비와 숙박업 인허가 관련 비용은 포함되지 않습니다.",
      order: 0,
    },
    {
      id: "faq-airbnb-setup-2",
      category: "airbnb-setup",
      question: "숙박업 신고나 사업자등록도 대신 해주시나요?",
      answer:
        "아니요. 반듯집수리는 시공·세팅 서비스만 제공하며, 외국인관광 도시민박업 등 숙박업 신고, 사업자등록, 소방·건축 기준 충족 여부 확인은 고객님이 직접 진행하셔야 합니다.",
      order: 1,
    },
    {
      id: "faq-airbnb-setup-3",
      category: "airbnb-setup",
      question: "임차한 집인데 진행할 수 있나요?",
      answer:
        "가능합니다. 다만 시설 교체·공사 전에 임대차계약서와 건물 관리규정을 확인하시고, 필요한 경우 임대인 또는 관리주체의 사전 동의를 받아 주셔야 합니다.",
      order: 2,
    },
    {
      id: "faq-airbnb-setup-4",
      category: "airbnb-setup",
      question: "가구·소품은 어떤 걸로 채워주나요?",
      answer:
        "원하시는 컨셉과 예산에 맞춰 가구·소품 목록을 제안해 드리며, 직접 구매를 원하시면 구매대행도 가능합니다. 가구·소품 비용은 시공비와 별도입니다.",
      order: 3,
    },
    {
      id: "faq-airbnb-setup-5",
      category: "airbnb-setup",
      question: "숙소 등록용 사진도 찍어주시나요?",
      answer:
        "가구·소품 배치와 조명 연출 등 스타일링은 포함되지만, 전문 사진작가 촬영은 별도 옵션이며 필요 시 제휴 업체를 안내해 드립니다.",
      order: 4,
    },
    {
      id: "faq-airbnb-setup-6",
      category: "airbnb-setup",
      question: "계약금은 얼마인가요?",
      answer: "제품·자재비를 제외한 계약대상 서비스 금액의 30%를 계약금으로 결제하며, 계약금은 총 작업대금에 포함되어 잔금에서 전액 차감됩니다.",
      order: 5,
    },
  ],
};

// ── Blob 저장 키 ───────────────────────────────────────────────────────
// 운영 배포와 로컬 개발이 서로 다른 파일을 사용하도록 분리한다(실수로 운영
// 데이터를 로컬 테스트에서 덮어쓰는 사고 방지).
const CONTENT_KEY =
  process.env.NODE_ENV === "production"
    ? "site-data/content.json"
    : "site-data/content.dev.json";
const HISTORY_PREFIX =
  process.env.NODE_ENV === "production"
    ? "site-data/history/"
    : "site-data/history-dev/";
const MAX_HISTORY_SNAPSHOTS = 20;

// ── 필드 단위 병합 ─────────────────────────────────────────────────────
function mergeArray<T>(fallback: T[], stored: unknown): T[] {
  return Array.isArray(stored) && stored.length > 0 ? (stored as T[]) : fallback;
}

function mergeSiteData(stored: Partial<SiteData> | null | undefined): SiteData {
  if (!stored || typeof stored !== "object") {
    return DEFAULT_SITE_DATA;
  }
  return {
    version: typeof stored.version === "number" ? stored.version : DEFAULT_SITE_DATA.version,
    updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : DEFAULT_SITE_DATA.updatedAt,
    policy: {
      travelFeeWon:
        typeof stored.policy?.travelFeeWon === "number"
          ? stored.policy.travelFeeWon
          : DEFAULT_SITE_DATA.policy.travelFeeWon,
      purchaseAgencyFeeWon:
        typeof stored.policy?.purchaseAgencyFeeWon === "number"
          ? stored.policy.purchaseAgencyFeeWon
          : DEFAULT_SITE_DATA.policy.purchaseAgencyFeeWon,
    },
    copy: {
      heroTitle: typeof stored.copy?.heroTitle === "string" ? stored.copy.heroTitle : DEFAULT_SITE_DATA.copy.heroTitle,
      heroSubtitle:
        typeof stored.copy?.heroSubtitle === "string" ? stored.copy.heroSubtitle : DEFAULT_SITE_DATA.copy.heroSubtitle,
      servicesIntro:
        typeof stored.copy?.servicesIntro === "string"
          ? stored.copy.servicesIntro
          : DEFAULT_SITE_DATA.copy.servicesIntro,
      tenantCareIntro:
        typeof stored.copy?.tenantCareIntro === "string"
          ? stored.copy.tenantCareIntro
          : DEFAULT_SITE_DATA.copy.tenantCareIntro,
      tenantCareDescription:
        typeof stored.copy?.tenantCareDescription === "string"
          ? stored.copy.tenantCareDescription
          : DEFAULT_SITE_DATA.copy.tenantCareDescription,
      smartHomeDescription:
        typeof stored.copy?.smartHomeDescription === "string"
          ? stored.copy.smartHomeDescription
          : DEFAULT_SITE_DATA.copy.smartHomeDescription,
      airbnbSetupIntro:
        typeof stored.copy?.airbnbSetupIntro === "string"
          ? stored.copy.airbnbSetupIntro
          : DEFAULT_SITE_DATA.copy.airbnbSetupIntro,
      airbnbSetupDescription:
        typeof stored.copy?.airbnbSetupDescription === "string"
          ? stored.copy.airbnbSetupDescription
          : DEFAULT_SITE_DATA.copy.airbnbSetupDescription,
    },
    repairCategories: mergeArray(DEFAULT_SITE_DATA.repairCategories, stored.repairCategories),
    tenantCarePackages: mergeArray(DEFAULT_SITE_DATA.tenantCarePackages, stored.tenantCarePackages),
    smartHomePackages: mergeArray(DEFAULT_SITE_DATA.smartHomePackages, stored.smartHomePackages),
    airbnbSetupPackages: mergeArray(DEFAULT_SITE_DATA.airbnbSetupPackages, stored.airbnbSetupPackages),
    workCases: mergeArray(DEFAULT_SITE_DATA.workCases, stored.workCases),
    aboutPhotos: mergeArray(DEFAULT_SITE_DATA.aboutPhotos, stored.aboutPhotos),
    faqs: mergeArray(DEFAULT_SITE_DATA.faqs, stored.faqs),
  };
}

// ── 읽기 ───────────────────────────────────────────────────────────────
// 공개 페이지에서 사용. 어떤 이유로든 실패하면 절대 throw하지 않고 기본값을 반환한다.
export async function getSiteData(): Promise<SiteData> {
  try {
    const { blobs } = await list({ prefix: CONTENT_KEY, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONTENT_KEY);
    if (!match) return DEFAULT_SITE_DATA;

    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_SITE_DATA;

    const json = (await res.json()) as Partial<SiteData>;
    return mergeSiteData(json);
  } catch (error) {
    console.error("[siteData] getSiteData failed, falling back to defaults", error);
    return DEFAULT_SITE_DATA;
  }
}

// 관리자 화면 하이드레이션용 — 저장된 값이 없으면 기본값(=현재 라이브 값)을 그대로 보여줘
// 사장님이 "지금 상태"부터 편집을 시작할 수 있게 한다. 실패 시에도 기본값으로 폴백.
export async function getSiteDataForAdmin(): Promise<SiteData> {
  return getSiteData();
}

// ── 쓰기 ───────────────────────────────────────────────────────────────
// 관리자 API 라우트에서만 호출한다(인증 필요). 저장 직전에 히스토리 스냅샷도 남긴다.
export async function saveSiteData(next: SiteData): Promise<SiteData> {
  const toSave: SiteData = {
    ...next,
    version: (next.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  const body = JSON.stringify(toSave, null, 2);

  // 히스토리 스냅샷 먼저 기록 — 실패해도 본 저장은 계속 진행(백업은 best-effort).
  try {
    await put(`${HISTORY_PREFIX}${Date.now()}.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    await pruneHistory();
  } catch (error) {
    console.error("[siteData] history snapshot failed (non-fatal)", error);
  }

  await put(CONTENT_KEY, body, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return toSave;
}

async function pruneHistory(): Promise<void> {
  try {
    const { blobs } = await list({ prefix: HISTORY_PREFIX, limit: 1000 });
    const sorted = [...blobs].sort((a, b) => b.pathname.localeCompare(a.pathname));
    const toDelete = sorted.slice(MAX_HISTORY_SNAPSHOTS);
    if (toDelete.length === 0) return;
    const { del } = await import("@vercel/blob");
    await del(toDelete.map((b) => b.url));
  } catch (error) {
    console.error("[siteData] pruneHistory failed (non-fatal)", error);
  }
}

// ── 관리자 저장 입력값 검증 ────────────────────────────────────────────
// 관리자 화면에서 올라온 임의의 JSON을 그대로 저장하지 않고, 타입이 올바른
// 항목만 걸러서 받아들인다. 잘못된 항목은 조용히 제외하고(전체 저장 실패 대신)
// 유효한 나머지만 저장해 사장님이 작업 중 실수로 전체 화면이 깨지는 것을 막는다.
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function sanitizeIncomingSiteData(input: unknown): SiteData {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const rawPolicy = (raw.policy && typeof raw.policy === "object" ? raw.policy : {}) as Record<string, unknown>;
  const rawCopy = (raw.copy && typeof raw.copy === "object" ? raw.copy : {}) as Record<string, unknown>;

  const repairCategories = Array.isArray(raw.repairCategories)
    ? raw.repairCategories
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c, i) => ({
          id: str(c.id, `category-${i}`),
          title: str(c.title),
          representativeWork: str(c.representativeWork),
          description: str(c.description),
          priceRangeText: str(c.priceRangeText),
          imageUrl: str(c.imageUrl),
          order: num(c.order, i),
        }))
    : DEFAULT_SITE_DATA.repairCategories;

  const tenantCarePackages = Array.isArray(raw.tenantCarePackages)
    ? raw.tenantCarePackages
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c) => ({
          id: (["light", "standard", "total"].includes(str(c.id)) ? str(c.id) : "light") as TenantCarePackageData["id"],
          name: str(c.name),
          priceWon: num(c.priceWon),
          targetNote: str(c.targetNote),
          visitNote: str(c.visitNote),
          includes: Array.isArray(c.includes) ? c.includes.filter((x): x is string => typeof x === "string") : [],
        }))
    : DEFAULT_SITE_DATA.tenantCarePackages;

  const smartHomePackages = Array.isArray(raw.smartHomePackages)
    ? raw.smartHomePackages
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c) => ({
          id: (["start", "life", "fullhome"].includes(str(c.id)) ? str(c.id) : "start") as SmartHomePackageData["id"],
          name: str(c.name),
          priceWon: num(c.priceWon),
          priceFrom: bool(c.priceFrom),
          deviceLimit: str(c.deviceLimit),
          automationLimit: str(c.automationLimit),
          visitNote: str(c.visitNote),
          extraNote: str(c.extraNote),
        }))
    : DEFAULT_SITE_DATA.smartHomePackages;

  const airbnbSetupPackages = Array.isArray(raw.airbnbSetupPackages)
    ? raw.airbnbSetupPackages
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c) => ({
          id: (["styling", "renewal", "full"].includes(str(c.id))
            ? str(c.id)
            : "styling") as AirbnbSetupPackageData["id"],
          name: str(c.name),
          priceWon: num(c.priceWon),
          priceFrom: bool(c.priceFrom),
          targetNote: str(c.targetNote),
          visitNote: str(c.visitNote),
          includes: Array.isArray(c.includes) ? c.includes.filter((x): x is string => typeof x === "string") : [],
        }))
    : DEFAULT_SITE_DATA.airbnbSetupPackages;

  const workCases = Array.isArray(raw.workCases)
    ? raw.workCases
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c, i) => ({
          id: str(c.id, `case-${i}`),
          category: (["repair", "tenant-care", "smart-home"].includes(str(c.category))
            ? str(c.category)
            : "repair") as WorkCaseData["category"],
          workType: str(c.workType),
          problemSolved: str(c.problemSolved),
          scope: str(c.scope),
          materials: str(c.materials),
          siteDifference: str(c.siteDifference),
          isRealCase: bool(c.isRealCase),
          caseTypeLabel: str(c.caseTypeLabel, "자체 기능시험"),
          photoUrl: str(c.photoUrl),
          order: num(c.order, i),
        }))
    : DEFAULT_SITE_DATA.workCases;

  const aboutPhotos = Array.isArray(raw.aboutPhotos)
    ? raw.aboutPhotos
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c, i) => ({
          id: str(c.id, `photo-${i}`),
          src: str(c.src),
          alt: str(c.alt),
          isExample: bool(c.isExample),
          order: num(c.order, i),
        }))
    : DEFAULT_SITE_DATA.aboutPhotos;

  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c, i) => ({
          id: str(c.id, `faq-${i}`),
          category: (["main", "tenant-care", "smart-home", "airbnb-setup"].includes(str(c.category))
            ? str(c.category)
            : "main") as FaqData["category"],
          question: str(c.question),
          answer: str(c.answer),
          order: num(c.order, i),
        }))
    : DEFAULT_SITE_DATA.faqs;

  return {
    version: num(raw.version, DEFAULT_SITE_DATA.version),
    updatedAt: DEFAULT_SITE_DATA.updatedAt,
    policy: {
      travelFeeWon: num(rawPolicy.travelFeeWon, DEFAULT_SITE_DATA.policy.travelFeeWon),
      purchaseAgencyFeeWon: num(rawPolicy.purchaseAgencyFeeWon, DEFAULT_SITE_DATA.policy.purchaseAgencyFeeWon),
    },
    copy: {
      heroTitle: str(rawCopy.heroTitle, DEFAULT_SITE_DATA.copy.heroTitle),
      heroSubtitle: str(rawCopy.heroSubtitle, DEFAULT_SITE_DATA.copy.heroSubtitle),
      servicesIntro: str(rawCopy.servicesIntro, DEFAULT_SITE_DATA.copy.servicesIntro),
      tenantCareIntro: str(rawCopy.tenantCareIntro, DEFAULT_SITE_DATA.copy.tenantCareIntro),
      tenantCareDescription: str(rawCopy.tenantCareDescription, DEFAULT_SITE_DATA.copy.tenantCareDescription),
      smartHomeDescription: str(rawCopy.smartHomeDescription, DEFAULT_SITE_DATA.copy.smartHomeDescription),
      airbnbSetupIntro: str(rawCopy.airbnbSetupIntro, DEFAULT_SITE_DATA.copy.airbnbSetupIntro),
      airbnbSetupDescription: str(rawCopy.airbnbSetupDescription, DEFAULT_SITE_DATA.copy.airbnbSetupDescription),
    },
    repairCategories,
    tenantCarePackages,
    smartHomePackages,
    airbnbSetupPackages,
    workCases,
    aboutPhotos,
    faqs,
  };
}

export async function listHistorySnapshots(): Promise<{ url: string; uploadedAt: string; pathname: string }[]> {
  try {
    const { blobs } = await list({ prefix: HISTORY_PREFIX, limit: MAX_HISTORY_SNAPSHOTS });
    return blobs
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .map((b) => ({ url: b.url, uploadedAt: b.uploadedAt.toISOString(), pathname: b.pathname }));
  } catch (error) {
    console.error("[siteData] listHistorySnapshots failed", error);
    return [];
  }
}
