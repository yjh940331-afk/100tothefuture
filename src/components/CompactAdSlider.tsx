"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { SponsorBanner } from "@/lib/golf-info";

const AUTO_DELAY_MS = 4200;
const SWIPE_THRESHOLD = 38;

export function CompactAdSlider({ banners }: { banners: SponsorBanner[] }) {
  const [active, setActive] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const goTo = (index: number) => {
    setActive((index + banners.length) % banners.length);
    setDragOffset(0);
  };

  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % banners.length);
    }, AUTO_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [active, banners.length, paused]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (banners.length <= 1) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
      drag.moved = true;
      suppressClickRef.current = true;
      setDragOffset(deltaX);
    }
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setPaused(false);
    setDragOffset(0);

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 250);
    if (!drag.moved || Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) next();
    else prev();
  }

  if (banners.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }}
    >
      <div
        className={`flex ${
          dragRef.current
            ? "transition-none"
            : "transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
        } cursor-grab active:cursor-grabbing`}
        style={{
          transform: `translateX(calc(-${active * 100}% + ${dragOffset}px))`,
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        {banners.map((banner, index) => (
          <a
            key={banner.id}
            href={banner.href}
            className="relative min-w-full overflow-hidden text-white"
          >
            {/* 얇은 와이드 배너에서도 주요 피사체가 보이도록 이미지 포지션을 허용 */}
            <div className="relative aspect-[16/5] sm:aspect-[7/2] lg:aspect-[4/1]">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                style={{ objectPosition: banner.imagePosition ?? "center" }}
              />
              {/* 왼쪽만 어둡게 → 오른쪽 사진은 그대로 보이고 텍스트는 읽힘 */}
              <div className="absolute inset-0 bg-gradient-to-r from-fairway-950/82 via-fairway-950/38 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-between gap-3 px-3 sm:px-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase text-gold-200 backdrop-blur">
                      AD
                    </span>
                    <span className="text-[11px] font-bold text-fairway-100">
                      {index + 1}/{banners.length}
                    </span>
                  </div>
                  <h2 className="mt-1 line-clamp-1 text-sm font-black leading-tight drop-shadow sm:text-base lg:text-lg">
                    {banner.title}
                  </h2>
                  <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-fairway-100 drop-shadow sm:text-[12px]">
                    {banner.tags.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-black text-fairway-950 shadow sm:px-3 sm:py-1.5 sm:text-[12px]">
                  {banner.cta}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 광고 보기"
            onClick={prev}
            className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-fairway-950/45 text-white backdrop-blur transition hover:bg-fairway-950/70 sm:left-2 sm:h-8 sm:w-8"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="다음 광고 보기"
            onClick={next}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-fairway-950/45 text-white backdrop-blur transition hover:bg-fairway-950/70 sm:right-2 sm:h-8 sm:w-8"
          >
            <ChevronRight />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`${banner.title} 보기`}
                aria-current={active === index}
                onClick={() => goTo(index)}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                  active === index ? "w-5 bg-gold-300" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
