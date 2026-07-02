import { NextResponse } from "next/server";
import { createReview } from "@/lib/data";

// 이름 마스킹: "홍길동" -> "홍**"
function maskName(name: string): string {
  const n = name.trim();
  if (!n) return "익명";
  if (n.length === 1) return n;
  return n[0] + "*".repeat(Math.max(1, n.length - 1));
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청" },
      { status: 400 },
    );
  }

  const rating = Number(body.rating_total);
  if (!body.instructor_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { ok: false, error: "별점을 선택해주세요." },
      { status: 400 },
    );
  }
  if (!body.content?.trim()) {
    return NextResponse.json(
      { ok: false, error: "후기 내용을 입력해주세요." },
      { status: 400 },
    );
  }
  if (!body.student_phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "예약 시 사용한 연락처를 입력해주세요." },
      { status: 400 },
    );
  }
  if (!/^[0-9+\-\s()]{8,20}$/.test(body.student_phone.trim())) {
    return NextResponse.json(
      { ok: false, error: "연락처 형식을 확인해주세요." },
      { status: 400 },
    );
  }
  if (body.content.length > 600) {
    return NextResponse.json(
      { ok: false, error: "후기 내용은 600자 이내로 입력해주세요." },
      { status: 400 },
    );
  }

  const result = await createReview({
    instructor_id: body.instructor_id,
    student_phone: body.student_phone.trim(),
    student_name_masked: maskName(body.student_name || "익명"),
    rating_total: rating,
    rating_kindness: body.rating_kindness
      ? Number(body.rating_kindness)
      : undefined,
    rating_explanation: body.rating_explanation
      ? Number(body.rating_explanation)
      : undefined,
    rating_effect: body.rating_effect ? Number(body.rating_effect) : undefined,
    recommend_for: body.recommend_for || undefined,
    content: body.content.trim(),
  });

  if (!result.ok) return NextResponse.json(result, { status: 500 });
  return NextResponse.json(result);
}
