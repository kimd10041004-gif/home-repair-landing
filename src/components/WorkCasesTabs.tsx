"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  WORK_CASES,
  WORK_CASE_CATEGORY_LABELS,
  type WorkCaseCategory,
} from "@/lib/constants";
import AiExampleBadge from "@/components/AiExampleBadge";

const CATEGORY_ORDER: WorkCaseCategory[] = ["repair", "tenant-care", "smart-home"];

export default function WorkCasesTabs() {
  // 데이터가 있는 탭만 보여준다.
  const availableTabs = useMemo(
    () => CATEGORY_ORDER.filter((cat) => WORK_CASES.some((c) => c.category === cat)),
    []
  );
  const [active, setActive] = useState<WorkCaseCategory>(availableTabs[0]);

  const cases = WORK_CASES.filter((c) => c.category === active);

  if (availableTabs.length === 0) {
    return (
      <p className="mt-10 text-sm text-slate-500">
        아직 등록된 작업 사례가 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {availableTabs.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold ${
              active === cat
                ? "border-b-2 border-brand-teal text-brand-teal"
                : "text-slate-500 hover:text-brand-navy"
            }`}
          >
            {WORK_CASE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {cases.map((item) => (
          <article
            key={item.id}
            className="border-b border-slate-200 pb-10 last:border-b-0"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-brand-cream px-3 py-1 font-medium text-brand-teal">
                {item.region}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {item.workType}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-medium ${
                  item.isRealCase
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.isRealCase ? "실제 작업 사례" : item.caseTypeLabel}
              </span>
            </div>

            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg shadow-sm">
              <Image
                src={item.photoUrl}
                alt={`${item.workType} 작업 사진`}
                fill
                sizes="(min-width: 640px) 640px, 100vw"
                className="object-cover"
              />
              {!item.isRealCase && <AiExampleBadge />}
            </div>

            <dl className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              <div>
                <dt className="inline font-semibold text-brand-navy">해결한 문제: </dt>
                <dd className="inline">{item.problemSolved}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-brand-navy">작업 범위: </dt>
                <dd className="inline">{item.scope}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-brand-navy">사용 제품·자재: </dt>
                <dd className="inline">{item.materials}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-brand-navy">현장별 차이: </dt>
                <dd className="inline">{item.siteDifference}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
