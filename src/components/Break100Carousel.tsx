"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    key: "driver",
    eyebrow: "OB형",
    title: "티샷이 흔들릴 때",
    desc: "방향성 코칭에 강한 프로부터 추천합니다.",
    goal: "드라이버",
    tags: ["드라이버", "방향성", "루틴"],
  },
  {
    key: "iron",
    eyebrow: "컨택형",
    title: "아이언이 안 뜰 때",
    desc: "임팩트와 체중이동을 먼저 점검합니다.",
    goal: "아이언",
    tags: ["아이언", "컨택", "스윙"],
  },
  {
    key: "short-game",
    eyebrow: "숏게임형",
    title: "그린 주변이 불안할 때",
    desc: "어프로치와 벙커 레슨 후보를 좁힙니다.",
    goal: "숏게임",
    tags: ["어프로치", "벙커", "거리감"],
  },
  {
    key: "putt",
    eyebrow: "3펏형",
    title: "퍼팅에서 잃을 때",
    desc: "스트로크와 거리감 루틴을 맞춥니다.",
    goal: "퍼팅",
    tags: ["퍼팅", "거리감", "루틴"],
  },
  {
    key: "break-100",
    eyebrow: "100타형",
    title: "100타를 깨고 싶을 때",
    desc: "현재 약점 기준으로 4주 코스를 제안합니다.",
    goal: "100타 탈출",
    tags: ["진단", "코스", "후기"],
  },
] as const;

export function Break100Carousel({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0);
  const current = slides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      data-testid="break100-carousel"
      className={`w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-white/15 bg-white/10 p-2.5 text-white shadow-card backdrop-blur-xl sm:p-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-black text-fairway-950">
          Break 100
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-fairway-100">
          <span className="motion-live-dot h-2 w-2 rounded-full bg-gold-300" />
          진단 전환 중
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg bg-white text-fairway-900">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((slide) => (
            <article key={slide.key} className="min-w-full p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-gold-100 px-2 py-1 text-[11px] font-black text-gold-900">
                  {slide.eyebrow}
                </span>
                <span className="text-[11px] font-black text-fairway-400">
                  맞춤 추천
                </span>
              </div>
              <h3 className="mt-3 text-lg font-black leading-tight text-fairway-950 sm:text-xl">
                {slide.title}
              </h3>
              <p className="mt-1.5 min-h-9 text-[13px] leading-5 text-fairway-600">
                {slide.desc}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {slide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="truncate rounded-md bg-fairway-50 px-2 py-1 text-center text-[11px] font-bold text-fairway-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-label="진단 슬라이드 선택">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`${slide.eyebrow} 보기`}
              aria-current={active === index}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${
                active === index
                  ? "w-5 bg-gold-300"
                  : "w-2 bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        <Link
          href={`/request?goal=${encodeURIComponent(current.goal)}`}
          className="rounded-full bg-white px-3 py-1.5 text-[12px] font-black text-fairway-950 transition hover:bg-gold-200"
        >
          진단하기
        </Link>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
        <div
          key={current.key}
          className="motion-slide-progress h-full rounded-full bg-gold-300"
        />
      </div>
    </div>
  );
}
