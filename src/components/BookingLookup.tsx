"use client";

import { useState } from "react";
import Link from "next/link";

type CustomerBooking = {
  id: string;
  instructor_name?: string;
  package_title?: string;
  student_name: string;
  student_phone: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  region?: string | null;
  goal?: string | null;
  admin_memo?: string | null;
  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  requested: "요청됨",
  confirmed: "확정",
  completed: "완료",
  canceled: "취소",
  rejected: "거절",
  no_show: "노쇼",
};

export function BookingLookup() {
  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"idle" | "lookup" | "cancel">("idle");

  async function lookup(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy("lookup");
    setError("");
    setBooking(null);
    const res = await fetch("/api/bookings/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, student_phone: phone }),
    });
    const data = await res.json().catch(() => ({ ok: false, error: "응답을 확인할 수 없습니다." }));
    setBusy("idle");
    if (!data.ok) {
      setError(data.error || "예약 정보를 찾을 수 없습니다.");
      return;
    }
    setBooking(data.booking);
  }

  async function cancelBooking() {
    if (!booking || !confirm("예약을 취소하시겠어요?")) return;
    setBusy("cancel");
    setError("");
    const res = await fetch("/api/bookings/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, student_phone: phone }),
    });
    const data = await res.json().catch(() => ({ ok: false, error: "응답을 확인할 수 없습니다." }));
    setBusy("idle");
    if (!data.ok) {
      setError(data.error || "예약을 취소하지 못했습니다.");
      return;
    }
    setBooking(data.booking);
  }

  const canCancel = booking?.status === "requested" || booking?.status === "confirmed";

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={lookup} className="card h-fit space-y-4 p-6">
        <div>
          <h2 className="text-xl font-black text-fairway-900">예약 조회</h2>
          <p className="mt-1 text-sm leading-6 text-fairway-600">
            예약 완료 화면에서 받은 예약번호와 예약 시 입력한 연락처를 입력하세요.
          </p>
        </div>
        <label>
          <span className="label">예약번호</span>
          <input
            className="input"
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
            placeholder="예약 UUID"
            autoComplete="off"
            required
          />
        </label>
        <label>
          <span className="label">예약 연락처</span>
          <input
            className="input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </label>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600" aria-live="polite">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy !== "idle"} className="btn-primary w-full">
          {busy === "lookup" ? "조회 중..." : "예약 조회하기"}
        </button>
      </form>

      <div className="card min-h-[320px] p-6">
        {!booking ? (
          <div className="flex h-full min-h-[260px] flex-col justify-center text-center">
            <p className="text-lg font-black text-fairway-900">예약 정보를 조회해보세요.</p>
            <p className="mt-2 text-sm leading-6 text-fairway-500">
              예약번호를 잃어버린 경우 운영자에게 연락처와 예약 프로명을 알려주세요.
            </p>
            <Link href="/pros" className="btn-outline mx-auto mt-5 inline-flex">
              새 예약하기
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gold-600">예약번호</p>
                <h2 className="mt-1 break-all text-xl font-black text-fairway-900">{booking.id}</h2>
              </div>
              <span className="rounded-full bg-fairway-100 px-3 py-1 text-sm font-black text-fairway-800">
                {statusLabels[booking.status] ?? booking.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="예약자" value={booking.student_name} />
              <Info label="프로" value={booking.instructor_name ?? "-"} />
              <Info label="희망 일정" value={[booking.preferred_date, booking.preferred_time].filter(Boolean).join(" ") || "-"} />
              <Info label="상품" value={booking.package_title ?? "-"} />
              <Info label="지역" value={booking.region ?? "-"} />
              <Info label="접수일" value={new Date(booking.created_at).toLocaleString("ko-KR")} />
            </dl>

            {booking.goal && (
              <div className="mt-4 rounded-lg bg-fairway-50 p-4 text-sm leading-6 text-fairway-700">
                <b>요청 내용</b>
                <p className="mt-1">{booking.goal}</p>
              </div>
            )}
            {booking.admin_memo && (
              <div className="mt-3 rounded-lg bg-gold-50 p-4 text-sm leading-6 text-gold-900">
                <b>운영 메모</b>
                <p className="mt-1">{booking.admin_memo}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {canCancel && (
                <button onClick={cancelBooking} disabled={busy !== "idle"} className="btn-outline">
                  {busy === "cancel" ? "취소 중..." : "예약 취소"}
                </button>
              )}
              <Link href="/pros" className="btn-primary">
                다른 프로 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-fairway-100 bg-white p-3">
      <dt className="text-xs font-bold text-fairway-400">{label}</dt>
      <dd className="mt-1 font-semibold text-fairway-800">{value}</dd>
    </div>
  );
}

