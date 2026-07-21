import { createClient } from "@libsql/client";

/**
 * 이 공개 홈페이지 프로젝트는 절대 기존 고객 데이터를 조회(SELECT)하지 않습니다.
 * 오직 신규 견적 문의를 삽입(INSERT)하는 용도로만 이 클라이언트를 사용하세요.
 *
 * 연동 설계:
 * - 운영 환경에서는 TURSO_DATABASE_URL / TURSO_WRITE_ONLY_AUTH_TOKEN 환경변수에
 *   "write-only" 권한만 가진 별도 Turso 인증 토큰을 발급받아 사용하는 것을 권장합니다.
 *   (home-repair-promo가 사용하는 것과 동일한 Turso DB의 별도 테이블
 *   `public_estimate_inquiries` 를 바라보되, 이 토큰에는 SELECT 권한을 부여하지 않습니다.)
 * - home-repair-promo 코드베이스에 접근할 수 없는 현재 시점에는, 우선 이 프로젝트
 *   전용 테이블(`public_estimate_inquiries`)에 INSERT만 수행합니다.
 * - 이후 home-repair-promo 쪽에서 이 테이블을 주기적으로 폴링하거나, 동일 DB의
 *   뷰/트리거로 내부 "고객관리" 화면에 신규 문의로 반영하는 매칭 작업이 필요합니다.
 *   (본 리포지토리에는 절대 고객 조회용 크리덴셜을 포함하지 않습니다.)
 */

let cachedClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_WRITE_ONLY_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "TURSO_DATABASE_URL / TURSO_WRITE_ONLY_AUTH_TOKEN 환경변수가 설정되지 않았습니다."
    );
  }

  if (!cachedClient) {
    cachedClient = createClient({ url, authToken });
  }
  return cachedClient;
}

export type EstimateInquiryInput = {
  photoUrls: string[];
  contact: string;
  address: string;
  symptom: string;
  hasOwnMaterial: string;
  preferredSchedule: string;
  extraItems: string;
  consent: boolean;
};

/**
 * 신규 견적 문의를 저장합니다. INSERT 전용이며 이 함수는 절대 SELECT를 수행하지 않습니다.
 */
export async function insertEstimateInquiry(input: EstimateInquiryInput) {
  const client = getClient();

  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS public_estimate_inquiries (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      photo_urls TEXT NOT NULL,
      contact TEXT NOT NULL,
      address TEXT NOT NULL,
      symptom TEXT NOT NULL,
      has_own_material TEXT NOT NULL,
      preferred_schedule TEXT NOT NULL,
      extra_items TEXT NOT NULL,
      consent INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
    )`,
    args: [],
  });

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await client.execute({
    sql: `INSERT INTO public_estimate_inquiries
      (id, created_at, photo_urls, contact, address, symptom, has_own_material, preferred_schedule, extra_items, consent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
    args: [
      id,
      createdAt,
      JSON.stringify(input.photoUrls),
      input.contact,
      input.address,
      input.symptom,
      input.hasOwnMaterial,
      input.preferredSchedule,
      input.extraItems,
      input.consent ? 1 : 0,
    ],
  });

  return { id, createdAt };
}
