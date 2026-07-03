"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  instructorId,
  initialActive = false,
  initialCount = 0,
}: {
  instructorId: string;
  initialActive?: boolean;
  initialCount?: number;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructor_id: instructorId, action: active ? "remove" : "add" }),
    });
    if (res.status === 401) {
      const next = typeof window !== "undefined" ? window.location.pathname : "/pros";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const data = await res.json().catch(() => ({ ok: false }));
    setBusy(false);
    if (data.ok) {
      setActive(data.active);
      setCount((c) => c + (data.active ? 1 : -1));
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold transition-colors ${
        active
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-fairway-200 bg-white text-fairway-700 hover:bg-fairway-50"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 20.5l-1.4-1.3C5.4 14.5 2.5 11.9 2.5 8.7 2.5 6.1 4.5 4 7.1 4c1.5 0 2.9.7 3.9 1.9C11.9 4.7 13.4 4 14.9 4 17.5 4 19.5 6.1 19.5 8.7c0 3.2-2.9 5.8-8.1 10.5L12 20.5z" strokeLinejoin="round" />
      </svg>
      찜{count > 0 ? ` ${count}` : ""}
    </button>
  );
}
