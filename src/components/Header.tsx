import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-fairway-100 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fairway-700 text-sm font-black text-gold-300">
            100
          </span>
          <span className="text-lg font-extrabold tracking-tight text-fairway-900">
            to the Future
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/pros"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-fairway-700 hover:bg-fairway-50"
          >
            레슨프로 찾기
          </Link>
          <a
            href="mailto:contact@100tothefuture.com?subject=레슨프로 등록 문의"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fairway-700 hover:bg-fairway-50 sm:inline"
          >
            프로 등록
          </a>
          <Link href="/pros" className="btn-primary !px-4 !py-2">
            프로 찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}
