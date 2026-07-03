"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimBookingsButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function claim() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/bookings/claim", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setMessage(data.error || "예약을 가져오지 못했어요.");
        return;
      }
      setStatus("done");
      setMessage(
        data.claimed > 0
          ? `${data.claimed}건의 예약을 연결했어요.`
          : "새로 연결할 예약은 없어요.",
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={claim}
        disabled={status === "loading"}
        className="btn-outline w-full"
      >
        {status === "loading" ? "예약 확인 중..." : "기존 예약 가져오기"}
      </button>
      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${
            status === "error"
              ? "bg-rose-50 text-rose-600"
              : "bg-fairway-50 text-fairway-700"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
