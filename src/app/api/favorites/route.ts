import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

// 찜(좋아요) 추가/삭제. 로그인 필요.
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다.", needLogin: true }, { status: 401 });
  }

  const { instructor_id, action } = await req.json().catch(() => ({}));
  if (!instructor_id) {
    return NextResponse.json({ ok: false, error: "instructor_id 누락" }, { status: 400 });
  }

  if (action === "remove") {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("student_user_id", user.id)
      .eq("instructor_id", instructor_id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, active: false });
  }

  // add (중복은 unique 제약으로 무시)
  const { error } = await supabase
    .from("favorites")
    .insert({ student_user_id: user.id, instructor_id });
  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, active: true });
}
