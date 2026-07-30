"use client";

import { useState } from "react";
import {
  SMART_HOME_SCENARIOS,
  SMART_HOME_SCENARIO_FOOTNOTE,
  type SmartHomeScenario,
  type SmartHomeScenarioIconId,
} from "@/lib/constants";
import {
  IconDoorExit,
  IconMoon,
  IconDropletAlert,
  IconFamilyCheck,
} from "@/components/icons";

const ICON_MAP: Record<SmartHomeScenarioIconId, (props: { className?: string }) => React.ReactElement> = {
  "door-exit": IconDoorExit,
  moon: IconMoon,
  "droplet-alert": IconDropletAlert,
  "family-check": IconFamilyCheck,
};

/**
 * 메인페이지 "⑤ 스마트홈 생활 시나리오"(최종 개편안 3-⑤) 선택형 카드.
 * - 이모지 대신 선형 아이콘 + 휴대전화 알림 화면 형태의 정적 결과를 보여준다.
 * - 카드를 선택하면 실시간 견적 계산이 아니라 미리 정해둔 정적 문구(resultFeatures/
 *   resultRecommendation)를 그대로 표시한다. 영상 없이도 스마트홈을 직접 골라보는
 *   경험을 제공하려는 목적이다.
 */
export default function SmartHomeScenarioPicker() {
  const [selectedId, setSelectedId] = useState<string>(SMART_HOME_SCENARIOS[0].id);
  const selected: SmartHomeScenario =
    SMART_HOME_SCENARIOS.find((s) => s.id === selectedId) ?? SMART_HOME_SCENARIOS[0];
  const SelectedIcon = ICON_MAP[selected.iconId];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="스마트홈 생활 시나리오 선택">
        {SMART_HOME_SCENARIOS.map((s) => {
          const Icon = ICON_MAP[s.iconId];
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(s.id)}
              className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                isSelected
                  ? "border-brand-teal bg-brand-cream"
                  : "border-slate-200 bg-white hover:border-brand-teal/60"
              }`}
            >
              <Icon className="h-7 w-7 text-brand-navy" />
              <p className="mt-2 text-sm font-bold text-brand-navy">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
            </button>
          );
        })}
      </div>

      {/* 선택 결과: 휴대전화 알림 화면 형태의 정적 미리보기 */}
      <div className="mt-6 flex justify-center">
        <div
          aria-live="polite"
          className="w-full max-w-xs rounded-[28px] border border-slate-300 bg-white p-3"
        >
          <div className="flex items-center justify-between px-1 text-sm text-slate-400">
            <span>반듯홈 알림</span>
            <span>지금</span>
          </div>
          <div className="mt-2 flex items-start gap-3 rounded-2xl bg-brand-cream p-3">
            <SelectedIcon className="mt-0.5 h-6 w-6 shrink-0 text-brand-navy" />
            <div>
              <p className="text-sm font-bold text-brand-navy">{selected.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                선택한 기능 · {selected.resultFeatures}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-brand-teal-dark">
            상담 추천 · {selected.resultRecommendation}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-500">{SMART_HOME_SCENARIO_FOOTNOTE}</p>
    </div>
  );
}
