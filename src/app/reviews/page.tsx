import Image from "next/image";
import { REVIEWS } from "@/lib/constants";
import AiExampleBadge from "@/components/AiExampleBadge";

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">
        작업내용 소개
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        실제로 진행한 작업 내용과 고객님이 남겨주신 후기를 소개합니다.
      </p>

      <div className="relative mx-auto mt-6 aspect-[16/9] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
        <Image
          src="/brand/promo-card-services-2.png"
          alt="반듯집수리 작업내용 소개 카드"
          fill
          sizes="(min-width: 640px) 512px, 100vw"
          className="object-contain"
        />
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {REVIEWS.map((review) => (
          <article
            key={review.id}
            className="border-b border-slate-200 pb-10 last:border-b-0"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-brand-cream px-3 py-1 font-medium text-brand-teal">
                {review.region}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {review.workType}
              </span>
            </div>

            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg shadow-sm">
              <Image
                src={review.photoUrl}
                alt={`${review.workType} 작업 사진`}
                fill
                sizes="(min-width: 640px) 640px, 100vw"
                className="object-cover"
              />
              <AiExampleBadge />
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
              {review.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
