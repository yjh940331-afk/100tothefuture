import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "마이페이지", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  requested: "요청됨",
  confirmed: "확정",
  completed: "완료",
  canceled: "취소",
  rejected: "거절",
  no_show: "노쇼",
};

export default async function MyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/mypage");
  if (!profile.onboarded) redirect("/onboarding?next=/mypage");

  const supabase = await getSupabaseServer();
  const [{ data: bookings }, { data: favorites }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, status, preferred_date, preferred_time, created_at, instructors(display_name, slug)")
      .eq("student_user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("favorites")
      .select("instructor_id, instructors(slug, display_name, profile_image, region, price_from)")
      .eq("student_user_id", profile.id),
  ]);

  const bookingList = bookings ?? [];
  const favList = favorites ?? [];
  const lessonCount = bookingList.filter((b: any) => b.status === "completed").length;

  return (
    <div className="container-page max-w-3xl py-8">
      {/* 프로필 요약 */}
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-fairway-100">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-black text-fairway-400">
              {(profile.nickname || profile.name || "회").slice(0, 1)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-black text-fairway-900">
            {profile.nickname || profile.name || "회원"}님
          </h1>
          <p className="text-[13px] text-fairway-500">{profile.phone || "연락처 미등록"}</p>
        </div>
        <LogoutButton />
      </div>

      {/* 요약 지표 */}
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Metric label="받은 레슨" value={`${lessonCount}회`} />
        <Metric label="예약 내역" value={`${bookingList.length}건`} />
        <Metric label="찜한 프로" value={`${favList.length}명`} />
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/mypage/edit" className="btn-outline flex-1">정보 수정</Link>
        <Link href="/pros" className="btn-primary flex-1">프로 찾기</Link>
      </div>

      {/* 예약 내역 */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-extrabold text-fairway-900">내 예약</h2>
        {bookingList.length === 0 ? (
          <EmptyBox text="아직 예약 내역이 없어요." />
        ) : (
          <div className="space-y-2">
            {bookingList.map((b: any) => (
              <div key={b.id} className="card flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-bold text-fairway-900">
                    {b.instructors?.display_name ?? "프로"}
                  </div>
                  <div className="text-[13px] text-fairway-500">
                    {b.preferred_date ? `${b.preferred_date} ${b.preferred_time ?? ""}` : "일정 협의"}
                  </div>
                </div>
                <span className="rounded-full bg-fairway-50 px-2.5 py-1 text-[11px] font-bold text-fairway-700">
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 찜한 프로 */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-extrabold text-fairway-900">찜한 프로</h2>
        {favList.length === 0 ? (
          <EmptyBox text="찜한 프로가 없어요. 마음에 드는 프로를 ♥ 해보세요." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {favList.map((f: any) => (
              <Link key={f.instructor_id} href={`/pros/${f.instructors?.slug}`} className="card flex items-center gap-3 p-3 hover:border-fairway-200">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-fairway-100">
                  {f.instructors?.profile_image && (
                    <Image src={f.instructors.profile_image} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-fairway-900">{f.instructors?.display_name}</div>
                  <div className="text-[11px] text-fairway-500">{f.instructors?.region}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-lg font-black text-fairway-900">{value}</div>
      <div className="text-[11px] text-fairway-500">{label}</div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return <div className="card p-8 text-center text-[13px] text-fairway-500">{text}</div>;
}
