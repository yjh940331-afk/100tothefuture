"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { SponsorBanner } from "@/lib/golf-info";

export function CompactAdSlider({ banners }: { banners: SponsorBanner[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % banners.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-lg shadow-card">
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <a
            key={banner.id}
            href={banner.href}
            className="relative min-w-full overflow-hidden text-white"
          >
            {/* 사진이 잘리지 않도록 넓은 비율 + 전체 노출 */}
            <div className="relative aspect-[16/6] sm:aspect-[16/5]">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
              {/* 왼쪽만 어둡게 → 오른쪽 사진은 그대로 보이고 텍스트는 읽힘 */}
              <div className="absolute inset-0 bg-gradient-to-r from-fairway-950/85 via-fairway-950/45 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-between gap-3 px-4 sm:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase text-gold-200 backdrop-blur">
                      AD
                    </span>
                    <span className="text-[11px] font-bold text-fairway-100">
                      {index + 1}/{banners.length}
                    </span>
                  </div>
                  <h2 className="mt-1.5 line-clamp-1 text-base font-black leading-tight drop-shadow sm:text-xl">
                    {banner.title}
                  </h2>
                  <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-fairway-100 drop-shadow sm:text-[13px]">
                    {banner.tags.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-gold-300 px-3 py-1.5 text-[12px] font-black text-fairway-950 shadow">
                  {banner.cta}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`${banner.title} 보기`}
              aria-current={active === index}
              onClick={() => setActive(index)}
              className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                active === index ? "w-5 bg-gold-300" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
