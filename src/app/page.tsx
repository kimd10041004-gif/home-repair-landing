import Image from "next/image";
import Link from "next/link";
import { BRAND, SERVICE_CATEGORIES } from "@/lib/constants";

const TRUST_POINTS = [
  "사진 기준 예상 견적",
  "작업 전 사전예상액 안내",
  "동의 없는 추가 작업 없음",
  "작업 전후 사진·내역 제공",
  "전화 상담 즉시 가능",
];

const WORK_PHOTOS = [
  { src: "/brand/kitchen-faucet.png", alt: "주방 수전 작업 현장" },
  { src: "/brand/entryway-doorlock.png", alt: "도어락 작업 현장" },
  { src: "/brand/window-screen.png", alt: "방충망 작업 현장" },
  { src: "/brand/outlet-switch.png", alt: "콘센트·전등 작업 현장" },
  { src: "/brand/kitchen-faucet-2.png", alt: "주방 수전 작업 현장 2" },
  { src: "/brand/doorlock-2.png", alt: "도어락 클로즈업 작업 현장" },
  { src: "/brand/switch-outlet-2.png", alt: "스위치·콘센트 클로즈업 작업 현장" },
  { src: "/brand/livingroom-paint.png", alt: "거실 벽면 도장 작업 현장" },
];

const FEATURED_SERVICES = SERVICE_CATEGORIES.filter((s) => s.imageSrc).slice(0, 4);

export default function HomePage() {
  return (
    <div>
      <section className="bg-brand-cream">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-brand-teal">
              {BRAND.tagline}, {BRAND.name}
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-snug text-brand-navy sm:text-3xl">
              사진으로 먼저 확인하고,
              <br />
              작업 전 금액을 사전예상으로 안내합니다.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              고장 부위 사진을 최소 3장 보내주시면 작업 환경과 예상 범위를 먼저
              확인해 안내드립니다. 현장에서는 작업을 시작하기 전에 사전예상액을
              안내하며, 고객님의 동의 없이 추가 작업을 진행하지 않습니다.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-700">
              {BRAND.serviceArea}
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/estimate"
                className="w-full rounded-lg bg-brand-navy px-6 py-3 text-center font-semibold text-white hover:bg-brand-navy-dark sm:w-auto"
              >
                사진 견적 신청하기
              </Link>
              <Link
                href="/services"
                className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                서비스와 가격 보기
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-2 text-left text-sm text-slate-700 sm:grid-cols-2">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                  <span className="text-brand-teal">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md lg:block">
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

      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-lg font-bold text-brand-navy">
            반듯집수리는 이런 곳입니다
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-brand-cream p-4 shadow-sm">
              <p className="font-semibold text-brand-navy">예약형 방문 서비스</p>
              <p className="mt-1 text-sm text-slate-600">
                미리 사진과 정보를 남겨주시면 방문 전에 준비된 상태로 찾아갑니다.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-brand-cream p-4 shadow-sm">
              <p className="font-semibold text-brand-navy">사전예상액 안내</p>
              <p className="mt-1 text-sm text-slate-600">
                사진 기준으로 예상 금액을 먼저 안내해드리고, 현장에서 안내드린 금액에 동의 후 작업합니다.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-brand-cream p-4 shadow-sm">
              <p className="font-semibold text-brand-navy">기록으로 남는 작업</p>
              <p className="mt-1 text-sm text-slate-600">
                작업 전후 사진과 내역을 제공해 어떤 작업이 이루어졌는지 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WORK_PHOTOS.map((photo) => (
              <div
                key={photo.src}
                className="relative aspect-square w-full overflow-hidden rounded-lg shadow-sm"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-brand-cream">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold text-brand-navy">대표 서비스</h2>
            <Link href="/services" className="text-sm font-semibold text-brand-teal hover:underline">
              서비스 전체 보기 →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURED_SERVICES.map((service) => (
              <div
                key={service.id}
                className="flex flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={service.imageSrc as string}
                    alt={`${service.title} 작업 사진`}
                    fill
                    sizes="(min-width: 640px) 320px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-brand-navy">{service.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <h2 className="text-lg font-bold text-brand-navy">작업내용 소개</h2>
          <p className="mt-2 text-sm text-slate-600">
            반듯집수리가 다루는 작업들을 한눈에 확인해보세요.
          </p>
          <div className="relative mx-auto mt-6 aspect-square w-full max-w-xs overflow-hidden rounded-2xl shadow-md">
            <Image
              src="/brand/promo-card-services.png"
              alt="반듯집수리 작업내용 소개 - 수전, 배수구, 문고리/도어락, 전등/콘센트, 방충망"
              fill
              sizes="(min-width: 640px) 320px, 100vw"
              className="object-cover"
            />
          </div>
          <Link
            href="/reviews"
            className="mt-6 inline-block rounded-lg bg-brand-navy px-6 py-3 text-center font-semibold text-white hover:bg-brand-navy-dark"
          >
            실제 작업 사례 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
