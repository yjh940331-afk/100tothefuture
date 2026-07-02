import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 shadow-sm shadow-black/5 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-2.5" aria-label="100 to the Future 홈">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fairway-950 text-[13px] font-black text-white shadow-sm sm:h-9 sm:w-9 sm:text-sm">
            100
          </span>
          <span className="text-base font-black tracking-tight text-fairway-950 sm:text-lg">
            to the Future
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="주요 메뉴">
          <Link
            href="/request"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-600 hover:bg-fairway-50 hover:text-fairway-950 sm:inline-flex"
          >
            견적 요청
          </Link>
          <Link
            href="/pros"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-600 hover:bg-fairway-50 hover:text-fairway-950 sm:inline-flex"
          >
            프로 찾기
          </Link>
          <Link
            href="/bookings"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-600 hover:bg-fairway-50 hover:text-fairway-950 md:inline-flex"
          >
            내 예약
          </Link>
          <a
            href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-600 hover:bg-fairway-50 hover:text-fairway-950 lg:inline-flex"
          >
            프로 등록
          </a>
          <Link href="/request" className="btn-primary !min-h-9 !px-3.5 !py-1.5 sm:!min-h-10 sm:!px-4 sm:!py-2">
            맞춤 견적
          </Link>
        </nav>
      </div>
    </header>
  );
}
