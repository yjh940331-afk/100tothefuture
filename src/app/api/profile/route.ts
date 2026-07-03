import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

const numOrNull = (v: unknown) =>
  v === undefined || v === null || v === "" ? null : Number(v);

// 프로필 저장 (온보딩 & 정보수정 공용). 로그인 필요.
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ ok: false, error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: body.name.trim(),
      nickname: body.nickname?.trim() || body.name.trim(),
      phone: body.phone.trim(),
      region: body.region || null,
      marketing_agreed: !!body.marketing_agreed,
      ...(body.onboarded ? { onboarded: true } : {}),
    })
    .eq("id", user.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // 수강생 골프 정보(선택)
  if (
    body.current_avg_score !== undefined ||
    body.target_score !== undefined ||
    body.goal !== undefined
  ) {
    await supabase.from("student_profiles").upsert({
      user_id: user.id,
      current_avg_score: numOrNull(body.current_avg_score),
      target_score: numOrNull(body.target_score),
      goal: body.goal || null,
    });
  }

  return NextResponse.json({ ok: true });
}
