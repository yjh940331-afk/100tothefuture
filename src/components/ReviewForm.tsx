"use client";

import { useState } from "react";

export function ReviewForm({
  instructorId,
  defaultName = "",
  defaultPhone = "",
}: {
  instructorId: string;
  defaultName?: string | null;
  defaultPhone?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [recommendFor, setRecommendFor] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }
    if (!phone.trim()) {
      setError("예약 시 사용한 연락처를 입력해주세요.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: instructorId,
          rating_total: rating,
          student_name: name,
          student_phone: phone,
          recommend_for: recommendFor,
          content,
        }),
      });
      const data = await res.json();
      if (data.ok) setStatus("done");
      else {
        setStatus("error");
        setError(data.error || "오류가 발생했어요.");
      }
    } catch {
      setStatus("error");
      setError("네트워크 상태를 확인한 뒤 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-fairway-200 bg-fairway-50 p-5 text-center">
        <p className="font-bold text-fairway-800">후기가 접수되었습니다</p>
        <p className="mt-1 text-sm text-fairway-600">
          운영자 확인 후 노출됩니다. 소중한 후기 감사합니다.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline">
        후기 작성하기
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-fairway-200 bg-white p-5"
    >
      <div className="mb-4 rounded-lg bg-fairway-50 px-3 py-2 text-sm text-fairway-600">
        완료된 예약이 확인된 후기만 접수됩니다. 로그인 회원은 내 예약과 먼저
        연결되고, 운영자 확인 후 노출됩니다.
      </div>

      <div className="mb-4">
        <div className="label">별점</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="rounded-md px-0.5 text-3xl leading-none text-gold-400 transition hover:bg-gold-50"
              aria-label={`${n}점`}
            >
              {n <= (hover || rating) ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">이름</label>
          <input
            className="input"
            placeholder="예: 홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">예약 연락처 *</label>
          <input
            type="tel"
            className="input"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <div>
          <label className="label">추천 대상 (선택)</label>
          <input
            className="input"
            placeholder="예: 100타 탈출, 입문자"
            value={recommendFor}
            onChange={(e) => setRecommendFor(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="label">후기 내용</label>
        <textarea
          className="input min-h-28"
          placeholder="설명력, 친절도, 교정 효과 등 솔직한 경험을 남겨주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={600}
          required
        />
        <div className="mt-1 text-right text-xs text-fairway-400">
          {content.length}/600
        </div>
      </div>

      {error && (
        <p
          className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary"
        >
          {status === "loading" ? "등록 중..." : "후기 등록"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-outline"
        >
          취소
        </button>
      </div>
    </form>
  );
}
