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
    <div className="overflow-hidden rounded-lg bg-fairway-900 shadow-card">
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <a
            key={banner.id}
            href={banner.href}
            className="relative min-w-full overflow-hidden px-4 py-3 text-white sm:px-5 sm:py-4"
          >
            <Image
              src={banner.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover opacity-45"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/85 to-fairway-950/20" />
            <div className="relative flex min-h-[76px] items-center justify-between gap-3 sm:min-h-[84px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase text-gold-200">
                    AD
                  </span>
                  <span className="text-[11px] font-bold text-fairway-100">
                    {index + 1}/{banners.length}
                  </span>
                </div>
                <h2 className="mt-2 line-clamp-1 text-lg font-black leading-tight sm:text-xl">
                  {banner.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-[12px] font-medium text-fairway-100 sm:text-[13px]">
                  {banner.tags.slice(0, 3).join(" · ")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold-300 px-3 py-1.5 text-[12px] font-black text-fairway-950">
                {banner.cta}
              </span>
            </div>
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="flex gap-1.5 bg-fairway-950 px-4 pb-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`${banner.title} 보기`}
              aria-current={active === index}
              onClick={() => setActive(index)}
              className={`h-1.5 rounded-full transition-all ${
                active === index ? "w-5 bg-gold-300" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
