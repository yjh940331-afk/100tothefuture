"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/constants";

export interface ProfileInitial {
  name?: string | null;
  nickname?: string | null;
  phone?: string | null;
  region?: string | null;
  marketing_agreed?: boolean;
  kakao_channel_agreed?: boolean;
  current_avg_score?: number | null;
  target_score?: number | null;
  goal?: string | null;
}

export function ProfileForm({
  initial,
  markOnboarded,
  submitLabel,
  redirectTo,
}: {
  initial: ProfileInitial;
  markOnboarded?: boolean;
  submitLabel: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name ?? "",
    nickname: initial.nickname ?? "",
    phone: initial.phone ?? "",
    region: initial.region ?? "",
    marketing_agreed: initial.marketing_agreed ?? false,
    kakao_channel_agreed: initial.kakao_channel_agreed ?? false,
    current_avg_score: initial.current_avg_score?.toString() ?? "",
    target_score: initial.target_score?.toString() ?? "",
    goal: initial.goal ?? "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("이름과 연락처를 입력해주세요.");
      return;
    }
    setStatus("loading");
    setError("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, onboarded: markOnboarded }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setStatus("error");
      setError(data.error || "저장에 실패했어요.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">이름 *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="홍길동"
            required
          />
        </div>
        <div>
          <label className="label">연락처 *</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="010-0000-0000"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">닉네임</label>
          <input
            className="input"
            value={form.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            placeholder="후기에 표시될 이름"
          />
        </div>
        <div>
          <label className="label">활동 지역</label>
          <select
            className="input"
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          >
            <option value="">선택 안 함</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-cream p-4">
        <p className="text-[13px] font-bold text-fairway-800">
          골프 정보 (선택 — 맞춤 추천에 사용)
        </p>
        <p className="mb-3 mt-0.5 text-[11px] text-fairway-500">
          * 골프는 타수가 낮을수록 잘 치는 거예요. 100타 탈출이 목표라면 목표
          타수를 100 미만으로 적어주세요.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">현재 평균 타수</label>
            <input
              type="number"
              className="input"
              value={form.current_avg_score}
              onChange={(e) => set("current_avg_score", e.target.value)}
              placeholder="예: 105 (지금 스코어)"
            />
          </div>
          <div>
            <label className="label">목표 타수</label>
            <input
              type="number"
              className="input"
              value={form.target_score}
              onChange={(e) => set("target_score", e.target.value)}
              placeholder="예: 95 (도달할 스코어)"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">골프 목표 / 고민</label>
          <input
            className="input"
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
            placeholder="예: 드라이버 슬라이스 교정"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-[13px] text-fairway-700">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={form.marketing_agreed}
          onChange={(e) => set("marketing_agreed", e.target.checked)}
        />
        <span>[선택] 이벤트·혜택 마케팅 정보 수신에 동의합니다.</span>
      </label>

      <label className="flex items-start gap-2 text-[13px] text-fairway-700">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={form.kakao_channel_agreed}
          onChange={(e) => set("kakao_channel_agreed", e.target.checked)}
        />
        <span>[선택] 카카오톡 채널로 예약·견적 알림을 받겠습니다.</span>
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
