"use client";

import { useState } from "react";

export function ReviewForm({ instructorId }: { instructorId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [recommendFor, setRecommendFor] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("별점을 선택해주세요.");
      return;
    }
    setStatus("loading");
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instructor_id: instructorId,
        rating_total: rating,
        student_name: name,
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
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-fairway-200 bg-fairway-50 p-5 text-center">
        <p className="font-bold text-fairway-800">후기가 접수되었습니다 🙌</p>
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
    <form onSubmit={submit} className="rounded-xl border border-fairway-200 bg-white p-5">
      <p className="mb-4 text-sm text-fairway-500">
        * 후기는 레슨을 받은 수강생만 작성해주세요. 작성된 후기는 운영자 확인 후 노출되며,
        이름은 자동으로 마스킹됩니다.
      </p>

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
              className="text-3xl leading-none text-gold-400"
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
          required
        />
      </div>

      {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={status === "loading"} className="btn-primary">
          {status === "loading" ? "등록 중..." : "후기 등록"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">
          취소
        </button>
      </div>
    </form>
  );
}
