import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "골프 중계 허브",
  description:
    "국내외 골프 대회 일정, 라이브 중계 링크, 하이라이트와 레슨 예약을 함께 확인하는 100 to the Future 중계 허브입니다.",
};

const heroImage =
  "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=2200&q=75";

const liveCards = [
  {
    title: "이번 주 주요 대회",
    meta: "PGA / LPGA / KLPGA",
    body: "대회명, 라운드, 한국 시간 기준 시작 시각과 공식 중계 링크를 운영자가 업데이트하는 영역입니다.",
  },
  {
    title: "하이라이트 큐레이션",
    meta: "샷 메이킹 / 퍼팅 / 위기 탈출",
    body: "인상적인 장면을 레슨 포인트로 해석해, 시청자가 바로 연습 과제로 이어갈 수 있게 구성합니다.",
  },
  {
    title: "레슨 연결",
    meta: "중계 시청 후 바로 예약",
    body: "드라이버, 아이언, 숏게임처럼 중계에서 본 장면과 연결되는 검증 프로를 추천합니다.",
  },
];

const schedule = [
  { tour: "PGA", event: "주간 대회 일정", time: "업데이트 예정", link: "공식 중계 링크 등록 예정" },
  { tour: "LPGA", event: "여자 투어 주요 경기", time: "업데이트 예정", link: "공식 중계 링크 등록 예정" },
  { tour: "KLPGA", event: "국내 투어 라운드", time: "업데이트 예정", link: "공식 중계 링크 등록 예정" },
];

export default function LivePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/86 to-fairway-950/25" />
        <div className="container-page relative grid min-h-[520px] content-center py-16">
          <span className="inline-flex w-fit rounded-full border border-gold-300/40 bg-fairway-950/55 px-4 py-1.5 text-sm font-semibold text-gold-200 backdrop-blur">
            Golf Live Hub
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            골프 중계와 레슨 예약을 한 흐름으로 연결합니다.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fairway-100">
            대회 일정, 공식 중계 링크, 하이라이트 해석을 모아 보고, 내 스윙 과제에 맞는
            검증 프로 예약까지 이어지는 콘텐츠 허브입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pros" className="btn-gold">
              레슨 프로 찾기
            </Link>
            <a href="mailto:contact@100tothefuture.com?subject=골프 중계 일정 제보" className="btn-ghost">
              중계 정보 제보
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {liveCards.map((card) => (
            <article key={card.title} className="card p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{card.meta}</p>
              <h2 className="mt-3 text-xl font-black text-fairway-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-fairway-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gold-600">Schedule</p>
              <h2 className="mt-1 text-3xl font-black text-fairway-900">중계 일정 보드</h2>
            </div>
            <Link href="/pros" className="btn-primary">
              관심 종목 레슨 보기
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-fairway-100 bg-white">
            {schedule.map((item) => (
              <div
                key={item.tour}
                className="grid gap-2 border-b border-fairway-100 p-4 last:border-b-0 md:grid-cols-[120px_1fr_160px_220px]"
              >
                <div className="font-black text-fairway-800">{item.tour}</div>
                <div className="font-semibold text-fairway-900">{item.event}</div>
                <div className="text-sm text-fairway-600">{item.time}</div>
                <div className="text-sm font-semibold text-fairway-500">{item.link}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

