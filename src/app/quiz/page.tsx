import type { Metadata } from "next";
import Link from "next/link";
import { GolfRookieQuiz } from "@/components/GolfRookieQuiz";
import { pageSeo } from "@/lib/seo";

export const metadata: Metadata = pageSeo({
  title: "골린이 판독기",
  description:
    "골프 룰, 매너, 레슨 준비 습관을 1분 안에 확인하고 결과를 카톡이나 인스타로 공유하는 골프 초보 판독 퀴즈.",
  path: "/quiz",
  keywords: [
    "골린이 테스트",
    "골프 초보 퀴즈",
    "골프 초보 테스트",
    "골프 매너 퀴즈",
  ],
});

export default function QuizPage() {
  return (
    <>
      <section className="border-b border-fairway-800 bg-fairway-950 text-white">
        <div className="container-page py-6 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-black uppercase text-fairway-950">
              Share Quiz
            </span>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-black text-fairway-100">
              100점 만점
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">
                골린이 판독기
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-fairway-100 sm:text-sm">
                친구 점수 내고, 결과 카드로 바로 공유하세요. 고득점은 자랑,
                저득점은 놀림 방지 선제공격입니다.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-black text-white transition hover:bg-white/10"
            >
              홈으로
            </Link>
          </div>
        </div>
      </section>

      <GolfRookieQuiz showStandaloneLink={false} />
    </>
  );
}
