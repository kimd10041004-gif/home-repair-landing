"use client";

import { useState } from "react";
import {
  SMART_HOME_CONSENTS,
  SMART_HOME_DEVICE_OPTIONS,
  SMART_HOME_PACKAGES,
  TENANT_CARE_RESIDENCE_TYPES,
} from "@/lib/constants";

/**
 * 스마트홈 IoT 케어 전용 상담 신청 폼.
 * - 상세 주소는 최초 상담 단계에서 받지 않고 "시·구·동" 수준의 작업 지역만 입력받는다.
 * - 동의 체크박스는 전부 기본 미선택 상태이며, 선택 동의를 거부해도 제출에는 영향이 없다.
 * - 민감정보(주민등록번호, 생년월일 등)는 입력받지 않는다.
 */
export default function SmartHomeForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [region, setRegion] = useState("");
  const [residenceType, setResidenceType] = useState<string>(
    TENANT_CARE_RESIDENCE_TYPES[0]
  );
  const [packageId, setPackageId] = useState(SMART_HOME_PACKAGES[0].id);
  const [devices, setDevices] = useState<string[]>([]);
  const [schedule1, setSchedule1] = useState("");
  const [schedule2, setSchedule2] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [extraNote, setExtraNote] = useState("");
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleDevice(item: string) {
    setDevices((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  }

  const requiredConsents = SMART_HOME_CONSENTS.filter((c) => c.required);
  const allRequiredChecked = requiredConsents.every((c) => consents[c.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !contact || !region || !schedule1) {
      setError("필수 항목(성함, 연락처, 작업 지역, 희망 방문일 1지망)을 입력해주세요.");
      return;
    }
    if (files.length === 0) {
      setError("현장사진을 1장 이상 첨부해주세요.");
      return;
    }
    if (!allRequiredChecked) {
      setError("필수 동의 항목에 모두 동의해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      setUploading(true);
      const photoUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("사진 업로드에 실패했습니다.");
        const data = await res.json();
        photoUrls.push(data.url);
      }
      setUploading(false);

      const res = await fetch("/api/smart-home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          region,
          residenceType,
          packageId,
          devices,
          preferredSchedule1: schedule1,
          preferredSchedule2: schedule2,
          photoUrls,
          extraNote,
          consents,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "제출에 실패했습니다.");
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다.");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-brand-teal/30 bg-brand-cream p-6 text-center">
        <p className="font-semibold text-brand-navy">
          상담 신청이 접수되었습니다. 사진과 현장 정보를 확인한 후 구성 가능한 장비와 사전예상액을
          안내해 드립니다.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          상담 신청만으로 계약이나 예약이 확정되지 않으며, 계약금 30% 결제가 완료되어야 일정이
          확정됩니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">성함 *</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">연락처 *</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="010-0000-0000"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">
            작업 지역 (시·구·동) *
          </span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="예: 고양시 일산동구 (상세 주소는 방문 견적 단계에서 안내드립니다)"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">주거 형태</span>
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={residenceType}
            onChange={(e) => setResidenceType(e.target.value)}
          >
            {TENANT_CARE_RESIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">희망 패키지</span>
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value as typeof packageId)}
          >
            {SMART_HOME_PACKAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">
          연결하고 싶은 장비 (복수 선택 가능)
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SMART_HOME_DEVICE_OPTIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={devices.includes(item)}
                onChange={() => toggleDevice(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">희망 방문일 1지망 *</span>
          <input
            type="date"
            className="rounded-md border border-slate-300 px-3 py-2"
            value={schedule1}
            onChange={(e) => setSchedule1(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">희망 방문일 2지망</span>
          <input
            type="date"
            className="rounded-md border border-slate-300 px-3 py-2"
            value={schedule2}
            onChange={(e) => setSchedule2(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">현장사진 첨부 *</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <span className="text-xs text-slate-500">{files.length}장 선택됨</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">추가 요청사항</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
        />
      </label>

      <div className="rounded-md border border-slate-200 p-4">
        <h3 className="font-semibold text-brand-navy">필수 동의</h3>
        <div className="mt-2 flex flex-col gap-2">
          {SMART_HOME_CONSENTS.filter((c) => c.required).map((c) => (
            <label key={c.id} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(consents[c.id])}
                onChange={(e) =>
                  setConsents((prev) => ({ ...prev, [c.id]: e.target.checked }))
                }
              />
              {c.label}
            </label>
          ))}
        </div>

        <h3 className="mt-4 font-semibold text-brand-navy">선택 동의</h3>
        <p className="text-xs text-slate-500">
          선택 동의는 거부하셔도 상담·견적·계약·시공·A/S 진행에 불이익이 없습니다.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {SMART_HOME_CONSENTS.filter((c) => !c.required).map((c) => (
            <label key={c.id} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(consents[c.id])}
                onChange={(e) =>
                  setConsents((prev) => ({ ...prev, [c.id]: e.target.checked }))
                }
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand-navy px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-navy-dark disabled:opacity-60"
      >
        {uploading ? "사진 업로드 중..." : submitting ? "제출 중..." : "상담 신청하기"}
      </button>
    </form>
  );
}
