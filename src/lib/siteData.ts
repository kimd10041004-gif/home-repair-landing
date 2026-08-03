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

export type SitePolicy = {
  travelFeeWon: number;
  minSingleVisitWon: number;
  purchaseAgencyFeeWon: number;
};

export type SiteData = {
  version: number;
  updatedAt: string;
  policy: SitePolicy;
  repairCategories: RepairCategoryData[];
  tenantCarePackages: TenantCarePackageData[];
  smartHomePackages: SmartHomePackageData[];
  workCases: WorkCaseData[];
  aboutPhotos: AboutPhotoData[];
};

// ── 기본값: 현재 constants.ts에 하드코딩되어 있던 값 그대로 이관 ─────────────
// Blob에 저장된 데이터가 없거나 손상된 경우 이 값으로 완전히 대체되므로,
// 라이브 사이트의 지금 모습과 100% 동일해야 한다.
export const DEFAULT_SITE_DATA: SiteData = {
  version: 0,
  updatedAt: "",
  policy: {
    travelFeeWon: 20000,
    minSingleVisitWon: 150000,
    purchaseAgencyFeeWon: 30000,
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
  ],
  smartHomePackages: [
    {
      id: "start",
      name: "스마트 스타트",
      priceWon: 490000,
      priceFrom: false,
      deviceLimit: "일반 장비 최대 4개",
      automationLimit: "자동화 최대 2개",
      visitNote: "방문 1회",
      extraNote: "",
    },
    {
      id: "life",
      name: "스마트 라이프",
      priceWon: 990000,
      priceFrom: false,
      deviceLimit: "일반 장비 최대 10개",
      automationLimit: "자동화 최대 5개",
      visitNote: "방문 1회",
      extraNote: "",
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
      minSingleVisitWon:
        typeof stored.policy?.minSingleVisitWon === "number"
          ? stored.policy.minSingleVisitWon
          : DEFAULT_SITE_DATA.policy.minSingleVisitWon,
      purchaseAgencyFeeWon:
        typeof stored.policy?.purchaseAgencyFeeWon === "number"
          ? stored.policy.purchaseAgencyFeeWon
          : DEFAULT_SITE_DATA.policy.purchaseAgencyFeeWon,
    },
    repairCategories: mergeArray(DEFAULT_SITE_DATA.repairCategories, stored.repairCategories),
    tenantCarePackages: mergeArray(DEFAULT_SITE_DATA.tenantCarePackages, stored.tenantCarePackages),
    smartHomePackages: mergeArray(DEFAULT_SITE_DATA.smartHomePackages, stored.smartHomePackages),
    workCases: mergeArray(DEFAULT_SITE_DATA.workCases, stored.workCases),
    aboutPhotos: mergeArray(DEFAULT_SITE_DATA.aboutPhotos, stored.aboutPhotos),
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

  return {
    version: num(raw.version, DEFAULT_SITE_DATA.version),
    updatedAt: DEFAULT_SITE_DATA.updatedAt,
    policy: {
      travelFeeWon: num(rawPolicy.travelFeeWon, DEFAULT_SITE_DATA.policy.travelFeeWon),
      minSingleVisitWon: num(rawPolicy.minSingleVisitWon, DEFAULT_SITE_DATA.policy.minSingleVisitWon),
      purchaseAgencyFeeWon: num(rawPolicy.purchaseAgencyFeeWon, DEFAULT_SITE_DATA.policy.purchaseAgencyFeeWon),
    },
    repairCategories,
    tenantCarePackages,
    smartHomePackages,
    workCases,
    aboutPhotos,
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
