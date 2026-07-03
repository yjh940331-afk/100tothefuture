"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const NAV = [
  { href: "/pros", label: "프로 찾기" },
  { href: "/request", label: "견적 요청" },
  { href: "/info", label: "골프정보" },
  { href: "/bookings", label: "내 예약" },
];

const MOBILE_GROUPS = [
  {
    title: "레슨 예약",
    items: [
      { href: "/request", label: "맞춤 견적", desc: "조건 먼저 입력" },
      { href: "/pros", label: "프로 찾기", desc: "프로필 직접 비교" },
      { href: "/bookings", label: "내 예약", desc: "예약 조회" },
    ],
  },
  {
    title: "골프 정보",
    items: [{ href: "/info", label: "골프정보", desc: "장비·웨어·이야기" }],
  },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(!!session?.user),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-[70] border-b border-fairway-100 bg-white/90 backdrop-blur-xl">
        <div className="container-page flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link href="/" className="min-w-0" aria-label="100 to the Future 홈">
            <BrandLogo />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="주요 메뉴"
          >
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(n.href)
                    ? "text-fairway-950"
                    : "text-fairway-500 hover:bg-fairway-50 hover:text-fairway-950"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-fairway-500 hover:bg-fairway-50 hover:text-fairway-950"
            >
              프로 등록
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={authed ? "/mypage" : "/login"}
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-600 hover:bg-fairway-50 hover:text-fairway-950 sm:inline-flex"
            >
              {authed ? "마이페이지" : "로그인"}
            </Link>
            <Link
              href="/request"
              className="btn-primary hidden !min-h-9 !px-4 sm:inline-flex"
            >
              맞춤 견적
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fairway-800 hover:bg-fairway-50 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="모바일 메뉴"
        >
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="motion-backdrop-in absolute inset-0 bg-fairway-950/55 backdrop-blur-[2px]"
          />

          <aside className="motion-drawer-in absolute inset-y-0 right-0 flex h-[100dvh] w-[min(86vw,360px)] max-w-full flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-fairway-100 px-4">
              <BrandLogo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fairway-800 hover:bg-fairway-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <Link
                href="/"
                className={`block rounded-lg border px-3 py-3 ${
                  isActive("/")
                    ? "border-fairway-200 bg-fairway-50"
                    : "border-fairway-100 bg-white"
                }`}
              >
                <p className="text-sm font-black text-fairway-950">
                  100 to the Future
                </p>
                <p className="mt-1 text-[12px] leading-4 text-fairway-500">
                  100타 탈출을 위한 골프 레슨 매칭
                </p>
              </Link>

              <nav className="mt-4 space-y-4" aria-label="모바일 주요 메뉴">
                {MOBILE_GROUPS.map((group) => (
                  <section key={group.title}>
                    <h2 className="px-1 text-[11px] font-black uppercase text-gold-700">
                      {group.title}
                    </h2>
                    <div className="mt-2 space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors ${
                            isActive(item.href)
                              ? "bg-fairway-900 text-white"
                              : "text-fairway-800 hover:bg-fairway-50"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-black">
                              {item.label}
                            </span>
                            <span
                              className={`mt-0.5 block text-[12px] ${isActive(item.href) ? "text-fairway-100" : "text-fairway-500"}`}
                            >
                              {item.desc}
                            </span>
                          </span>
                          <span aria-hidden className="text-lg leading-none">
                            ›
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}

                <section>
                  <h2 className="px-1 text-[11px] font-black uppercase text-gold-700">
                    운영
                  </h2>
                  <a
                    href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
                    className="mt-2 flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-fairway-800 hover:bg-fairway-50"
                  >
                    <span>
                      <span className="block text-sm font-black">
                        프로 등록 문의
                      </span>
                      <span className="mt-0.5 block text-[12px] text-fairway-500">
                        검증 프로 입점
                      </span>
                    </span>
                    <span aria-hidden className="text-lg leading-none">
                      ›
                    </span>
                  </a>
                </section>
              </nav>
            </div>

            <div className="shrink-0 space-y-2 border-t border-fairway-100 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
              <Link href={authed ? "/mypage" : "/login"} className="btn-outline w-full">
                {authed ? "마이페이지" : "로그인 / 회원가입"}
              </Link>
              <Link href="/request" className="btn-primary w-full">
                맞춤 견적 요청
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
