"use client";

import { useEffect, useState } from "react";

export interface ProTab {
  id: string;
  label: string;
}

// 숨고식 상단 가로 탭바 — 섹션 앵커로 스크롤 + 현재 섹션 자동 하이라이트(스크롤스파이)
export function ProTabBar({ tabs }: { tabs: ProTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <nav className="sticky top-14 z-30 border-b border-fairway-100 bg-white/95 backdrop-blur sm:top-16">
      <div className="container-page flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            aria-current={active === t.id ? "true" : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-bold transition-colors ${
              active === t.id
                ? "border-fairway-900 text-fairway-900"
                : "border-transparent text-fairway-400 hover:text-fairway-700"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
