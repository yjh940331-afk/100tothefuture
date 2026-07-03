"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProQuoteForm({
  requestId,
  initialMessage = "",
  initialPrice,
}: {
  requestId: string;
  initialMessage?: string | null;
  initialPrice?: number | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage ?? "");
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!message.trim()) {
      setError("견적 메시지를 입력해주세요.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`/api/pro/leads/${requestId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          price: price ? Number(price) : null,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setError(data.error || "견적을 저장하지 못했어요.");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
      setError("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg bg-fairway-50 p-3">
      <label className="block">
        <span className="label">견적 메시지</span>
        <textarea
          className="input min-h-20"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="가능 시간, 레슨 방식, 첫 상담 안내를 남겨주세요."
          maxLength={500}
        />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="input"
          type="number"
          min="0"
          step="10000"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="견적 금액"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary !min-h-11"
        >
          {status === "loading"
            ? "저장 중..."
            : initialMessage
              ? "견적 수정"
              : "견적 보내기"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>
      )}
      {status === "done" && (
        <p className="mt-2 text-sm font-semibold text-fairway-700">
          견적을 저장했어요.
        </p>
      )}
    </form>
  );
}
