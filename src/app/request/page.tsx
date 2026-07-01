import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";

export const metadata: Metadata = {
  title: "골프 레슨 견적 요청",
  description:
    "지역, 목표, 시간, 예산을 남기면 100 to the Future가 조건에 맞는 검증 골프 레슨 프로를 연결합니다.",
};

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
        <div className="container-page relative grid min-h-[430px] gap-8 py-14 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-gold-200">Golf lesson matching</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              원하는 조건만 남기면
              <br />
              맞는 골프 프로를 찾아드릴게요
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-fairway-100">
              숨고처럼 요청서를 작성하고, 골프 레슨에 필요한 경력·지역·레슨 방식·후기를 기준으로
              비교 가능한 제안을 받아보는 흐름입니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link href="#request-form" className="btn-gold">
                견적 요청 시작
              </Link>
              <Link href="/pros" className="btn border border-white/30 text-white hover:bg-white/10">
                프로 직접 보기
              </Link>
            </div>
          </div>
          <div className="grid rounded-lg border border-white/15 bg-white/10 backdrop-blur">
            {[
              ["01", "요청서 작성", "지역, 목표, 시간, 예산 입력"],
              ["02", "조건 확인", "검증 프로 후보와 가능 시간 비교"],
              ["03", "상담 연결", "제안 확인 후 예약 또는 패키지 상담"],
            ].map(([step, title, desc]) => (
              <div key={step} className="border-b border-white/10 p-4 last:border-b-0">
                <p className="text-xs font-black text-gold-200">{step}</p>
                <h2 className="mt-1 font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-fairway-100">{desc}</p>
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
          <div className="rounded-lg border border-fairway-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-fairway-900">좋은 견적을 받는 팁</h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-fairway-600">
              <li>목표는 구체적일수록 좋아요. 예: 100타 탈출, 드라이버 슬라이스, 필드 동반.</li>
              <li>가능 요일과 시간대를 넓게 남기면 후보 프로가 더 많아집니다.</li>
              <li>예산 범위를 쓰면 1회 체험과 패키지 제안을 비교하기 쉽습니다.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-fairway-100 bg-cream p-5">
            <p className="text-sm font-bold text-fairway-800">프로로 활동하시나요?</p>
            <p className="mt-2 text-sm leading-6 text-fairway-600">
              검증 프로 등록 후 조건이 맞는 고객 요청을 받을 수 있습니다.
            </p>
            <a
              href="mailto:contact@100tothefuture.com?subject=골프 레슨 프로 등록 문의"
              className="btn-primary mt-4 inline-flex w-full justify-center"
            >
              프로 등록 문의
            </a>
          </div>
        </aside>
      </main>
    </>
  );
}
