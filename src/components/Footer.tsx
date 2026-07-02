import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-fairway-100 bg-[#101712] text-fairway-100">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-fairway-950">
              100
            </span>
            <span className="font-extrabold text-white">to the Future</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-fairway-300">
            골퍼의 목표와 검증된 레슨 프로를 연결하는 골프 레슨 매칭 플랫폼.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">서비스</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li>
              <Link href="/request" className="hover:text-white">
                맞춤 견적 요청
              </Link>
            </li>
            <li>
              <Link href="/pros" className="hover:text-white">
                프로 찾기
              </Link>
            </li>
            <li>
              <a href="mailto:contact@100tothefuture.com" className="hover:text-white">
                프로 등록 문의
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">약관·정책</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li>
              <Link href="/terms" className="hover:text-white">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                개인정보처리방침
              </Link>
            </li>
            <li>
              <Link href="/policy/reviews" className="hover:text-white">
                리뷰 운영정책
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-white">문의</h4>
          <ul className="space-y-2 text-sm text-fairway-300">
            <li>contact@100tothefuture.com</li>
            <li>
              <Link href="/admin" className="hover:text-white">
                관리자
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-fairway-400">
        © {new Date().getFullYear()} 100 to the Future. All rights reserved.
      </div>
    </footer>
  );
}
