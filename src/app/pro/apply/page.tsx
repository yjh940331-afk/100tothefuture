import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getInstructorApplicationForUser } from "@/lib/data";
import { ProApplyForm } from "@/components/ProApplyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "프로 신청",
  robots: { index: false },
};

export default async function ProApplyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/pro/apply");
  if (!profile.onboarded) redirect("/onboarding?next=/pro/apply");
  if (profile.role === "instructor") redirect("/pro/dashboard");

  const application = await getInstructorApplicationForUser(profile.id);

  return (
    <main className="container-page max-w-3xl py-8">
      <Link
        href="/"
        className="text-[13px] font-semibold text-fairway-500 hover:text-fairway-800"
      >
        ← 홈
      </Link>
      <div className="mt-4 rounded-lg border border-fairway-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-gold-700">Pro Partner</p>
        <h1 className="mt-1 text-2xl font-black text-fairway-900">프로 신청</h1>
        <p className="mt-2 text-sm leading-6 text-fairway-600">
          카카오 계정 하나로 일반회원과 프로 활동을 구분합니다. 승인되면 프로
          대시보드에서 리드와 예약을 관리할 수 있어요.
        </p>
        {application && (
          <div className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm text-fairway-700">
            현재 상태:{" "}
            <b>
              {application.status === "rejected"
                ? "반려"
                : application.status === "approved"
                  ? "승인 완료"
                  : "승인 대기"}
            </b>
            {application.admin_memo && (
              <p className="mt-1 text-fairway-600">
                메모: {application.admin_memo}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        <ProApplyForm
          initial={application}
          member={{
            name: profile.name ?? profile.nickname,
            phone: profile.phone,
            region: profile.region,
          }}
        />
      </div>
    </main>
  );
}
