"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const DISMISS_KEY = "ttf_login_popup_dismissed";
const DELAY_MS = 3000;

// 홈 진입 3초 후, 로그아웃 사용자에게만 로그인 유도 팝업 (뒤 blur, 닫기 가능, 한 번 닫으면 다시 안 뜸)
export function LoginPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    let timer: number | undefined;
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) return; // 이미 로그인했으면 안 띄움
      timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    });
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="로그인 안내"
    >
      {/* 뒤 배경 blur + 클릭 시 닫기 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={close}
        className="motion-backdrop-in absolute inset-0 bg-fairway-950/40 backdrop-blur-sm"
      />

      <div className="motion-pop-in relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-fairway-700 backdrop-blur transition-colors hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* 헤더 (브랜드 그린) */}
        <div className="relative overflow-hidden bg-fairway-950 px-6 pb-8 pt-9 text-center text-white">
          <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_30%_20%,#3a7f52,transparent_45%),radial-gradient(circle_at_80%_0%,#c8964a,transparent_40%)]" />
          <div className="relative">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-gold-300 backdrop-blur">
              100
            </span>
            <h2 className="mt-4 text-xl font-black leading-snug">
              로그인하고
              <br />
              <span className="text-gold-300">100타 탈출</span> 시작하세요
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-fairway-100">
              찜한 프로, 내 예약, 맞춤 추천을 한 곳에서 관리해요.
            </p>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          <ul className="space-y-2 text-[13px] text-fairway-700">
            <li className="flex items-center gap-2">
              <Check /> 이름·연락처 자동 입력으로 예약 3초
            </li>
            <li className="flex items-center gap-2">
              <Check /> 마음에 드는 프로 ♥ 찜하고 모아보기
            </li>
            <li className="flex items-center gap-2">
              <Check /> 내 예약·상담 내역 한눈에 확인
            </li>
          </ul>

          <Link
            href="/login?next=/mypage"
            onClick={close}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-[15px] font-bold text-[#191600] transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 3C6.9 3 3 6.3 3 10.3c0 2.5 1.7 4.7 4.2 6L6.3 20c-.1.3.3.6.5.4l3.9-2.6c.4 0 .9.1 1.3.1 5.1 0 9-3.3 9-7.6S17.1 3 12 3z" />
            </svg>
            카카오로 3초 시작하기
          </Link>

          <button
            type="button"
            onClick={close}
            className="mt-2 w-full py-2 text-center text-[13px] font-medium text-fairway-400 hover:text-fairway-600"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-fairway-500" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
