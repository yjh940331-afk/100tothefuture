"use client";

import { useState } from "react";
import Link from "next/link";
import type { Instructor } from "@/lib/types";
import { REGIONS } from "@/lib/constants";
import { CONTACT_METHODS, contactMemo } from "@/lib/contact";

const priceLabel = (price: number) =>
  price > 0 ? `${price.toLocaleString("ko-KR")}원` : "상담 후 안내";

export function BookingForm({ pro }: { pro: Instructor }) {
  const [form, setForm] = useState({
    student_name: "",
    student_phone: "",
    contact_method: "sms",
    contact_detail: "",
    preferred_date: "",
    preferred_time: "",
    region: pro.region,
    lesson_package_id: "",
    goal: "",
  });
  const [privacy, setPrivacy] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const today = new Date().toISOString().slice(0, 10);
  const selectedPackage = pro.packages.find(
    (item) => item.id === form.lesson_package_id,
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
      const { contact_method, contact_detail, ...payload } = form;
      const contactGoal = [
        contactMemo(contact_method, contact_detail),
        form.goal.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: pro.id,
          ...payload,
          goal: contactGoal,
          privacy_agreed: privacy,
          third_party_agreed: thirdParty,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDemo(Boolean(data.demo));
        setBookingId(data.id ?? "");
        setStatus("done");
      } else {
        setStatus("error");
        setError(data.error || "예약 요청 중 오류가 발생했습니다.");
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
          <svg
            viewBox="0 0 20 20"
            className="h-7 w-7"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-black text-fairway-900">
          예약 요청이 접수되었습니다.
        </h2>
        <p className="mt-2 text-fairway-600">
          운영자가 확인한 뒤 입력하신 연락처로 일정 확정을 안내드립니다.
        </p>
        {bookingId && (
          <div className="mt-5 rounded-lg border border-fairway-100 bg-white p-4 text-left">
            <p className="text-sm font-bold text-fairway-500">예약번호</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-fairway-900">
              {bookingId}
            </p>
            <p className="mt-2 text-xs leading-5 text-fairway-500">
              내 예약 조회와 취소에 필요합니다. 예약번호를 안전한 곳에
              보관해주세요.
            </p>
          </div>
        )}
        {demo && (
          <p className="mt-3 rounded-lg bg-gold-100 px-3 py-2 text-sm text-gold-900">
            데모 모드입니다. Supabase 연결 후 실제 예약이 저장됩니다.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/bookings" className="btn-primary inline-flex">
            내 예약 조회
          </Link>
          <Link href={`/pros/${pro.slug}`} className="btn-outline inline-flex">
            프로필로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-5 sm:p-6">
      <div className="border-b border-fairway-100 pb-5">
        <h2 className="text-lg font-extrabold text-fairway-900">
          상담 요청 정보
        </h2>
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
            onChange={(event) => set("student_name", event.target.value)}
            placeholder="홍길동"
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
            onChange={(event) => set("student_phone", event.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
        <div>
          <label className="label">연락 희망 방식</label>
          <select
            className="input"
            value={form.contact_method}
            onChange={(event) => set("contact_method", event.target.value)}
          >
            {CONTACT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">카카오/오픈채팅</label>
          <input
            className="input"
            value={form.contact_detail}
            onChange={(event) => set("contact_detail", event.target.value)}
            placeholder="선택 입력"
            maxLength={120}
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
            onChange={(event) => set("preferred_date", event.target.value)}
            min={today}
          />
        </div>
        <div>
          <label className="label">희망 시간</label>
          <input
            type="time"
            className="input"
            value={form.preferred_time}
            onChange={(event) => set("preferred_time", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">지역</label>
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
        </div>
        {pro.packages.length > 0 && (
          <div>
            <label className="label">관심 레슨 상품</label>
            <select
              className="input"
              value={form.lesson_package_id}
              onChange={(event) => set("lesson_package_id", event.target.value)}
            >
              <option value="">선택 안 함 / 상담 후 결정</option>
              {pro.packages.map((lessonPackage) => (
                <option key={lessonPackage.id} value={lessonPackage.id}>
                  {lessonPackage.title} ({priceLabel(lessonPackage.price)})
                </option>
              ))}
            </select>
            {selectedPackage && (
              <p className="mt-1.5 text-xs font-medium text-fairway-500">
                {selectedPackage.session_count}회 · 회당{" "}
                {selectedPackage.duration_minutes}분 ·{" "}
                {priceLabel(selectedPackage.price)}
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
          onChange={(event) => set("goal", event.target.value)}
          maxLength={360}
          placeholder="예: 평균 108타, 드라이버 OB가 많아서 3개월 안에 100타를 깨고 싶습니다."
        />
        <div className="mt-1 text-right text-xs text-fairway-400">
          {form.goal.length}/360
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-cream p-4">
        <label className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white px-3 py-3 text-sm text-fairway-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={privacy}
            onChange={(event) => setPrivacy(event.target.checked)}
          />
          <span>
            <b>[필수]</b> 개인정보 수집·이용에 동의합니다.{" "}
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
            onChange={(event) => setThirdParty(event.target.checked)}
          />
          <span>
            <b>[선택]</b> 상담을 위해 연락처를 해당 레슨 프로에게 제공하는 것에
            동의합니다.
          </span>
        </label>
      </div>

      {error && (
        <p
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full text-base"
      >
        {status === "loading" ? "요청 중..." : "상담 · 예약 요청하기"}
      </button>
    </form>
  );
}
