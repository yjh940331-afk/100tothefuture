import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  getInstructorApplicationForUser,
  getProDashboardForUser,
} from "@/lib/data";
import { ProQuoteForm } from "@/components/ProQuoteForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "프로 대시보드",
  robots: { index: false },
};

const BOOKING_STATUS: Record<string, string> = {
  requested: "요청",
  confirmed: "확정",
  completed: "완료",
  canceled: "취소",
  rejected: "거절",
  no_show: "노쇼",
};

export default async function ProDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/pro/dashboard");
  if (!profile.onboarded) redirect("/onboarding?next=/pro/dashboard");

  const [application, dashboard] = await Promise.all([
    getInstructorApplicationForUser(profile.id),
    getProDashboardForUser(profile.id),
  ]);

  if (profile.role !== "instructor" || !dashboard.instructor) {
    if (!application) redirect("/pro/apply");
    return (
      <main className="container-page max-w-2xl py-10">
        <Link
          href="/mypage"
          className="text-[13px] font-semibold text-fairway-500 hover:text-fairway-800"
        >
          ← 마이페이지
        </Link>
        <div className="mt-4 rounded-lg border border-fairway-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-gold-700">Pro Partner</p>
          <h1 className="mt-2 text-2xl font-black text-fairway-900">
            프로 승인 대기 중
          </h1>
          <p className="mt-2 text-sm leading-6 text-fairway-600">
            관리자 승인 후 리드·예약·견적 CRM을 사용할 수 있습니다.
          </p>
          <div className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm text-fairway-700">
            현재 상태: <b>{applicationStatus(application.status)}</b>
            {application.admin_memo && (
              <p className="mt-1 text-fairway-600">
                메모: {application.admin_memo}
              </p>
            )}
          </div>
          <Link href="/pro/apply" className="btn-outline mt-5">
            신청서 수정
          </Link>
        </div>
      </main>
    );
  }

  const instructor = dashboard.instructor;
  const requestedBookings = dashboard.bookings.filter(
    (booking) => booking.status === "requested",
  ).length;
  const activeLeads = dashboard.leads.filter((lead) =>
    ["open", "contacted", "quoted"].includes(lead.status),
  ).length;

  return (
    <main className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gold-700">Pro Dashboard</p>
          <h1 className="mt-1 text-2xl font-black text-fairway-900">
            {instructor.display_name}
          </h1>
          <p className="mt-1 text-sm text-fairway-500">
            {instructor.region} · {instructor.specialties.join(", ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/pros/${instructor.slug}`} className="btn-outline">
            공개 프로필
          </Link>
          <Link href="/mypage" className="btn-primary">
            마이페이지
          </Link>
        </div>
      </div>

      {dashboard.setupNeeded && (
        <p className="mt-5 rounded-lg bg-gold-100 p-3 text-sm font-semibold text-gold-900">
          프로 CRM 테이블 준비가 필요합니다. Supabase SQL Editor에서
          supabase/pro-platform.sql을 실행해주세요.
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="신규 예약" value={`${requestedBookings}건`} />
        <Metric label="활성 리드" value={`${activeLeads}건`} />
        <Metric label="누적 예약" value={`${dashboard.bookings.length}건`} />
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-fairway-900">
              리드·견적 CRM
            </h2>
            <p className="mt-1 text-sm text-fairway-500">
              매칭된 요청에 견적 메시지를 남길 수 있습니다.
            </p>
          </div>
          <Link href="/request" className="text-sm font-bold text-fairway-700">
            고객 요청서 보기
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {dashboard.leads.length === 0 ? (
            <Empty text="아직 배정된 리드가 없습니다." />
          ) : (
            dashboard.leads.map((lead) => (
              <article key={lead.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-fairway-900">
                        {lead.customer_name}
                      </h3>
                      <Status text={lead.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-fairway-600">
                      {lead.customer_phone}
                    </p>
                  </div>
                  <p className="text-xs text-fairway-400">
                    {new Date(lead.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <Info label="지역" value={lead.region} />
                  <Info label="목표" value={listText(lead.goals)} />
                  <Info
                    label="희망 시간"
                    value={
                      [listText(lead.preferred_days), lead.preferred_time_slot]
                        .filter((item) => item && item !== "-")
                        .join(" · ") || "-"
                    }
                  />
                  <Info label="장소" value={listText(lead.lesson_places)} />
                  <Info label="스코어" value={lead.score_range ?? "-"} />
                  <Info
                    label="예산"
                    value={moneyRange(lead.budget_min, lead.budget_max)}
                  />
                </dl>
                {lead.memo && (
                  <p className="mt-3 rounded-lg bg-fairway-50 p-3 text-sm leading-6 text-fairway-700">
                    {lead.memo}
                  </p>
                )}
                <ProQuoteForm
                  requestId={lead.id}
                  initialMessage={lead.quote?.message}
                  initialPrice={lead.quote?.price}
                />
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-fairway-900">예약</h2>
        <div className="mt-3 space-y-2">
          {dashboard.bookings.length === 0 ? (
            <Empty text="아직 예약 요청이 없습니다." />
          ) : (
            dashboard.bookings.map((booking) => (
              <article
                key={booking.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <h3 className="font-bold text-fairway-900">
                    {booking.student_name}
                  </h3>
                  <p className="mt-1 text-sm text-fairway-500">
                    {booking.student_phone} ·{" "}
                    {[booking.preferred_date, booking.preferred_time]
                      .filter(Boolean)
                      .join(" ") || "일정 협의"}
                  </p>
                </div>
                <span className="rounded-full bg-fairway-50 px-2.5 py-1 text-xs font-bold text-fairway-700">
                  {BOOKING_STATUS[booking.status] ?? booking.status}
                </span>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function applicationStatus(status: string) {
  if (status === "approved") return "승인 완료";
  if (status === "rejected") return "반려";
  return "승인 대기";
}

function listText(values?: string[] | null) {
  return values?.length ? values.join(", ") : "-";
}

function moneyRange(min?: number | null, max?: number | null) {
  if (min && max)
    return `${min.toLocaleString("ko-KR")}~${max.toLocaleString("ko-KR")}원`;
  if (min) return `${min.toLocaleString("ko-KR")}원 이상`;
  if (max) return `${max.toLocaleString("ko-KR")}원 이하`;
  return "-";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-xl font-black text-fairway-900">{value}</div>
      <div className="mt-1 text-xs font-semibold text-fairway-500">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-fairway-100">
      <dt className="text-xs font-bold text-fairway-400">{label}</dt>
      <dd className="mt-1 font-semibold text-fairway-800">{value}</dd>
    </div>
  );
}

function Status({ text }: { text: string }) {
  const label: Record<string, string> = {
    open: "신규",
    contacted: "연락 완료",
    quoted: "견적",
    closed: "종료",
    canceled: "취소",
  };
  return (
    <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-gold-800">
      {label[text] ?? text}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="card p-8 text-center text-sm text-fairway-500">{text}</div>
  );
}
