import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "정보 수정", robots: { index: false } };

export default async function MyPageEdit() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/mypage/edit");

  const supabase = await getSupabaseServer();
  const { data: student } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="container-page max-w-lg py-8">
      <Link href="/mypage" className="text-[13px] font-semibold text-fairway-500 hover:text-fairway-800">
        ← 마이페이지
      </Link>
      <h1 className="mt-3 text-xl font-black text-fairway-900">정보 수정</h1>
      <div className="mt-6">
        <ProfileForm
          initial={{
            name: profile.name,
            nickname: profile.nickname,
            phone: profile.phone,
            region: profile.region,
            marketing_agreed: profile.marketing_agreed,
            current_avg_score: student?.current_avg_score,
            target_score: student?.target_score,
            goal: student?.goal,
          }}
          submitLabel="저장"
          redirectTo="/mypage"
        />
      </div>
    </div>
  );
}
