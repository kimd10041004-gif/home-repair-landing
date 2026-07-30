"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  BRAND,
  BUNDLE_ITEMS,
  BUNDLE_NONE_OPTION,
  DEPOSIT_NOTICE_TEXT,
  ESTIMATE_DISCLAIMER_TEXT,
  PHOTO_SLOTS_BY_CATEGORY,
  PHOTO_VALIDATION_ERROR_BY_CATEGORY,
  PRIVACY_CONSENT_TEXT,
  WORK_CATEGORIES,
  WORK_TYPES_BY_CATEGORY,
  WORKSPACE_OPTIONS,
  type WorkCategoryId,
} from "@/lib/constants";

type ChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
};

type ServiceBranch = "repair" | "tenant-care" | "smart-home";

const SERVICE_BRANCH_OPTIONS: { id: ServiceBranch; label: string; description: string }[] = [
  { id: "repair", label: "생활 집수리", description: "수전·문고리·조명 등 개별 작업" },
  { id: "tenant-care", label: "세입자·주거 케어", description: "여러 작업을 묶은 패키지" },
  { id: "smart-home", label: "스마트홈 IoT 케어", description: "장비 설치·자동화 연결" },
];

type StepId =
  | "service"
  | "redirect"
  | "workspace"
  | "category"
  | "workType"
  | "symptom"
  | "photos"
  | "material"
  | "schedule"
  | "bundle"
  | "name"
  | "contact"
  | "address"
  | "consent"
  | "done";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function EstimateChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      from: "bot",
      text:
        "안녕하세요! 반듯집수리 사진 상담 신청서입니다. 😊\n" +
        "먼저, 어떤 서비스가 필요하신지 선택해주세요.",
    },
  ]);
  const [step, setStep] = useState<StepId>("service");
  const [redirectTo, setRedirectTo] = useState<{ href: string; label: string } | null>(null);
  const [textInput, setTextInput] = useState("");


  const [category, setCategory] = useState<WorkCategoryId | null>(null);
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string[]>>({});
  const [bundleSelected, setBundleSelected] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const answers = useRef({
    workspace: "",
    category: "" as WorkCategoryId | "",
    workType: "",
    symptom: "",
    material: "",
    schedule: "",
    name: "",
    contact: "",
    address: "",
  });

  function pushBot(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: "user", text }]);
  }

  function selectService(id: ServiceBranch, label: string) {
    pushUser(label);
    if (id === "repair") {
      pushBot(
        "생활 집수리는 이 사진 상담에서 바로 진행할 수 있어요. 먼저, 작업이 필요한 공간을 선택해주세요."
      );
      setStep("workspace");
      return;
    }
    if (id === "tenant-care") {
      pushBot(
        "세입자·주거 케어는 여러 작업을 한 번에 계획하는 패키지 서비스로, 전용 페이지에서 패키지 선택과 상담 신청을 진행합니다."
      );
      setRedirectTo({ href: "/tenant-care#tenant-care-form", label: "세입자·주거 케어 상담 신청으로 이동" });
      setStep("redirect");
      return;
    }
    pushBot(
      "스마트홈 IoT 케어는 장비·자동화 구성을 확인하는 전용 페이지에서 상담 신청을 진행합니다."
    );
    setRedirectTo({ href: "/smart-home#smart-home-form", label: "스마트홈 IoT 케어 상담 신청으로 이동" });
    setStep("redirect");
  }

  function selectWorkspace(value: string) {
    answers.current.workspace = value;
    pushUser(value);
    pushBot(
      "어떤 종류의 작업인가요? 사진 기준으로 필요한 촬영 방법이 다르니 아래 두 가지 중에서 골라주세요."
    );
    setStep("category");
  }

  function selectCategory(id: WorkCategoryId, label: string) {
    setCategory(id);
    answers.current.category = id;
    pushUser(label);
    pushBot("세부 작업 종류를 선택해주세요.");
    setStep("workType");
  }

  function selectWorkType(value: string) {
    answers.current.workType = value;
    pushUser(value);
    pushBot(
      "어떤 문제가 있으신가요? 증상이나 원하시는 작업을 자유롭게 적어주세요.\n" +
        "(예: 주방 수전에서 물이 새요, 방충망이 찢어져서 교체하고 싶어요)"
    );
    setStep("symptom");
  }

  function handlePhotoSelect(slotId: string, files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotos((prev) => ({ ...prev, [slotId]: [...(prev[slotId] ?? []), ...newFiles] }));
    setPhotoPreviews((prev) => ({
      ...prev,
      [slotId]: [...(prev[slotId] ?? []), ...newFiles.map((f) => URL.createObjectURL(f))],
    }));
  }

  function removePhoto(slotId: string, index: number) {
    setPhotos((prev) => ({
      ...prev,
      [slotId]: (prev[slotId] ?? []).filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => ({
      ...prev,
      [slotId]: (prev[slotId] ?? []).filter((_, i) => i !== index),
    }));
  }

  const currentPhotoSlots = category ? PHOTO_SLOTS_BY_CATEGORY[category] : [];
  const requiredSlotsFilled = currentPhotoSlots
    .filter((s) => s.required)
    .every((s) => (photos[s.id]?.length ?? 0) > 0);

  function confirmPhotos() {
    if (!requiredSlotsFilled) return;
    const total = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0);
    pushUser(`사진 ${total}장을 첨부했습니다.`);
    pushBot(
      "직접 구매해두신 자재(수전, 문고리, 방충망 등)가 있으신가요? 있다면 어떤 제품인지 알려주세요. 없으면 '없음'이라고 적어주세요."
    );
    setStep("material");
  }

  function toggleBundleItem(item: string) {
    setBundleSelected((prev) => {
      if (item === BUNDLE_NONE_OPTION) {
        return prev.includes(item) ? [] : [BUNDLE_NONE_OPTION];
      }
      const withoutNone = prev.filter((v) => v !== BUNDLE_NONE_OPTION);
      return withoutNone.includes(item)
        ? withoutNone.filter((v) => v !== item)
        : [...withoutNone, item];
    });
  }

  function confirmBundle() {
    pushUser(bundleSelected.length > 0 ? bundleSelected.join(", ") : "선택 안 함");
    pushBot("이름을 입력해주세요.");
    setStep("name");
  }

  function submitTextStep() {
    const value = textInput.trim();
    if (!value) return;

    if (step === "symptom") {
      answers.current.symptom = value;
      pushUser(value);
      const slots = category ? PHOTO_SLOTS_BY_CATEGORY[category] : [];
      const requiredLabels = slots.filter((s) => s.required).map((s) => `· ${s.label}`).join("\n");
      pushBot(
        `사진을 첨부해주세요. 아래 항목은 필수이며, 미등록 시 제출이 제한됩니다.\n${requiredLabels}`
      );
      setStep("photos");
    } else if (step === "material") {
      answers.current.material = value;
      pushUser(value);
      pushBot("희망하시는 방문 일정을 알려주세요. (예: 이번 주 토요일 오전)");
      setStep("schedule");
    } else if (step === "schedule") {
      answers.current.schedule = value;
      pushUser(value);
      pushBot("방문 시 함께 점검받고 싶은 부분이 있나요? 해당하는 항목을 모두 선택해주세요.");
      setStep("bundle");
    } else if (step === "name") {
      answers.current.name = value;
      pushUser(value);
      pushBot("연락받으실 연락처를 입력해주세요. (휴대폰 번호)");
      setStep("contact");
    } else if (step === "contact") {
      answers.current.contact = value;
      pushUser(value);
      pushBot("방문이 필요한 지역(주소)을 입력해주세요.");
      setStep("address");
    } else if (step === "address") {
      answers.current.address = value;
      pushUser(value);
      pushBot("마지막으로 개인정보 수집·이용 동의가 필요합니다. 아래 내용을 확인 후 동의해주세요.");
      setStep("consent");
    }
    setTextInput("");
  }

  async function handleSubmit() {
    if (!consentChecked) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setUploading(true);
      const slotEntries = Object.entries(photos);
      const photoUrls: string[] = [];
      for (const [, files] of slotEntries) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) throw new Error("사진 업로드에 실패했습니다.");
          const data = await res.json();
          photoUrls.push(data.url);
        }
      }
      setUploading(false);

      const materialText = answers.current.material.trim();
      const hasOwnMaterial = !/^(없음|없어요|아니오|아니요|no|x)$/i.test(materialText);
      // API는 hasOwnMaterial을 boolean만 받으므로, 보유 자재의 상세 내용(제품명 등)은
      // 유실되지 않도록 증상(symptom) 필드에 덧붙여 함께 전달한다.
      const symptomWithMaterial = hasOwnMaterial
        ? `${answers.current.symptom}\n(보유 자재: ${materialText})`
        : answers.current.symptom;

      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: answers.current.name,
          photoUrls,
          contact: answers.current.contact,
          address: answers.current.address,
          workspace: answers.current.workspace,
          category: answers.current.category,
          workType: answers.current.workType,
          symptom: symptomWithMaterial,
          hasOwnMaterial,
          preferredSchedule: answers.current.schedule,
          bundleItems: bundleSelected,
          consent: consentChecked,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "제출에 실패했습니다.");
      }

      pushUser("개인정보 수집·이용에 동의합니다.");
      pushBot(ESTIMATE_DISCLAIMER_TEXT);
      pushBot(DEPOSIT_NOTICE_TEXT);
      setStep("done");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  const isTextStep = ["symptom", "material", "schedule", "name", "contact", "address"].includes(
    step
  );

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.from === "user"
                  ? "bg-brand-navy text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-4">
        {step === "service" && (
          <div className="flex flex-col gap-2">
            {SERVICE_BRANCH_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectService(opt.id, opt.label)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-semibold text-brand-navy">{opt.label}</span>
                <span className="ml-2 text-xs text-slate-500">{opt.description}</span>
              </button>
            ))}
          </div>
        )}

        {step === "redirect" && redirectTo && (
          <Link
            href={redirectTo.href}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
          >
            {redirectTo.label} →
          </Link>
        )}

        {step === "workspace" && (
          <div className="flex flex-wrap gap-2">
            {WORKSPACE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => selectWorkspace(opt)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step === "category" && (
          <div className="flex flex-col gap-2">
            {WORK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCategory(c.id, c.label)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-semibold text-brand-navy">{c.label}</span>
                <span className="ml-2 text-xs text-slate-500">{c.examples}</span>
              </button>
            ))}
          </div>
        )}

        {step === "workType" && category && (
          <div className="flex flex-wrap gap-2">
            {WORK_TYPES_BY_CATEGORY[category].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => selectWorkType(opt)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step === "photos" && category && (
          <div className="flex flex-col gap-4">
            {currentPhotoSlots.map((slot) => (
              <div key={slot.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    {slot.label}
                    {slot.required && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <span className="text-xs text-slate-400">
                    {(photos[slot.id]?.length ?? 0)}장
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{slot.hint}</p>
                {(slot.goodExample || slot.badExample) && (
                  <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-500">
                    {slot.goodExample && <p>✅ 올바른 예시: {slot.goodExample}</p>}
                    {slot.badExample && <p>❌ 잘못된 예시: {slot.badExample}</p>}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(photoPreviews[slot.id] ?? []).map((src, i) => (
                    <div key={src} className="relative h-16 w-16 overflow-hidden rounded-md border border-slate-200">
                      <img src={src} alt={`${slot.label} ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(slot.id, i)}
                        className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50">
                    +추가
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotoSelect(slot.id, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={!requiredSlotsFilled}
              onClick={confirmPhotos}
              className="w-fit rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              다음 단계로
            </button>
            {!requiredSlotsFilled && category && (
              <p className="text-xs text-red-600">
                {PHOTO_VALIDATION_ERROR_BY_CATEGORY[category]}
              </p>
            )}
          </div>
        )}

        {step === "bundle" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {BUNDLE_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleBundleItem(item)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    bundleSelected.includes(item)
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={confirmBundle}
              className="w-fit rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white"
            >
              다음 단계로
            </button>
          </div>
        )}

        {isTextStep && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitTextStep();
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="답변을 입력해주세요"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
            >
              전송
            </button>
          </form>
        )}

        {step === "consent" && (
          <div className="flex flex-col gap-3">
            <div className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {PRIVACY_CONSENT_TEXT}
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              <span>위 개인정보 수집·이용 안내에 동의합니다.</span>
            </label>
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <button
              type="button"
              disabled={!consentChecked || submitting}
              onClick={handleSubmit}
              className="flex w-fit items-center gap-2 rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {(uploading || submitting) && (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {uploading ? "사진 업로드 중..." : submitting ? "제출 중..." : "신청서 제출하기"}
            </button>
            {(uploading || submitting) && (
              <p className="text-xs text-slate-500">
                사진 용량에 따라 최대 20~30초 정도 걸릴 수 있어요. 화면을 벗어나지 말고 잠시만
                기다려 주세요.
              </p>
            )}
          </div>
        )}

        {step === "done" && submitted && (
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row">
            <a
              href={BRAND.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              추가 내용·사진 카카오톡 문의
            </a>
            <a
              href={`tel:${BRAND.phone}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              전화로 추가 문의
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
