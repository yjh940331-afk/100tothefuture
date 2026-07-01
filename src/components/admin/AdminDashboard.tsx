"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Instructor, ReviewSummary } from "@/lib/types";
import {
  BOOKING_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants";
import { Stars } from "@/components/Stars";

type Tab = "bookings" | "reviews" | "instructors";

export function AdminDashboard({
  bookings,
  reviews,
  instructors,
  demo,
}: {
  bookings: Booking[];
  reviews: (ReviewSummary & { instructor_name?: string })[];
  instructors: Instructor[];
  demo: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("bookings");
  const [busy, setBusy] = useState<string | null>(null);

  async function act(type: string, id: string, status: string) {
    setBusy(id + status);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status }),
    });
    setBusy(null);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const newBookings = bookings.filter((b) => b.status === "requested").length;

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-fairway-900">관리자</h1>
        <button onClick={logout} className="text-sm font-semibold text-fairway-500 hover:text-fairway-700">
          로그아웃
        </button>
      </div>

      {demo && (
        <p className="mt-4 rounded-lg bg-gold-100 p-3 text-sm text-gold-900">
          데모 모드입니다. Supabase(서비스 롤 키 포함)를 연결하면 실제 예약·리뷰가 표시되고
          상태 변경이 저장됩니다.
        </p>
      )}

      {/* 탭 */}
      <div className="mt-6 flex gap-1 border-b border-fairway-100">
        <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")}>
          예약 관리 {newBookings > 0 && <Count n={newBookings} />}
        </TabBtn>
        <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}>
          리뷰 승인 {pendingReviews > 0 && <Count n={pendingReviews} />}
        </TabBtn>
        <TabBtn active={tab === "instructors"} onClick={() => setTab("instructors")}>
          프로 목록
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "bookings" && (
          <Panel empty={bookings.length === 0} emptyText="아직 예약 요청이 없습니다.">
            {bookings.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-fairway-900">{b.student_name}</span>
                    <span className="ml-2 text-sm text-fairway-500">{b.student_phone}</span>
                  </div>
                  <StatusPill label={BOOKING_STATUS_LABELS[b.status] ?? b.status} status={b.status} />
                </div>
                <div className="mt-2 text-sm text-fairway-600">
                  프로: <b>{b.instructor_name ?? b.instructor_id}</b>
                  {b.preferred_date && <> · 희망: {b.preferred_date} {b.preferred_time}</>}
                  {b.region && <> · {b.region}</>}
                </div>
                {b.goal && <p className="mt-1 text-sm text-fairway-500">“{b.goal}”</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(["confirmed", "completed", "canceled", "rejected", "no_show"] as const).map((s) => (
                    <ActionBtn
                      key={s}
                      onClick={() => act("booking", b.id, s)}
                      busy={busy === b.id + s}
                      active={b.status === s}
                    >
                      {BOOKING_STATUS_LABELS[s]}
                    </ActionBtn>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
        )}

        {tab === "reviews" && (
          <Panel empty={reviews.length === 0} emptyText="아직 등록된 리뷰가 없습니다.">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-fairway-900">{r.student_name_masked}</span>
                    <Stars value={r.rating_total} size={14} />
                    {r.instructor_name && (
                      <span className="text-sm text-fairway-500">→ {r.instructor_name}</span>
                    )}
                  </div>
                  <StatusPill label={REVIEW_STATUS_LABELS[r.status] ?? r.status} status={r.status} />
                </div>
                <p className="mt-2 text-sm text-fairway-700">{r.content}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ActionBtn onClick={() => act("review", r.id, "visible")} busy={busy === r.id + "visible"} active={r.status === "visible"}>
                    승인(노출)
                  </ActionBtn>
                  <ActionBtn onClick={() => act("review", r.id, "hidden")} busy={busy === r.id + "hidden"} active={r.status === "hidden"}>
                    숨김
                  </ActionBtn>
                  <ActionBtn onClick={() => act("review", r.id, "pending")} busy={busy === r.id + "pending"} active={r.status === "pending"}>
                    대기로
                  </ActionBtn>
                </div>
              </div>
            ))}
          </Panel>
        )}

        {tab === "instructors" && (
          <Panel empty={instructors.length === 0} emptyText="등록된 프로가 없습니다.">
            {instructors.map((i) => (
              <div key={i.id} className="card flex items-center justify-between p-4">
                <div>
                  <span className="font-bold text-fairway-900">{i.display_name}</span>
                  <span className="ml-2 text-sm text-fairway-500">
                    {i.region} · {i.specialties.join(", ")}
                  </span>
                </div>
                <StatusPill
                  label={i.verification_status === "verified" ? "검증완료" : "미검증"}
                  status={i.verification_status}
                />
              </div>
            ))}
            <p className="px-1 pt-2 text-xs text-fairway-400">
              * 프로 등록/수정, 자격증 증빙 확인, 배지 부여는 현재 Supabase 대시보드에서 진행합니다.
              (프로 편집 UI는 다음 단계 개발 예정)
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
        active ? "border-fairway-700 text-fairway-900" : "border-transparent text-fairway-400 hover:text-fairway-600"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{n}</span>
  );
}

function Panel({ empty, emptyText, children }: { empty: boolean; emptyText: string; children: React.ReactNode }) {
  if (empty) return <div className="card p-12 text-center text-fairway-500">{emptyText}</div>;
  return <div className="space-y-3">{children}</div>;
}

function ActionBtn({
  onClick,
  busy,
  active,
  children,
}: {
  onClick: () => void;
  busy: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        active
          ? "border-fairway-600 bg-fairway-700 text-white"
          : "border-fairway-200 text-fairway-700 hover:bg-fairway-50"
      }`}
    >
      {busy ? "..." : children}
    </button>
  );
}

function StatusPill({ label, status }: { label: string; status: string }) {
  const tone =
    status === "confirmed" || status === "visible" || status === "verified" || status === "completed"
      ? "bg-fairway-100 text-fairway-800"
      : status === "requested" || status === "pending"
        ? "bg-gold-100 text-gold-800"
        : "bg-rose-50 text-rose-600";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{label}</span>;
}
