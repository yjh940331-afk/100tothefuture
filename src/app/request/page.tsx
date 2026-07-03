import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/lib/seo";
import { GOLF_IMAGES } from "@/lib/golf-images";
import { Break100Carousel } from "@/components/Break100Carousel";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = pageSeo({
  title: "100타 탈출 진단 요청",
  description:
    "OB, 아이언 컨택, 숏게임, 퍼팅처럼 현재 고민을 고르면 100타 탈출에 맞는 골프 레슨 프로 후보를 찾아드립니다.",
  path: "/request",
  keywords: [
    "100타 탈출",
    "골프 레슨 견적",
    "골프 레슨 매칭",
    "초보 골프 레슨",
  ],
});

const HERO_IMAGE = GOLF_IMAGES.hero.request;

type SP = Record<string, string | string[] | undefined>;

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const initialGoal = typeof sp.goal === "string" ? sp.goal : undefined;

  const profile = await getCurrentProfile();
  const member = profile
    ? { name: profile.name, phone: profile.phone, region: profile.region }
    : null;

  return (
    <>
      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div
          className="motion-hero-drift absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/90 to-fairway-950/35" />
        <div className="container-page relative grid min-h-[420px] items-center gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="motion-fade-up max-w-3xl">
            <p className="text-sm font-bold text-gold-200">Break 100</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              100타 탈출,
              <br />
              먼저 진단하세요
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-fairway-100 sm:text-base">
              OB, 아이언, 숏게임, 퍼팅 중 내 고민을 고르면 맞는 프로 후보를
              좁혀드립니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="#request-form" className="btn-gold">
                진단 시작
              </Link>
              <Link
                href="/pros"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                프로 보기
              </Link>
            </div>
          </div>
          <Break100Carousel className="motion-fade-up motion-delay-1" />
        </div>
      </section>

      <main className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section id="request-form">
          <QuoteRequestForm initialGoal={initialGoal} member={member} />
        </section>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="motion-fade-up motion-delay-1 rounded-lg border border-fairway-100 bg-white p-4 shadow-sm">
            <h2 className="text-base font-black text-fairway-900">매칭 기준</h2>
            <ul className="mt-3 space-y-2 text-sm text-fairway-600">
              <li>고민 유형</li>
              <li>지역과 시간</li>
              <li>후기와 검증 뱃지</li>
            </ul>
          </div>
          <div className="motion-fade-up motion-delay-2 rounded-lg border border-fairway-100 bg-cream p-4">
            <p className="text-sm font-bold text-fairway-800">
              프로로 활동하시나요?
            </p>
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
