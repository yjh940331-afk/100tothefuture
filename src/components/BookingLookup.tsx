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

const canCancelStatus = (s: string) => s === "requested" || s === "confirmed";

export function BookingLookup({ defaultPhone = "" }: { defaultPhone?: string }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string>("");

  async function lookup(event?: React.FormEvent) {
    event?.preventDefault();
    if (!phone.trim()) {
      setError("연락처를 입력해주세요.");
      return;
    }
    setBusy("lookup");
    setError("");
    setBookings(null);
    const res = await fetch("/api/bookings/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_phone: phone }),
    });
    const data = await res.json().catch(() => ({ ok: false, error: "응답을 확인할 수 없습니다." }));
    setBusy("");
    if (!data.ok) {
      setError(data.error || "예약 정보를 찾을 수 없습니다.");
      return;
    }
    setBookings(data.bookings ?? []);
  }

  async function cancelBooking(id: string) {
    if (!confirm("예약을 취소하시겠어요?")) return;
    setBusy(`cancel-${id}`);
    setError("");
    const res = await fetch("/api/bookings/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: id, student_phone: phone }),
    });
    const data = await res.json().catch(() => ({ ok: false, error: "응답을 확인할 수 없습니다." }));
    setBusy("");
    if (!data.ok) {
      setError(data.error || "예약을 취소하지 못했습니다.");
      return;
    }
    // 취소된 예약 상태 반영
    setBookings((prev) =>
      (prev ?? []).map((b) => (b.id === id ? { ...b, status: "canceled" } : b)),
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={lookup} className="card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-black text-fairway-900">예약 조회</h2>
          <p className="mt-1 text-sm text-fairway-600">
            예약 시 입력한 <b>연락처만</b> 입력하면 내 예약을 모두 보여드려요.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input flex-1"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
            inputMode="tel"
            required
          />
          <button type="submit" disabled={busy === "lookup"} className="btn-primary shrink-0">
            {busy === "lookup" ? "조회 중..." : "예약 조회"}
          </button>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600" aria-live="polite">
            {error}
          </p>
        )}
      </form>

      {bookings && (
        <div className="mt-6">
          {bookings.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="font-black text-fairway-900">예약 내역이 없어요.</p>
              <Link href="/pros" className="btn-outline mx-auto mt-4 inline-flex">
                프로 찾아보기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-fairway-600">
                총 {bookings.length}건의 예약
              </p>
              {bookings.map((b) => (
                <div key={b.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-fairway-900">
                        {b.instructor_name ?? "프로"}
                      </h3>
                      <p className="mt-0.5 text-[13px] text-fairway-500">
                        {[b.preferred_date, b.preferred_time].filter(Boolean).join(" ") ||
                          "일정 협의 중"}
                        {b.region ? ` · ${b.region}` : ""}
                      </p>
                      {b.package_title && (
                        <p className="mt-0.5 text-[13px] text-fairway-500">{b.package_title}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-fairway-100 px-2.5 py-1 text-[11px] font-black text-fairway-800">
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </div>

                  {b.admin_memo && (
                    <div className="mt-2 rounded-lg bg-gold-50 p-2.5 text-[13px] leading-5 text-gold-900">
                      <b>운영 메모</b> · {b.admin_memo}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-fairway-400">
                      접수 {new Date(b.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    {canCancelStatus(b.status) && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        disabled={busy === `cancel-${b.id}`}
                        className="btn-outline !min-h-9 !px-3 !py-1.5 text-[13px]"
                      >
                        {busy === `cancel-${b.id}` ? "취소 중..." : "예약 취소"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
