"use client";

import { useRef, useState } from "react";

type ChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
};

type StepId =
  | "photos"
  | "contact"
  | "address"
  | "symptom"
  | "material"
  | "schedule"
  | "extra"
  | "consent"
  | "done";

const MIN_PHOTOS = 3;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function EstimateChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      from: "bot",
      text:
        "안녕하세요! 반듯집수리 사진 견적 챗봇입니다. 😊\n" +
        "몇 가지 질문에 답해주시면 예상 비용과 방문 일정을 안내해드릴게요.\n\n" +
        "먼저, 고장/교체가 필요한 부위 사진을 최소 3장 올려주세요.\n" +
        "· 전체 사진 (전체적인 상태가 보이도록)\n" +
        "· 근접 사진 (문제 부위를 가까이서)\n" +
        "· 연결부·모델명 사진 (제품명, 규격 라벨 등)\n\n" +
        "방충망·문·타일처럼 규격이 중요한 작업은 줄자로 가로/세로를 잰 측정 사진도 함께 보내주세요.",
    },
  ]);
  const [step, setStep] = useState<StepId>("photos");
  const [textInput, setTextInput] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const answers = useRef({
    contact: "",
    address: "",
    symptom: "",
    material: "",
    schedule: "",
    extra: "",
  });

  function pushBot(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: "user", text }]);
  }

  function handlePhotoSelect(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotos((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function confirmPhotos() {
    if (photos.length < MIN_PHOTOS) return;
    pushUser(`사진 ${photos.length}장을 첨부했습니다.`);
    pushBot("사진 확인했습니다! 연락받으실 연락처를 입력해주세요. (휴대폰 번호)");
    setStep("contact");
  }

  function submitTextStep() {
    const value = textInput.trim();
    if (!value) return;

    if (step === "contact") {
      answers.current.contact = value;
      pushUser(value);
      pushBot("방문이 필요한 주소(또는 지역)를 입력해주세요.");
      setStep("address");
    } else if (step === "address") {
      answers.current.address = value;
      pushUser(value);
      pushBot(
        "어떤 문제가 있으신가요? 증상이나 원하시는 작업을 자유롭게 적어주세요.\n" +
          "(예: 주방 수전에서 물이 새요, 방충망이 찢어져서 교체하고 싶어요)"
      );
      setStep("symptom");
    } else if (step === "symptom") {
      answers.current.symptom = value;
      pushUser(value);
      pushBot(
        "혹시 본인이 직접 구매해두신 자재(수전, 문고리, 방충망 등)가 있으신가요? 있다면 어떤 제품인지 알려주세요. 없으면 '없음'이라고 적어주세요."
      );
      setStep("material");
    } else if (step === "material") {
      answers.current.material = value;
      pushUser(value);
      pushBot("희망하시는 방문 일정을 알려주세요. (예: 이번 주 토요일 오전)");
      setStep("schedule");
    } else if (step === "schedule") {
      answers.current.schedule = value;
      pushUser(value);
      pushBot(
        "혹시 이번 방문에 함께 점검받고 싶은 다른 수리 항목이 있으신가요? 없으면 '없음'이라고 적어주세요."
      );
      setStep("extra");
    } else if (step === "extra") {
      answers.current.extra = value;
      pushUser(value);
      pushBot(
        "마지막으로 개인정보 수집·이용 동의가 필요합니다. 아래 동의 체크 후 제출해주세요."
      );
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
      const photoUrls: string[] = [];
      for (const file of photos) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("사진 업로드에 실패했습니다.");
        const data = await res.json();
        photoUrls.push(data.url);
      }
      setUploading(false);

      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrls,
          contact: answers.current.contact,
          address: answers.current.address,
          symptom: answers.current.symptom,
          hasOwnMaterial: answers.current.material,
          preferredSchedule: answers.current.schedule,
          extraItems: answers.current.extra,
          consent: consentChecked,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "제출에 실패했습니다.");
      }

      pushUser("개인정보 수집·이용에 동의합니다.");
      pushBot(
        "문의가 정상적으로 접수되었습니다! 확인 후 빠르게 연락드리겠습니다. 감사합니다. 🙇"
      );
      setStep("done");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  const isTextStep = ["contact", "address", "symptom", "material", "schedule", "extra"].includes(
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
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-4">
        {step === "photos" && (
          <div className="flex flex-col gap-3">
            <label className="w-fit cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              사진 선택하기
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoSelect(e.target.files)}
              />
            </label>
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={src} className="relative h-20 w-20 overflow-hidden rounded-md border border-slate-200">
                    <img src={src} alt={`업로드 사진 ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500">
              {photos.length}/{MIN_PHOTOS}장 (최소 {MIN_PHOTOS}장 필요)
            </p>
            <button
              type="button"
              disabled={photos.length < MIN_PHOTOS}
              onClick={confirmPhotos}
              className="w-fit rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              전송
            </button>
          </form>
        )}

        {step === "consent" && (
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              <span>
                견적 상담 및 방문 예약을 위해 연락처, 주소 등 개인정보를 수집·이용하는 것에 동의합니다.
                수집된 정보는 상담 및 작업 진행 목적 외에는 사용되지 않습니다.
              </span>
            </label>
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <button
              type="button"
              disabled={!consentChecked || submitting}
              onClick={handleSubmit}
              className="w-fit rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {uploading ? "사진 업로드 중..." : submitting ? "제출 중..." : "문의 제출하기"}
            </button>
          </div>
        )}

        {step === "done" && submitted && (
          <p className="text-sm font-medium text-green-700">
            접수가 완료되었습니다. 감사합니다!
          </p>
        )}
      </div>
    </div>
  );
}
