"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LESSON_PLACES, REGIONS, SPECIALTIES } from "@/lib/constants";

const SKILL_LEVELS = ["처음 시작", "입문 1년 미만", "보기 플레이어", "90대", "80대 이하"] as const;
const SCORE_RANGES = ["아직 모름", "120타 이상", "110~119타", "100~109타", "90~99타", "80대 이하"] as const;
const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const TIME_SLOTS = ["오전", "오후", "저녁", "상관없음"] as const;
const PACKAGE_OPTIONS = ["1회 체험", "4회 패키지", "8회 이상 집중반", "필드 동반 레슨", "상담 후 결정"] as const;

type FormState = {
  customer_name: string;
  customer_phone: string;
  region: string;
  lesson_places: string[];
  goals: string[];
  skill_level: string;
  score_range: string;
  preferred_days: string[];
  preferred_time_slot: string;
  budget_min: string;
  budget_max: string;
  instructor_gender_preference: string;
  package_preference: string;
  memo: string;
};

const initialForm: FormState = {
  customer_name: "",
  customer_phone: "",
  region: REGIONS[0],
  lesson_places: [],
  goals: [],
  skill_level: "",
  score_range: "",
  preferred_days: [],
  preferred_time_slot: "",
  budget_min: "",
  budget_max: "",
  instructor_gender_preference: "",
  package_preference: "",
  memo: "",
};

export function QuoteRequestForm({ initialGoal }: { initialGoal?: string } = {}) {
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    goals:
      initialGoal && SPECIALTIES.includes(initialGoal as (typeof SPECIALTIES)[number])
        ? [initialGoal]
        : [],
  }));
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [demo, setDemo] = useState(false);

  const selectedSummary = useMemo(() => {
    const chunks = [
      form.region,
      form.goals.slice(0, 2).join(", "),
      form.preferred_days.length ? `${form.preferred_days.join(", ")}요일` : "",
      form.preferred_time_slot,
    ].filter(Boolean);
    return chunks.join(" · ");
  }, [form]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggle(key: "lesson_places" | "goals" | "preferred_days", value: string) {
    setForm((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError("이름과 연락처를 입력해주세요.");
      return;
    }
    if (form.goals.length === 0) {
      setError("레슨 목표를 하나 이상 선택해주세요.");
      return;
    }
    if (!privacy) {
      setError("개인정보 수집 및 이용 동의가 필요합니다.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/lesson-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          privacy_agreed: privacy,
          marketing_agreed: marketing,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setError(data.error || "견적 요청을 저장하지 못했습니다.");
        return;
      }
      setDemo(Boolean(data.demo));
      setRequestId(data.id ?? "");
      setStatus("done");
    } catch {
      setStatus("error");
      setError("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-fairway-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fairway-100 text-fairway-700">
          <svg viewBox="0 0 20 20" className="h-7 w-7" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-black text-fairway-900">견적 요청이 접수되었습니다</h2>
        <p className="mx-auto mt-2 max-w-xl text-fairway-600">
          조건에 맞는 골프 레슨 프로를 확인한 뒤, 비교 가능한 제안과 상담 안내를 연락처로 보내드릴게요.
        </p>
        {requestId && (
          <div className="mx-auto mt-5 max-w-xl rounded-lg bg-fairway-50 p-4 text-left">
            <p className="text-sm font-bold text-fairway-500">요청번호</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-fairway-900">{requestId}</p>
          </div>
        )}
        {demo && (
          <p className="mx-auto mt-3 max-w-xl rounded-lg bg-gold-100 px-3 py-2 text-sm text-gold-900">
            데모 모드입니다. Supabase 연결 후 실제 요청이 저장됩니다.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/pros" className="btn-primary inline-flex">
            프로 직접 보기
          </Link>
          <button type="button" onClick={() => setStatus("idle")} className="btn-outline">
            요청서 다시 작성
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-fairway-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 border-b border-fairway-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-gold-700">골프 레슨 견적 요청</p>
          <h2 className="mt-1 text-2xl font-black text-fairway-900">조건만 알려주세요</h2>
          <p className="mt-1 text-sm leading-6 text-fairway-600">
            운영자가 검증된 프로 후보를 추려 상담 가능한 제안으로 연결합니다.
          </p>
        </div>
        {selectedSummary && (
          <p className="rounded-full bg-fairway-50 px-3 py-1.5 text-xs font-bold text-fairway-700">
            {selectedSummary}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="이름 *">
          <input
            className="input"
            value={form.customer_name}
            onChange={(event) => set("customer_name", event.target.value)}
            placeholder="홍길동"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="연락처 *">
          <input
            className="input"
            type="tel"
            value={form.customer_phone}
            onChange={(event) => set("customer_phone", event.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </Field>
        <Field label="레슨 희망 지역 *">
          <select className="input" value={form.region} onChange={(event) => set("region", event.target.value)}>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>
        <Field label="현재 실력">
          <select className="input" value={form.skill_level} onChange={(event) => set("skill_level", event.target.value)}>
            <option value="">선택 안 함</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>
        <Field label="평균 스코어">
          <select className="input" value={form.score_range} onChange={(event) => set("score_range", event.target.value)}>
            <option value="">선택 안 함</option>
            {SCORE_RANGES.map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </Field>
        <Field label="선호 시간대">
          <select
            className="input"
            value={form.preferred_time_slot}
            onChange={(event) => set("preferred_time_slot", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <ChoiceGroup title="레슨 목표 *">
        {SPECIALTIES.map((goal) => (
          <Choice
            key={goal}
            label={goal}
            checked={form.goals.includes(goal)}
            onChange={() => toggle("goals", goal)}
          />
        ))}
      </ChoiceGroup>

      <ChoiceGroup title="희망 레슨 장소">
        {LESSON_PLACES.map((place) => (
          <Choice
            key={place}
            label={place}
            checked={form.lesson_places.includes(place)}
            onChange={() => toggle("lesson_places", place)}
          />
        ))}
      </ChoiceGroup>

      <ChoiceGroup title="가능 요일">
        {DAYS.map((day) => (
          <Choice
            key={day}
            label={`${day}요일`}
            checked={form.preferred_days.includes(day)}
            onChange={() => toggle("preferred_days", day)}
          />
        ))}
      </ChoiceGroup>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="예산 하한">
          <input
            className="input"
            type="number"
            min="0"
            step="10000"
            value={form.budget_min}
            onChange={(event) => set("budget_min", event.target.value)}
            placeholder="예: 50000"
          />
        </Field>
        <Field label="예산 상한">
          <input
            className="input"
            type="number"
            min="0"
            step="10000"
            value={form.budget_max}
            onChange={(event) => set("budget_max", event.target.value)}
            placeholder="예: 150000"
          />
        </Field>
        <Field label="프로 성별 선호">
          <select
            className="input"
            value={form.instructor_gender_preference}
            onChange={(event) => set("instructor_gender_preference", event.target.value)}
          >
            <option value="">상관없음</option>
            <option value="male">남성 프로</option>
            <option value="female">여성 프로</option>
          </select>
        </Field>
        <Field label="희망 상품">
          <select
            className="input"
            value={form.package_preference}
            onChange={(event) => set("package_preference", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {PACKAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="상세 요청">
        <textarea
          className="input min-h-32"
          value={form.memo}
          onChange={(event) => set("memo", event.target.value)}
          maxLength={800}
          placeholder="예: 드라이버 슬라이스가 심하고, 주말 오전에 수원 근처 실내연습장에서 레슨받고 싶어요."
        />
        <div className="mt-1 text-right text-xs text-fairway-400">{form.memo.length}/800</div>
      </Field>

      <div className="mt-5 space-y-2 rounded-lg bg-cream p-4">
        <Agreement checked={privacy} onChange={setPrivacy} required>
          개인정보 수집 및 이용에 동의합니다.{" "}
          <Link href="/privacy" className="underline" target="_blank">
            내용 보기
          </Link>
        </Agreement>
        <Agreement checked={marketing} onChange={setMarketing}>
          레슨 추천, 할인, 이벤트 안내를 받을게요.
        </Agreement>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600" aria-live="polite">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-5 w-full text-base">
        {status === "loading" ? "요청 저장 중..." : "맞춤 견적 요청하기"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function ChoiceGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-5">
      <legend className="label">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </fieldset>
  );
}

function Choice({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
        checked
          ? "border-fairway-700 bg-fairway-50 text-fairway-900"
          : "border-fairway-100 bg-white text-fairway-600 hover:bg-fairway-50"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-fairway-300" />
      {label}
    </label>
  );
}

function Agreement({
  checked,
  onChange,
  required = false,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white px-3 py-3 text-sm text-fairway-700">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-fairway-300"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
      />
      <span>
        <b>{required ? "[필수]" : "[선택]"}</b> {children}
      </span>
    </label>
  );
}
