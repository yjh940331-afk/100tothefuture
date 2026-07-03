import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "회원정보 입력",
  robots: { index: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/mypage";

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);

  const supabase = await getSupabaseServer();
  const { data: student } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="container-page max-w-lg py-10">
      <h1 className="text-xl font-black text-fairway-900">환영합니다! 👋</h1>
      <p className="mt-1.5 text-[13px] text-fairway-500">
        원활한 상담·예약을 위해 기본 정보를 입력해주세요.
      </p>
      <div className="mt-6">
        <ProfileForm
          initial={{
            name: profile.name,
            nickname: profile.nickname,
            phone: profile.phone,
            region: profile.region,
            marketing_agreed: profile.marketing_agreed,
            kakao_channel_agreed: profile.kakao_channel_agreed,
            current_avg_score: student?.current_avg_score,
            target_score: student?.target_score,
            goal: student?.goal,
          }}
          markOnboarded
          submitLabel="시작하기"
          redirectTo={next}
        />
      </div>
    </div>
  );
}
