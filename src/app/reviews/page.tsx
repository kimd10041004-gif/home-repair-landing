import { REVIEWS } from "@/lib/constants";

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        작업내용 소개
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        실제로 진행한 작업 내용과 고객님이 남겨주신 후기를 소개합니다.
      </p>

      <div className="mt-6 flex flex-col gap-10">
        {REVIEWS.map((review) => (
          <article
            key={review.id}
            className="border-b border-slate-200 pb-10 last:border-b-0"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                {review.region}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {review.workType}
              </span>
            </div>

            <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
              작업 사진
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
