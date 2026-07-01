import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-fairway-100 bg-fairway-950 text-fairway-100">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fairway-700 text-xs font-black text-gold-300">
              100
            </span>
            <span className="font-extrabold text-white">to the Future</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-fairway-300">
            100타 탈출을 원하는 골퍼와 검증된 레슨프로를 연결하는 레슨 중개 플랫폼.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">서비스</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li><Link href="/pros" className="hover:text-white">레슨프로 찾기</Link></li>
            <li><a href="mailto:contact@100tothefuture.com" className="hover:text-white">레슨프로 등록</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">약관·정책</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
            <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
            <li><Link href="/policy/reviews" className="hover:text-white">리뷰 운영정책</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">문의</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li>contact@100tothefuture.com</li>
            <li><Link href="/admin" className="hover:text-white">관리자</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-fairway-900/60 py-5 text-center text-xs text-fairway-400">
        © {new Date().getFullYear()} 100 to the Future. All rights reserved.
      </div>
    </footer>
  );
}
