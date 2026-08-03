import Image from "next/image";
import Link from "next/link";
import {
  AIRBNB_SETUP_PACKAGES,
  CONSULT_PROCESS_STEPS,
  MAIN_FAQ,
  REPAIR_OTHER_CTA,
  SMART_HOME,
  TENANT_CARE,
  TRUST_CRITERIA,
} from "@/lib/constants";
import { getSiteData, type RepairCategoryData } from "@/lib/siteData";
import { IconCheck, IconCurtain, IconHomeGoods } from "@/components/icons";
import SmartHomeScenarioPicker from "@/components/SmartHomeScenarioPicker";

function won(n: number) {
  return n.toLocaleString("ko-KR");
}

// ③ 생활 집수리 카드에서 사진이 없는 두 카테고리(커튼·블라인드 / 욕실·주방·생활소품)는
// 이모지 대신 선형 아이콘으로 대체 표시한다(최종 개편안 6번).
const FALLBACK_ICON: Partial<Record<RepairCategoryData["id"], (props: { className?: string }) => React.ReactElement>> = {
  curtain: IconCurtain,
  "bathroom-kitchen": IconHomeGoods,
};

// 케어 패키지 표의 "방문" 열은 메인페이지에서만 간단히 요약해서 보여준다.
const CARE_VISIT_LABEL: Record<string, string> = {
  light: "본 시공 1회",
  standard: "본 시공 1회",
  total: "최대 2회",
};

// 관리자가 사진/가격/서비스를 수정하면 1분 안에 홈페이지에 반영되도록 ISR을 사용한다.
export const revalidate = 60;

export default async function HomePage() {
  const site = await getSiteData();
  const repairCategories = [...site.repairCategories].sort((a, b) => a.order - b.order);
  const carePriceFrom = site.tenantCarePackages[0]?.priceWon ?? 0;
  const smartHomePriceFrom = site.smartHomePackages[0]?.priceWon ?? 0;
  const airbnbSetupPriceFrom = AIRBNB_SETUP_PACKAGES[0].priceWon;
  const travelFeeWon = site.policy.travelFeeWon;

  return (
    <div>
      {/* ① 히어로 */}
      <section className="bg-brand-cream">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-brand-teal-dark">
              서울·경기 전 지역 예약형 집수리
            </p>
            <h1 className="mt-3 text-[32px] font-bold leading-snug text-brand-navy sm:text-[44px]">
              고장 난 곳은 반듯하게,
              <br />
              생활은 더 편리하게.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              생활 집수리부터 주거 케어, 스마트홈 IoT까지
              <br />
              필요한 서비스를 구분해 안내합니다.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/estimate"
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-navy px-6 text-center font-semibold text-white hover:bg-brand-navy-dark sm:w-auto"
              >
                사진 3장으로 상담 시작
              </Link>
              <Link
                href="#service-select"
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-center font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                서비스 선택하기
              </Link>
            </div>

            {/* 가격 핵심 한 줄 요약: 페이지를 끝까지 읽어야 조건을 알게 되는 문제를 없앤다 */}
            <p className="mt-6 text-sm font-semibold text-brand-navy">
              출장비 방문당 {won(travelFeeWon)}원 · 케어 {won(carePriceFrom)}원부터 · IoT{" "}
              {won(smartHomePriceFrom)}원부터 · 에어비앤비 {won(airbnbSetupPriceFrom)}원부터
            </p>
            <p className="mt-1 text-sm text-slate-500">
              자재·제품비는 별도이며, 사진 안내 금액은 사전예상액입니다.
            </p>
          </div>

          <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-2xl lg:block">
            <Image
              src="/brand/hero-banner.png"
              alt="반듯집수리 작업 현장 이미지"
              fill
              sizes="(min-width: 1024px) 480px, 0px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ② 서비스 선택 카드 (최대 3장, 설명 최대 3줄) */}
      <section id="service-select" className="scroll-mt-20 border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-center text-[26px] font-bold text-brand-navy sm:text-[32px]">
            필요한 서비스를 선택해주세요
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/services"
              className="flex flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-brand-teal"
            >
              <h3 className="text-lg font-bold text-brand-navy">생활 집수리</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600">
                필요한 작업을 개별 신청
                <br />
                출장비 방문당 {won(travelFeeWon)}원
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">집수리 항목 보기 →</span>
            </Link>
            <Link
              href="/tenant-care"
              className="flex flex-col rounded-2xl border border-slate-200 bg-brand-cream p-5 transition hover:border-brand-teal"
            >
              <h3 className="text-lg font-bold text-brand-navy">세입자·주거 케어</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600">
                여러 작업을 한 번의 계획으로 진행
                <br />
                {won(carePriceFrom)}원부터
                <br />
                자재비·출장비 별도
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">케어 패키지 비교 →</span>
            </Link>
            <Link
              href="/smart-home"
              className="flex flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-brand-teal"
            >
              <h3 className="text-lg font-bold text-brand-navy">스마트홈 IoT 케어</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600">
                조명·센서·플러그 등을 앱과 자동화로 연결
                <br />
                {won(smartHomePriceFrom)}원부터
                <br />
                제품비·출장비 별도
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">스마트홈 구성 보기 →</span>
            </Link>
            <Link
              href="/airbnb-setup"
              className="flex flex-col rounded-2xl border border-slate-200 bg-brand-cream p-5 transition hover:border-brand-teal"
            >
              <h3 className="text-lg font-bold text-brand-navy">에어비앤비 세팅 케어</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600">
                화장실·가구·마감 공사를 한 번에 준비
                <br />
                {won(airbnbSetupPriceFrom)}원부터
                <br />
                가구비·자재비·출장비 별도
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-navy">에어비앤비 패키지 보기 →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ③ 생활 집수리 (6개 카드 + 기타 작업 버튼) */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">생활 집수리</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {repairCategories.map((cat) => {
              const FallbackIcon = FALLBACK_ICON[cat.id];
              return (
                <div
                  key={cat.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-brand-cream"
                >
                  {cat.imageUrl ? (
                    <div className="relative h-24 w-full">
                      <Image
                        src={cat.imageUrl}
                        alt={`${cat.title} 작업 사진`}
                        fill
                        sizes="(min-width: 640px) 220px, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : FallbackIcon ? (
                    <div className="flex h-24 w-full items-center justify-center bg-white">
                      <FallbackIcon className="h-9 w-9 text-brand-navy" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="text-lg font-bold text-brand-navy">{cat.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{cat.representativeWork}</p>
                    {cat.priceRangeText && (
                      <p className="mt-1 text-sm font-bold text-brand-navy">{cat.priceRangeText}</p>
                    )}
                    <p className="mt-1 text-sm font-medium text-brand-teal-dark">자재비 별도</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">{REPAIR_OTHER_CTA.description}</p>
            <Link
              href="/estimate"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy px-6 font-semibold text-brand-navy hover:bg-brand-cream"
            >
              {REPAIR_OTHER_CTA.title}
            </Link>
          </div>
        </div>
      </section>

      {/* ④ 주거 케어 패키지 (가격/방문/추천 대상만) */}
      <section className="border-t border-black/5 bg-brand-navy/[0.03]">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">주거 케어 패키지</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-brand-cream text-brand-navy">
                  <th className="px-4 py-3 font-bold">패키지</th>
                  <th className="px-4 py-3 font-bold">가격</th>
                  <th className="px-4 py-3 font-bold">방문</th>
                  <th className="px-4 py-3 font-bold">추천 대상</th>
                </tr>
              </thead>
              <tbody>
                {site.tenantCarePackages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{pkg.name}</td>
                    <td className="px-4 py-3 font-bold text-brand-navy">{won(pkg.priceWon)}원</td>
                    <td className="px-4 py-3 text-slate-600">{CARE_VISIT_LABEL[pkg.id] ?? pkg.visitNote}</td>
                    <td className="px-4 py-3 text-slate-600">{pkg.targetNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            공개 가격은 VAT 포함이며 자재비와 출장비는 별도입니다. 최종 작업 범위는 사진상담과 견적서에서 확정됩니다.
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/tenant-care"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              {TENANT_CARE.title} 자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ⑤ 스마트홈 생활 시나리오 (4개, 선택형) */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">{SMART_HOME.subtitle}</h2>
          <div className="mt-5">
            <SmartHomeScenarioPicker />
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/smart-home"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              스마트홈 구성 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ⑥ 진행 과정과 신뢰 기준 (통합) */}
      <section className="border-t border-black/5 bg-brand-cream">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">진행 과정</h2>
              <ol className="mt-3 flex flex-col gap-2">
                {CONSULT_PROCESS_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-2 text-base text-slate-700">
                    <span className="font-bold text-brand-teal-dark">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">신뢰 기준</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {TRUST_CRITERIA.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-base text-slate-700">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal-dark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ FAQ (6개만, 나머지는 이용안내로) */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-[680px] px-4 py-12">
          <h2 className="text-[26px] font-bold text-brand-navy sm:text-[32px]">자주 묻는 질문</h2>
          <div className="mt-5 flex flex-col gap-3">
            {MAIN_FAQ.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-base font-semibold text-brand-navy">
                  {item.q}
                </summary>
                <p className="mt-2 text-base leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link href="/guide#faq" className="text-sm font-semibold text-brand-teal-dark hover:underline">
              전체 FAQ 더 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ⑧ 마지막 상담 (전화·카카오는 우측 고정 버튼에 있으므로 반복하지 않음) */}
      <section className="border-t border-black/5 bg-brand-navy">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <h2 className="text-[26px] font-bold text-white sm:text-[32px]">고칠 곳을 사진으로 알려주세요.</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-200">
            전체 모습, 문제 부위, 제품 정보가 보이는
            <br />
            사진 3장을 보내주시면 작업 가능 범위와
            <br />
            사전예상액을 안내해드립니다.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/estimate"
              className="flex min-h-11 w-full max-w-xs items-center justify-center rounded-lg bg-white px-6 text-center font-semibold text-brand-navy hover:bg-slate-100"
            >
              사진 상담 시작
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
