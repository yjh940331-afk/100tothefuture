"use client";

import { useState } from "react";
import Link from "next/link";
import type { Instructor } from "@/lib/types";
import { REGIONS } from "@/lib/constants";

export function BookingForm({ pro }: { pro: Instructor }) {
  const [form, setForm] = useState({
    student_name: "",
    student_phone: "",
    preferred_date: "",
    preferred_time: "",
    region: pro.region,
    lesson_package_id: "",
    goal: "",
  });
  const [privacy, setPrivacy] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);
  const selectedPackage = pro.packages.find((p) => p.id === form.lesson_package_id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_name.trim() || !form.student_phone.trim()) {
      setError("이름과 연락처를 입력해주세요.");
      return;
    }
    if (!privacy) {
      setError("개인정보 수집·이용 동의가 필요합니다.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: pro.id,
          ...form,
          privacy_agreed: privacy,
          third_party_agreed: thirdParty,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDemo(!!data.demo);
        setStatus("done");
      } else {
        setStatus("error");
        setError(data.error || "요청 중 오류가 발생했어요.");
      }
    } catch {
      setStatus("error");
      setError("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fairway-100 text-fairway-700">
          <svg viewBox="0 0 20 20" className="h-7 w-7" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-black text-fairway-900">예약 요청이 접수되었습니다!</h2>
        <p className="mt-2 text-fairway-600">
          {pro.display_name}님 또는 운영자가 확인 후 입력하신 연락처로 일정을 확정해드립니다.
        </p>
        {demo && (
          <p className="mt-3 rounded-lg bg-gold-100 px-3 py-2 text-sm text-gold-900">
            (데모 모드: 실제로는 저장되지 않았습니다. Supabase 연결 후 정상 저장됩니다.)
          </p>
        )}
        <Link href={`/pros/${pro.slug}`} className="btn-outline mt-6 inline-flex">
          프로필로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-5 sm:p-6">
      <div className="border-b border-fairway-100 pb-5">
        <h2 className="text-lg font-extrabold text-fairway-900">상담 요청 정보</h2>
        <p className="mt-1 text-sm text-fairway-600">
          프로가 바로 이해할 수 있도록 목표와 현재 고민을 간단히 적어주세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">이름 *</label>
          <input
            className="input"
            value={form.student_name}
            onChange={(e) => set("student_name", e.target.value)}
            placeholder="예: 홍길동"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="label">연락처 *</label>
          <input
            type="tel"
            className="input"
            value={form.student_phone}
            onChange={(e) => set("student_phone", e.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">희망 날짜</label>
          <input
            type="date"
            className="input"
            value={form.preferred_date}
            onChange={(e) => set("preferred_date", e.target.value)}
            min={today}
          />
        </div>
        <div>
          <label className="label">희망 시간</label>
          <input
            type="time"
            className="input"
            value={form.preferred_time}
            onChange={(e) => set("preferred_time", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">지역</label>
          <select className="input" value={form.region} onChange={(e) => set("region", e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {pro.packages.length > 0 && (
          <div>
            <label className="label">관심 레슨 상품</label>
            <select
              className="input"
              value={form.lesson_package_id}
              onChange={(e) => set("lesson_package_id", e.target.value)}
            >
              <option value="">선택 안 함 / 상담 후 결정</option>
              {pro.packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.price.toLocaleString("ko-KR")}원)
                </option>
              ))}
            </select>
            {selectedPackage && (
              <p className="mt-1.5 text-xs font-medium text-fairway-500">
                {selectedPackage.session_count}회 · 회당 {selectedPackage.duration_minutes}분 ·{" "}
                {selectedPackage.price.toLocaleString("ko-KR")}원
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="label">희망 내용 · 고민</label>
        <textarea
          className="input min-h-28"
          value={form.goal}
          onChange={(e) => set("goal", e.target.value)}
          maxLength={500}
          placeholder="예: 평균 108타, 드라이버 OB가 잦아요. 3개월 안에 100타 깨고 싶습니다."
        />
        <div className="mt-1 text-right text-xs text-fairway-400">{form.goal.length}/500</div>
      </div>

      {/* 동의 */}
      <div className="space-y-2 rounded-lg bg-cream p-4">
        <label className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white px-3 py-3 text-sm text-fairway-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
          <span>
            <b>[필수]</b> 개인정보(이름·연락처) 수집·이용에 동의합니다.{" "}
            <Link href="/privacy" className="underline" target="_blank">
              내용 보기
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white px-3 py-3 text-sm text-fairway-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={thirdParty}
            onChange={(e) => setThirdParty(e.target.checked)}
          />
          <span>
            <b>[선택]</b> 상담을 위해 연락처를 해당 레슨프로에게 제공하는 것에 동의합니다.
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600" aria-live="polite">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full text-base">
        {status === "loading" ? "요청 중..." : "상담 · 예약 요청하기"}
      </button>
    </form>
  );
}
