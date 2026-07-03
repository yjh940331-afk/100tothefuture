import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

// 카카오 OAuth 콜백 — 인증 코드를 세션으로 교환 후 리다이렉트
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mypage";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    // 온보딩 여부 확인 → 미완료면 온보딩으로
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.onboarded) {
        return NextResponse.redirect(`${origin}/onboarding?next=${encodeURIComponent(next)}`);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=nocode`);
}
