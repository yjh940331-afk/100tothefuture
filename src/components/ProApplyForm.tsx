"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LESSON_PLACES, REGIONS, SPECIALTIES } from "@/lib/constants";
import type { InstructorApplication } from "@/lib/types";

type FormState = {
  display_name: string;
  phone: string;
  region: string;
  lesson_places: string[];
  specialties: string[];
  career_years: string;
  bio: string;
  about: string;
  proof_urls: string;
};

export function ProApplyForm({
  initial,
  member,
}: {
  initial?: InstructorApplication | null;
  member: {
    name?: string | null;
    phone?: string | null;
    region?: string | null;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => ({
    display_name: initial?.display_name ?? member.name ?? "",
    phone: initial?.phone ?? member.phone ?? "",
    region: initial?.region ?? member.region ?? REGIONS[0],
    lesson_places: initial?.lesson_places ?? [],
    specialties: initial?.specialties ?? [],
    career_years: String(initial?.career_years ?? 0),
    bio: initial?.bio ?? "",
    about: initial?.about ?? "",
    proof_urls: (initial?.proof_urls ?? []).join("\n"),
  }));
  const [agree, setAgree] = useState(Boolean(initial));
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggle(key: "lesson_places" | "specialties", value: string) {
    setForm((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists
          ? current[key].filter((item) => item !== value)
          : [...current[key], value],
      };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.display_name.trim() || !form.phone.trim() || !form.region) {
      setError("프로명, 연락처, 활동 지역을 입력해주세요.");
      return;
    }
    if (form.specialties.length === 0) {
      setError("전문 분야를 하나 이상 선택해주세요.");
      return;
    }
    if (!agree) {
      setError("프로 심사를 위한 정보 제공에 동의해주세요.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/pro/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          career_years: Number(form.career_years || 0),
          proof_urls: form.proof_urls
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setError(data.error || "신청서를 저장하지 못했어요.");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
      setError("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-fairway-100 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-black text-fairway-900">
          프로 신청이 접수됐어요
        </p>
        <p className="mt-2 text-sm text-fairway-600">
          관리자 승인 후 프로 대시보드를 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-fairway-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="프로명 *">
          <input
            className="input"
            value={form.display_name}
            onChange={(event) => set("display_name", event.target.value)}
            placeholder="예: 김미래 프로"
            required
          />
        </Field>
        <Field label="연락처 *">
          <input
            className="input"
            type="tel"
            value={form.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="010-0000-0000"
            required
          />
        </Field>
        <Field label="활동 지역 *">
          <select
            className="input"
            value={form.region}
            onChange={(event) => set("region", event.target.value)}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>
        <Field label="경력 연차">
          <input
            className="input"
            type="number"
            min="0"
            value={form.career_years}
            onChange={(event) => set("career_years", event.target.value)}
          />
        </Field>
      </div>

      <ChoiceGroup title="전문 분야">
        {SPECIALTIES.map((specialty) => (
          <Choice
            key={specialty}
            label={specialty}
            checked={form.specialties.includes(specialty)}
            onChange={() => toggle("specialties", specialty)}
          />
        ))}
      </ChoiceGroup>

      <ChoiceGroup title="레슨 장소">
        {LESSON_PLACES.map((place) => (
          <Choice
            key={place}
            label={place}
            checked={form.lesson_places.includes(place)}
            onChange={() => toggle("lesson_places", place)}
          />
        ))}
      </ChoiceGroup>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="한 줄 소개">
          <input
            className="input"
            value={form.bio}
            onChange={(event) => set("bio", event.target.value)}
            placeholder="예: 100타 탈출 전문 레슨"
            maxLength={120}
          />
        </Field>
        <Field label="자격/증빙 URL">
          <textarea
            className="input min-h-20"
            value={form.proof_urls}
            onChange={(event) => set("proof_urls", event.target.value)}
            placeholder="링크를 쉼표 또는 줄바꿈으로 입력"
          />
        </Field>
      </div>

      <label className="mt-4 block">
        <span className="label">상세 소개</span>
        <textarea
          className="input min-h-28"
          value={form.about}
          onChange={(event) => set("about", event.target.value)}
          placeholder="레슨 스타일, 경력, 주요 대상 골퍼를 적어주세요."
          maxLength={800}
        />
      </label>

      <label className="mt-4 flex items-start gap-2 text-[13px] text-fairway-700">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={agree}
          onChange={(event) => setAgree(event.target.checked)}
        />
        <span>프로 심사와 회원 매칭을 위한 정보 확인에 동의합니다.</span>
      </label>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary mt-5 w-full"
      >
        {status === "loading" ? "저장 중..." : "프로 신청하기"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function ChoiceGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-black text-fairway-900">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
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
    <button
      type="button"
      onClick={onChange}
      className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
        checked
          ? "border-fairway-700 bg-fairway-800 text-white"
          : "border-fairway-100 bg-white text-fairway-700 hover:bg-fairway-50"
      }`}
    >
      {label}
    </button>
  );
}
