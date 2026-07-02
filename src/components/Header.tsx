"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const NAV = [
  { href: "/pros", label: "프로 찾기" },
  { href: "/request", label: "견적 요청" },
  { href: "/info", label: "골프정보" },
  { href: "/bookings", label: "내 예약" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // 라우트 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-fairway-100 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link href="/" className="min-w-0" aria-label="100 to the Future 홈">
          <BrandLogo />
        </Link>

        {/* 데스크톱 네비 */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
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
          <Link href="/request" className="btn-primary hidden !min-h-9 !px-4 sm:inline-flex">
            맞춤 견적
          </Link>
          {/* 모바일 햄버거 */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fairway-800 hover:bg-fairway-50 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 슬라이드 메뉴 (사이드바) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-fairway-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-fairway-100 px-5 sm:h-16">
              <BrandLogo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fairway-800 hover:bg-fairway-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-3">
              {[{ href: "/", label: "홈" }, ...NAV].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                    isActive(n.href) ? "bg-fairway-50 text-fairway-950" : "text-fairway-700 hover:bg-fairway-50"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <a
                href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
                className="rounded-lg px-3 py-3 text-sm font-semibold text-fairway-700 hover:bg-fairway-50"
              >
                프로 등록 문의
              </a>
            </nav>
            <div className="border-t border-fairway-100 p-3">
              <Link href="/request" className="btn-primary w-full">
                맞춤 견적 요청
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
