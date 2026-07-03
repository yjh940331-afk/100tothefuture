import Link from "next/link";

// 로그아웃 사용자에게 카카오 로그인을 유도하는 배너 (폼 상단 등에 배치)
export function LoginPrompt({ next = "/mypage" }: { next?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gold-200 bg-gold-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-black text-fairway-900">
          로그인하면 더 편해요 🙌
        </p>
        <p className="mt-0.5 text-[13px] leading-5 text-fairway-600">
          이름·연락처가 자동 입력되고, 내 예약·찜을 한눈에 관리할 수 있어요.
        </p>
      </div>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#FEE500] px-4 py-2.5 text-[13px] font-bold text-[#191600] transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 3C6.9 3 3 6.3 3 10.3c0 2.5 1.7 4.7 4.2 6L6.3 20c-.1.3.3.6.5.4l3.9-2.6c.4 0 .9.1 1.3.1 5.1 0 9-3.3 9-7.6S17.1 3 12 3z" />
        </svg>
        카카오 3초 로그인
      </Link>
    </div>
  );
}
