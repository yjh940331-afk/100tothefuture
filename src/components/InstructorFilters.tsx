"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { REGIONS, SPECIALTIES, LESSON_PLACES, TIME_SLOTS } from "@/lib/constants";

const SORTS = [
  { key: "recommended", label: "추천순" },
  { key: "rating", label: "평점 높은순" },
  { key: "reviews", label: "후기 많은순" },
  { key: "price", label: "가격 낮은순" },
] as const;

const PRICE_MAX = [
  { key: "", label: "전체 가격" },
  { key: "60000", label: "6만원 이하" },
  { key: "80000", label: "8만원 이하" },
  { key: "120000", label: "12만원 이하" },
];

export function InstructorFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/pros?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const toggleChip = useCallback(
    (key: string, value: string) => {
      const current = params.get(key);
      setParam(key, current === value ? "" : value);
    },
    [params, setParam],
  );

  const has = (key: string, value: string) => params.get(key) === value;
  const hasAny = params.toString().length > 0;

  return (
    <div className="card space-y-5 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-fairway-900">필터</h2>
          <p className="mt-0.5 text-xs text-fairway-500">조건을 누르면 바로 적용됩니다.</p>
        </div>
        {hasAny && (
          <button
            onClick={() => router.push("/pros", { scroll: false })}
            className="rounded-md border border-fairway-200 px-2.5 py-1.5 text-xs font-semibold text-fairway-600 hover:border-fairway-400 hover:text-fairway-800"
          >
            초기화
          </button>
        )}
      </div>

      <FilterGroup label="지역">
        {REGIONS.map((r) => (
          <Chip key={r} active={has("region", r)} onClick={() => toggleChip("region", r)}>
            {r}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="전문 분야">
        {SPECIALTIES.map((s) => (
          <Chip key={s} active={has("specialty", s)} onClick={() => toggleChip("specialty", s)}>
            {s}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="레슨 장소">
        {LESSON_PLACES.map((p) => (
          <Chip key={p} active={has("place", p)} onClick={() => toggleChip("place", p)}>
            {p}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="가능 시간">
        {TIME_SLOTS.map((t) => (
          <Chip
            key={t.key}
            active={has("timeSlot", t.key)}
            onClick={() => toggleChip("timeSlot", t.key)}
          >
            {t.label}
          </Chip>
        ))}
      </FilterGroup>

      <div>
        <div className="label">가격대</div>
        <select
          className="input"
          value={params.get("priceMax") ?? ""}
          onChange={(e) => setParam("priceMax", e.target.value)}
        >
          {PRICE_MAX.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="label">정렬</div>
        <select
          className="input"
          value={params.get("sort") ?? "recommended"}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-9 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-fairway-600 bg-fairway-700 text-white"
          : "border-fairway-200 text-fairway-700 hover:border-fairway-400 hover:bg-fairway-50"
      }`}
    >
      {children}
    </button>
  );
}
