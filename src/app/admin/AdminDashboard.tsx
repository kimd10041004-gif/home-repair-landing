"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  SiteData,
  RepairCategoryData,
  WorkCaseData,
  AboutPhotoData,
  FaqData,
} from "@/lib/siteData";
import PhotoUploadButton from "./PhotoUploadButton";

type Tab = "photos" | "pricing" | "copy" | "faq";

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, i) => ({ ...(item as object), order: i }) as T);
}

function withOrder<T>(list: T[]): T[] {
  return list.map((item, i) => ({ ...(item as object), order: i }) as T);
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export default function AdminDashboard({ initialData }: { initialData: SiteData }) {
  const router = useRouter();
  const [data, setData] = useState<SiteData>(initialData);
  const [tab, setTab] = useState<Tab>("photos");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function update(patch: Partial<SiteData>) {
    setData((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setSaveMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/site-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const saved = await res.json();
      if (!res.ok) {
        setSaveMessage(saved.error ?? "저장에 실패했습니다.");
        return;
      }
      setData(saved);
      setDirty(false);
      setSaveMessage("저장되었습니다. 홈페이지에 곧 반영됩니다.");
    } catch {
      setSaveMessage("네트워크 오류로 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">반듯집수리 관리자</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          로그아웃
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("photos")}
          className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold ${
            tab === "photos" ? "border-b-2 border-brand-teal-dark text-brand-teal-dark" : "text-slate-500"
          }`}
        >
          사진 관리
        </button>
        <button
          type="button"
          onClick={() => setTab("pricing")}
          className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold ${
            tab === "pricing" ? "border-b-2 border-brand-teal-dark text-brand-teal-dark" : "text-slate-500"
          }`}
        >
          서비스·가격 관리
        </button>
        <button
          type="button"
          onClick={() => setTab("copy")}
          className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold ${
            tab === "copy" ? "border-b-2 border-brand-teal-dark text-brand-teal-dark" : "text-slate-500"
          }`}
        >
          문구 관리
        </button>
        <button
          type="button"
          onClick={() => setTab("faq")}
          className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold ${
            tab === "faq" ? "border-b-2 border-brand-teal-dark text-brand-teal-dark" : "text-slate-500"
          }`}
        >
          FAQ 관리
        </button>
      </div>

      <div className="mt-6">
        {tab === "photos" ? (
          <PhotosTab data={data} update={update} />
        ) : tab === "pricing" ? (
          <PricingTab data={data} update={update} />
        ) : tab === "copy" ? (
          <CopyTab data={data} update={update} />
        ) : (
          <FaqTab data={data} update={update} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4">
          <p className="text-sm text-slate-600">
            {saveMessage ? saveMessage : dirty ? "저장되지 않은 변경사항이 있습니다." : "모든 변경사항이 저장되었습니다."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="min-h-11 shrink-0 rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 사진 관리 탭 ───────────────────────────────────────────────────────
function PhotosTab({
  data,
  update,
}: {
  data: SiteData;
  update: (patch: Partial<SiteData>) => void;
}) {
  const workCases = [...data.workCases].sort((a, b) => a.order - b.order);
  const aboutPhotos = [...data.aboutPhotos].sort((a, b) => a.order - b.order);

  function updateWorkCase(id: string, patch: Partial<WorkCaseData>) {
    update({ workCases: data.workCases.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function moveWorkCase(id: string, dir: -1 | 1) {
    const idx = workCases.findIndex((c) => c.id === id);
    update({ workCases: moveItem(workCases, idx, dir) });
  }
  function deleteWorkCase(id: string) {
    if (!confirm("이 작업 예시를 삭제할까요?")) return;
    update({ workCases: withOrder(workCases.filter((c) => c.id !== id)) });
  }
  function addWorkCase() {
    const newCase: WorkCaseData = {
      id: nextId("case"),
      category: "repair",
      workType: "새 작업 유형",
      problemSolved: "",
      scope: "",
      materials: "",
      siteDifference: "",
      isRealCase: false,
      caseTypeLabel: "자체 기능시험",
      photoUrl: "",
      order: workCases.length,
    };
    update({ workCases: [...workCases, newCase] });
  }

  function updateAboutPhoto(id: string, patch: Partial<AboutPhotoData>) {
    update({ aboutPhotos: data.aboutPhotos.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }
  function moveAboutPhoto(id: string, dir: -1 | 1) {
    const idx = aboutPhotos.findIndex((p) => p.id === id);
    update({ aboutPhotos: moveItem(aboutPhotos, idx, dir) });
  }
  function deleteAboutPhoto(id: string) {
    if (!confirm("이 사진을 삭제할까요?")) return;
    update({ aboutPhotos: withOrder(aboutPhotos.filter((p) => p.id !== id)) });
  }
  function addAboutPhoto() {
    const newPhoto: AboutPhotoData = { id: nextId("photo"), src: "", alt: "", order: aboutPhotos.length };
    update({ aboutPhotos: [...aboutPhotos, newPhoto] });
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">작업 예시 사진</h2>
          <button
            type="button"
            onClick={addWorkCase}
            className="min-h-9 rounded-lg border border-brand-navy px-3 text-sm font-semibold text-brand-navy hover:bg-brand-cream"
          >
            + 새 작업 예시
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {workCases.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-4">
                <div className="w-40 shrink-0">
                  <PhotoUploadButton
                    currentUrl={c.photoUrl || undefined}
                    onUploaded={(url) => updateWorkCase(c.id, { photoUrl: url })}
                    label="사진 선택"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <select
                      value={c.category}
                      onChange={(e) =>
                        updateWorkCase(c.id, { category: e.target.value as WorkCaseData["category"] })
                      }
                      className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                    >
                      <option value="repair">생활 집수리</option>
                      <option value="tenant-care">세입자·주거 케어</option>
                      <option value="smart-home">스마트홈 IoT</option>
                    </select>
                    <input
                      value={c.workType}
                      onChange={(e) => updateWorkCase(c.id, { workType: e.target.value })}
                      placeholder="작업 유형 (예: 수전교체)"
                      className="min-h-9 flex-1 rounded-lg border border-slate-300 px-2 text-sm"
                    />
                  </div>
                  <input
                    value={c.problemSolved}
                    onChange={(e) => updateWorkCase(c.id, { problemSolved: e.target.value })}
                    placeholder="해결한 문제"
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                  />
                  <textarea
                    value={c.scope}
                    onChange={(e) => updateWorkCase(c.id, { scope: e.target.value })}
                    placeholder="작업 범위"
                    rows={2}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={c.materials}
                    onChange={(e) => updateWorkCase(c.id, { materials: e.target.value })}
                    placeholder="사용 제품·자재"
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                  />
                  <textarea
                    value={c.siteDifference}
                    onChange={(e) => updateWorkCase(c.id, { siteDifference: e.target.value })}
                    placeholder="현장별 차이"
                    rows={2}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={c.isRealCase}
                      onChange={(e) => updateWorkCase(c.id, { isRealCase: e.target.checked })}
                    />
                    실제 고객 작업 사례입니다 (체크 해제 시 &quot;예시/시험&quot;으로 표시)
                  </label>
                  {!c.isRealCase && (
                    <input
                      value={c.caseTypeLabel}
                      onChange={(e) => updateWorkCase(c.id, { caseTypeLabel: e.target.value })}
                      placeholder="예시 표기 문구 (예: 자체 기능시험)"
                      className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                    />
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveWorkCase(c.id, -1)}
                    disabled={i === 0}
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWorkCase(c.id, 1)}
                    disabled={i === workCases.length - 1}
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWorkCase(c.id)}
                    className="min-h-9 rounded-lg border border-red-300 px-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
          {workCases.length === 0 && <p className="text-sm text-slate-500">등록된 작업 예시가 없습니다.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">회사소개 사진</h2>
          <button
            type="button"
            onClick={addAboutPhoto}
            className="min-h-9 rounded-lg border border-brand-navy px-3 text-sm font-semibold text-brand-navy hover:bg-brand-cream"
          >
            + 사진 추가
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {aboutPhotos.map((p, i) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 p-4">
              <PhotoUploadButton currentUrl={p.src || undefined} onUploaded={(url) => updateAboutPhoto(p.id, { src: url })} />
              <input
                value={p.alt}
                onChange={(e) => updateAboutPhoto(p.id, { alt: e.target.value })}
                placeholder="사진 설명 (예: 조명 교체 작업 현장)"
                className="mt-2 min-h-9 w-full rounded-lg border border-slate-300 px-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => moveAboutPhoto(p.id, -1)}
                  disabled={i === 0}
                  className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveAboutPhoto(p.id, 1)}
                  disabled={i === aboutPhotos.length - 1}
                  className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => deleteAboutPhoto(p.id)}
                  className="min-h-9 rounded-lg border border-red-300 px-2 text-sm text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {aboutPhotos.length === 0 && <p className="text-sm text-slate-500">등록된 사진이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

// ── 서비스·가격 관리 탭 ─────────────────────────────────────────────────
function PricingTab({
  data,
  update,
}: {
  data: SiteData;
  update: (patch: Partial<SiteData>) => void;
}) {
  const repairCategories = [...data.repairCategories].sort((a, b) => a.order - b.order);

  function updateCategory(id: string, patch: Partial<RepairCategoryData>) {
    update({ repairCategories: data.repairCategories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function moveCategory(id: string, dir: -1 | 1) {
    const idx = repairCategories.findIndex((c) => c.id === id);
    update({ repairCategories: moveItem(repairCategories, idx, dir) });
  }
  function deleteCategory(id: string) {
    if (!confirm("이 서비스 항목을 삭제할까요?")) return;
    update({ repairCategories: withOrder(repairCategories.filter((c) => c.id !== id)) });
  }
  function addCategory() {
    const newCategory: RepairCategoryData = {
      id: nextId("category"),
      title: "새 서비스",
      representativeWork: "",
      description: "",
      priceRangeText: "",
      imageUrl: "",
      order: repairCategories.length,
    };
    update({ repairCategories: [...repairCategories, newCategory] });
  }

  function updateTenantPkg(id: string, patch: Partial<SiteData["tenantCarePackages"][number]>) {
    update({
      tenantCarePackages: data.tenantCarePackages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }
  function updateSmartPkg(id: string, patch: Partial<SiteData["smartHomePackages"][number]>) {
    update({
      smartHomePackages: data.smartHomePackages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }
  function updateAirbnbPkg(id: string, patch: Partial<SiteData["airbnbSetupPackages"][number]>) {
    update({
      airbnbSetupPackages: data.airbnbSetupPackages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">생활 집수리 서비스 항목</h2>
          <button
            type="button"
            onClick={addCategory}
            className="min-h-9 rounded-lg border border-brand-navy px-3 text-sm font-semibold text-brand-navy hover:bg-brand-cream"
          >
            + 서비스 추가
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {repairCategories.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-4">
                <div className="w-32 shrink-0">
                  <PhotoUploadButton
                    currentUrl={c.imageUrl || undefined}
                    onUploaded={(url) => updateCategory(c.id, { imageUrl: url })}
                    label="사진 선택"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={c.title}
                    onChange={(e) => updateCategory(c.id, { title: e.target.value })}
                    placeholder="서비스 이름 (예: 수도·배수)"
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
                  />
                  <input
                    value={c.representativeWork}
                    onChange={(e) => updateCategory(c.id, { representativeWork: e.target.value })}
                    placeholder="대표 작업 (예: 수전 교체·배수구 교체·누수 점검)"
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                  />
                  <textarea
                    value={c.description}
                    onChange={(e) => updateCategory(c.id, { description: e.target.value })}
                    placeholder="설명"
                    rows={2}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={c.priceRangeText}
                    onChange={(e) => updateCategory(c.id, { priceRangeText: e.target.value })}
                    placeholder="가격범위 (예: 8만원~12만원). 비워두면 가격을 표시하지 않습니다."
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveCategory(c.id, -1)}
                    disabled={i === 0}
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(c.id, 1)}
                    disabled={i === repairCategories.length - 1}
                    className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(c.id)}
                    className="min-h-9 rounded-lg border border-red-300 px-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">세입자·주거 케어 패키지 가격</h2>
        <div className="mt-4 flex flex-col gap-3">
          {data.tenantCarePackages.map((p) => (
            <div key={p.id} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
              <input
                value={p.name}
                onChange={(e) => updateTenantPkg(p.id, { name: e.target.value })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
              />
              <input
                type="number"
                value={p.priceWon}
                onChange={(e) => updateTenantPkg(p.id, { priceWon: Number(e.target.value) })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
              <input
                value={p.targetNote}
                onChange={(e) => updateTenantPkg(p.id, { targetNote: e.target.value })}
                placeholder="추천 대상"
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
              <input
                value={p.visitNote}
                onChange={(e) => updateTenantPkg(p.id, { visitNote: e.target.value })}
                placeholder="방문 안내"
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">스마트홈 IoT 패키지 가격</h2>
        <div className="mt-4 flex flex-col gap-3">
          {data.smartHomePackages.map((p) => (
            <div key={p.id} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
              <input
                value={p.name}
                onChange={(e) => updateSmartPkg(p.id, { name: e.target.value })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
              />
              <input
                type="number"
                value={p.priceWon}
                onChange={(e) => updateSmartPkg(p.id, { priceWon: Number(e.target.value) })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={p.priceFrom}
                  onChange={(e) => updateSmartPkg(p.id, { priceFrom: e.target.checked })}
                />
                &quot;부터&quot; 표시
              </label>
              <input
                value={p.visitNote}
                onChange={(e) => updateSmartPkg(p.id, { visitNote: e.target.value })}
                placeholder="방문 안내"
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">에어비앤비 세팅 케어 가격</h2>
        <div className="mt-4 flex flex-col gap-3">
          {data.airbnbSetupPackages.map((p) => (
            <div key={p.id} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
              <input
                value={p.name}
                onChange={(e) => updateAirbnbPkg(p.id, { name: e.target.value })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
              />
              <input
                type="number"
                value={p.priceWon}
                onChange={(e) => updateAirbnbPkg(p.id, { priceWon: Number(e.target.value) })}
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={p.priceFrom}
                  onChange={(e) => updateAirbnbPkg(p.id, { priceFrom: e.target.checked })}
                />
                &quot;부터&quot; 표시
              </label>
              <input
                value={p.visitNote}
                onChange={(e) => updateAirbnbPkg(p.id, { visitNote: e.target.value })}
                placeholder="방문 안내"
                className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">공통 정책 금액</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">출장비 (원)</label>
            <input
              type="number"
              value={data.policy.travelFeeWon}
              onChange={(e) => update({ policy: { ...data.policy, travelFeeWon: Number(e.target.value) } })}
              className="mt-1 min-h-9 w-full rounded-lg border border-slate-300 px-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">기본 구매대행비 (원)</label>
            <input
              type="number"
              value={data.policy.purchaseAgencyFeeWon}
              onChange={(e) => update({ policy: { ...data.policy, purchaseAgencyFeeWon: Number(e.target.value) } })}
              className="mt-1 min-h-9 w-full rounded-lg border border-slate-300 px-2 text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ── 문구 관리 탭 ───────────────────────────────────────────────────────
// 마케팅 카피(히어로/소개 문구)만 편집 대상이다. 계약금·A/S·취소·서비스지역 등
// "고정 정책 문구"는 여기 노출하지 않고 계속 constants.ts에 하드코딩한다.
function CopyTab({
  data,
  update,
}: {
  data: SiteData;
  update: (patch: Partial<SiteData>) => void;
}) {
  function updateCopy(patch: Partial<SiteData["copy"]>) {
    update({ copy: { ...data.copy, ...patch } });
  }

  const fields: {
    key: keyof SiteData["copy"];
    label: string;
    hint?: string;
    multiline?: boolean;
  }[] = [
    { key: "heroTitle", label: "메인 히어로 제목", hint: "줄바꿈하려면 Enter를 누르세요.", multiline: true },
    { key: "heroSubtitle", label: "메인 히어로 부제", hint: "줄바꿈하려면 Enter를 누르세요.", multiline: true },
    { key: "servicesIntro", label: "생활 집수리 페이지 상단 소개문구", multiline: true },
    { key: "tenantCareIntro", label: "세입자·주거 케어 페이지 도입부", multiline: true },
    { key: "tenantCareDescription", label: "세입자·주거 케어 페이지 설명", multiline: true },
    { key: "smartHomeDescription", label: "스마트홈 IoT 페이지 설명", multiline: true },
    { key: "airbnbSetupIntro", label: "에어비앤비 세팅 케어 페이지 도입부", multiline: true },
    { key: "airbnbSetupDescription", label: "에어비앤비 세팅 케어 페이지 설명", multiline: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-xl bg-brand-cream p-4 text-sm leading-relaxed text-slate-700">
        여기서는 각 페이지의 소개·설명 문구(마케팅 카피)만 수정할 수 있습니다. 계약금·A/S·취소·서비스
        지역 안내 등 법적·정책 문구는 실수로 지워지는 것을 막기 위해 이 화면에서 편집할 수 없습니다.
      </p>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-sm font-semibold text-slate-700">{f.label}</label>
          {f.hint && <p className="text-xs text-slate-400">{f.hint}</p>}
          <textarea
            value={data.copy[f.key]}
            onChange={(e) => updateCopy({ [f.key]: e.target.value })}
            rows={f.multiline ? 3 : 1}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

// ── FAQ 관리 탭 ─────────────────────────────────────────────────────────
const FAQ_CATEGORIES: { id: FaqData["category"]; label: string }[] = [
  { id: "main", label: "메인 페이지" },
  { id: "tenant-care", label: "세입자·주거 케어" },
  { id: "smart-home", label: "스마트홈 IoT" },
  { id: "airbnb-setup", label: "에어비앤비 세팅 케어" },
];

function FaqTab({
  data,
  update,
}: {
  data: SiteData;
  update: (patch: Partial<SiteData>) => void;
}) {
  function updateFaq(id: string, patch: Partial<FaqData>) {
    update({ faqs: data.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  }
  function moveFaq(category: FaqData["category"], id: string, dir: -1 | 1) {
    const categoryFaqs = data.faqs.filter((f) => f.category === category).sort((a, b) => a.order - b.order);
    const idx = categoryFaqs.findIndex((f) => f.id === id);
    const moved = moveItem(categoryFaqs, idx, dir);
    const others = data.faqs.filter((f) => f.category !== category);
    update({ faqs: [...others, ...moved] });
  }
  function deleteFaq(category: FaqData["category"], id: string) {
    if (!confirm("이 FAQ 항목을 삭제할까요?")) return;
    const categoryFaqs = withOrder(data.faqs.filter((f) => f.category === category && f.id !== id));
    const others = data.faqs.filter((f) => f.category !== category);
    update({ faqs: [...others, ...categoryFaqs] });
  }
  function addFaq(category: FaqData["category"]) {
    const categoryFaqs = data.faqs.filter((f) => f.category === category);
    const newFaq: FaqData = {
      id: nextId("faq"),
      category,
      question: "새 질문",
      answer: "",
      order: categoryFaqs.length,
    };
    update({ faqs: [...data.faqs, newFaq] });
  }

  return (
    <div className="flex flex-col gap-10">
      {FAQ_CATEGORIES.map(({ id: category, label }) => {
        const categoryFaqs = data.faqs.filter((f) => f.category === category).sort((a, b) => a.order - b.order);
        return (
          <section key={category}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-navy">{label} FAQ</h2>
              <button
                type="button"
                onClick={() => addFaq(category)}
                className="min-h-9 rounded-lg border border-brand-navy px-3 text-sm font-semibold text-brand-navy hover:bg-brand-cream"
              >
                + 질문 추가
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {categoryFaqs.map((f, i) => (
                <div key={f.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-1 flex-col gap-2">
                      <input
                        value={f.question}
                        onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                        placeholder="질문"
                        className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
                      />
                      <textarea
                        value={f.answer}
                        onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                        placeholder="답변"
                        rows={2}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveFaq(category, f.id, -1)}
                        disabled={i === 0}
                        className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFaq(category, f.id, 1)}
                        disabled={i === categoryFaqs.length - 1}
                        className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFaq(category, f.id)}
                        className="min-h-9 rounded-lg border border-red-300 px-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {categoryFaqs.length === 0 && <p className="text-sm text-slate-500">등록된 질문이 없습니다.</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
