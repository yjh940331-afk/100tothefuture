"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function LoginPanel() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const error = params.get("error");
  const next = params.get("next") ?? "/mypage";

  async function loginKakao() {
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setLoading(false);
    // 성공 시 카카오로 리다이렉트됨
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-12">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-fairway-950 text-sm font-black text-white">
          100
        </span>
        <h1 className="mt-4 text-xl font-black text-fairway-900">로그인 / 회원가입</h1>
        <p className="mt-1.5 text-[13px] text-fairway-500">
          카카오로 3초 만에 시작하고, 예약·찜·후기를 관리하세요.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-center text-[13px] text-rose-600">
          로그인에 실패했어요. 다시 시도해주세요.
        </p>
      )}

      <button
        onClick={loginKakao}
        disabled={loading}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-[15px] font-bold text-[#191600] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 3C6.9 3 3 6.3 3 10.3c0 2.5 1.7 4.7 4.2 6L6.3 20c-.1.3.3.6.5.4l3.9-2.6c.4 0 .9.1 1.3.1 5.1 0 9-3.3 9-7.6S17.1 3 12 3z" />
        </svg>
        {loading ? "이동 중..." : "카카오로 시작하기"}
      </button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-fairway-400">
        로그인 시 <a href="/terms" className="underline">이용약관</a> 및{" "}
        <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
      </p>
    </div>
  );
}
