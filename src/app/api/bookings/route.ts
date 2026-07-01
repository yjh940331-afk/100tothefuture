import { NextResponse } from "next/server";
import { createBooking } from "@/lib/data";

export const runtime = "edge";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }

  // 필수값 검증
  if (!body.instructor_id || !body.student_name?.trim() || !body.student_phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "이름과 연락처는 필수입니다." },
      { status: 400 },
    );
  }
  if (!body.privacy_agreed) {
    return NextResponse.json(
      { ok: false, error: "개인정보 수집·이용 동의가 필요합니다." },
      { status: 400 },
    );
  }

  const result = await createBooking({
    instructor_id: body.instructor_id,
    lesson_package_id: body.lesson_package_id || null,
    student_name: body.student_name.trim(),
    student_phone: body.student_phone.trim(),
    preferred_date: body.preferred_date || null,
    preferred_time: body.preferred_time || null,
    region: body.region || null,
    goal: body.goal || null,
    privacy_agreed: !!body.privacy_agreed,
    third_party_agreed: !!body.third_party_agreed,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
