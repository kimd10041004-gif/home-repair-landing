const STEPS = [
  {
    title: "1. 사진 견적 신청",
    desc: "고장 부위 사진 최소 3장과 필요한 정보를 챗봇으로 남겨주시면, 방문 전에 작업 범위와 예상 비용을 먼저 확인해드립니다.",
  },
  {
    title: "2. 방문 및 현장 확인",
    desc: "예약된 일정에 방문하여 현장 상태를 확인합니다. 사전에 안내드린 예상 범위와 실제 현장이 다를 경우, 그 자리에서 다시 설명드립니다.",
  },
  {
    title: "3. 최종 금액 사전 동의",
    desc: "작업을 시작하기 전에 최종 금액을 먼저 안내하고, 고객님의 동의를 받은 뒤에만 작업을 진행합니다. 동의 없는 추가 작업은 절대 진행하지 않습니다.",
  },
  {
    title: "4. 작업 진행 및 사진 기록",
    desc: "작업 전/중/후 사진을 촬영하여 어떤 상태에서 어떤 작업이 이루어졌는지 기록으로 남겨드립니다.",
  },
  {
    title: "5. 작업 완료 및 내역 안내",
    desc: "작업이 끝나면 최종 내역과 사진을 다시 한 번 안내해드리고 마무리합니다.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        이용 안내
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        반듯집수리는 아래와 같은 방식으로 작업을 진행합니다.
      </p>

      <ol className="mt-6 flex flex-col gap-6">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-lg border border-slate-200 p-4">
            <h2 className="font-bold text-slate-900">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg bg-blue-50 p-5">
        <h2 className="font-bold text-blue-900">신뢰 포인트</h2>
        <p className="mt-2 text-sm leading-relaxed text-blue-800">
          작업 시작 전 최종 금액을 고객 동의 하에 확정하며, 동의 없는 추가
          작업은 진행하지 않습니다. 작업 전/중/후 사진을 제공하여 어떤 작업이
          어떻게 이루어졌는지 투명하게 확인하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
