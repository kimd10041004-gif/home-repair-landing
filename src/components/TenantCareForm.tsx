"use client";

import { useState } from "react";
import {
  TENANT_CARE,
  TENANT_CARE_CONSENTS,
  TENANT_CARE_PACKAGES,
  TENANT_CARE_RESIDENCE_TYPES,
  TENANT_CARE_WORK_ITEMS,
} from "@/lib/constants";

/**
 * 세입자·주거 케어 전용 상담 신청 폼.
 * - 상세 주소는 최초 상담 단계에서 받지 않고 "시·구·동" 수준의 작업 지역만 입력받는다.
 * - 동의 체크박스는 전부 기본 미선택 상태이며, 선택 동의를 거부해도 제출에는 영향이 없다.
 * - 민감정보(주민등록번호, 생년월일 등)는 입력받지 않는다.
 */
export default function TenantCareForm({
  packages = TENANT_CARE_PACKAGES,
}: {
  /** 관리자 화면에서 편집한 패키지 이름을 반영하기 위한 선택적 prop(없으면 기본값 사용) */
  packages?: { id: string; name: string }[];
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [region, setRegion] = useState("");
  const [residenceType, setResidenceType] = useState<string>(
    TENANT_CARE_RESIDENCE_TYPES[0]
  );
  const [packageId, setPackageId] = useState(packages[0].id);
  const [workItems, setWorkItems] = useState<string[]>([]);
  const [workQuantities, setWorkQuantities] = useState("");
  const [hasOwnMaterial, setHasOwnMaterial] = useState<"yes" | "no">("no");
  const [schedule1, setSchedule1] = useState("");
  const [schedule2, setSchedule2] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [extraNote, setExtraNote] = useState("");
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleWorkItem(item: string) {
    setWorkItems((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  }

  const requiredConsents = TENANT_CARE_CONSENTS.filter((c) => c.required);
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

      const res = await fetch("/api/tenant-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          region,
          residenceType,
          packageId,
          workItems,
          workQuantities,
          hasOwnMaterial: hasOwnMaterial === "yes",
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
          {TENANT_CARE.submittedNotice1}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {TENANT_CARE.submittedNotice2}
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
            autoComplete="name"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">연락처 *</span>
          <input
            type="tel"
            className="rounded-md border border-slate-300 px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
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
            autoComplete="address-level2"
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
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">
          필요한 작업 종류 (복수 선택 가능)
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TENANT_CARE_WORK_ITEMS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={workItems.includes(item)}
                onChange={() => toggleWorkItem(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">작업별 예상 수량</span>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          value={workQuantities}
          onChange={(e) => setWorkQuantities(e.target.value)}
          placeholder="예: 전등 2개, 블라인드 3개"
        />
      </label>

      <fieldset className="rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">
          고객 자재 준비 여부
        </legend>
        <div className="mt-2 flex gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasOwnMaterial"
              checked={hasOwnMaterial === "no"}
              onChange={() => setHasOwnMaterial("no")}
            />
            반듯집수리가 준비
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasOwnMaterial"
              checked={hasOwnMaterial === "yes"}
              onChange={() => setHasOwnMaterial("yes")}
            />
            직접 준비
          </label>
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
          {TENANT_CARE_CONSENTS.filter((c) => c.required).map((c) => (
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
          {TENANT_CARE_CONSENTS.filter((c) => !c.required).map((c) => (
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
