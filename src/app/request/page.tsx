import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/lib/seo";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";

export const metadata: Metadata = pageSeo({
  title: "100타 탈출 진단 요청",
  description:
    "OB, 아이언 컨택, 숏게임, 퍼팅처럼 현재 고민을 고르면 100타 탈출에 맞는 골프 레슨 프로 후보를 찾아드립니다.",
  path: "/request",
  keywords: ["100타 탈출", "골프 레슨 견적", "골프 레슨 매칭", "초보 골프 레슨"],
});

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1800&q=75";

type SP = Record<string, string | string[] | undefined>;

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const initialGoal = typeof sp.goal === "string" ? sp.goal : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/90 to-fairway-950/35" />
        <div className="container-page relative grid min-h-[340px] gap-6 py-10 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-gold-200">Break 100</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              100타 탈출,
              <br />
              먼저 진단하세요
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-fairway-100 sm:text-base">
              OB, 아이언, 숏게임, 퍼팅 중 내 고민을 고르면 맞는 프로 후보를 좁혀드립니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="#request-form" className="btn-gold">
                진단 시작
              </Link>
              <Link href="/pros" className="btn border border-white/30 text-white hover:bg-white/10">
                프로 보기
              </Link>
            </div>
          </div>
          <div className="grid rounded-lg border border-white/15 bg-white/10 backdrop-blur">
            {[
              ["01", "진단", "고민 유형 선택"],
              ["02", "매칭", "조건 맞는 프로 확인"],
              ["03", "상담", "일정 조율 후 예약"],
            ].map(([step, title, desc]) => (
              <div key={step} className="flex items-center gap-3 border-b border-white/10 p-3 last:border-b-0">
                <p className="text-xs font-black text-gold-200">{step}</p>
                <div className="min-w-0">
                  <h2 className="font-bold text-white">{title}</h2>
                  <p className="text-xs text-fairway-100">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section id="request-form">
          <QuoteRequestForm initialGoal={initialGoal} />
        </section>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border border-fairway-100 bg-white p-4 shadow-sm">
            <h2 className="text-base font-black text-fairway-900">매칭 기준</h2>
            <ul className="mt-3 space-y-2 text-sm text-fairway-600">
              <li>고민 유형</li>
              <li>지역과 시간</li>
              <li>후기와 검증 뱃지</li>
            </ul>
          </div>
          <div className="rounded-lg border border-fairway-100 bg-cream p-4">
            <p className="text-sm font-bold text-fairway-800">프로로 활동하시나요?</p>
            <a
              href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
              className="btn-primary mt-3 inline-flex w-full justify-center"
            >
              프로 등록 문의
            </a>
          </div>
        </aside>
      </main>
    </>
  );
}
