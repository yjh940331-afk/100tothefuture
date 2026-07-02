import { NextResponse } from "next/server";
import { createLessonRequest } from "@/lib/data";

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asOptionalNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  if (
    !body.customer_name?.trim() ||
    !body.customer_phone?.trim() ||
    !body.region?.trim()
  ) {
    return NextResponse.json(
      { ok: false, error: "이름, 연락처, 지역을 입력해주세요." },
      { status: 400 },
    );
  }
  if (!/^[0-9+\-\s()]{8,20}$/.test(body.customer_phone.trim())) {
    return NextResponse.json(
      { ok: false, error: "연락처 형식을 확인해주세요." },
      { status: 400 },
    );
  }
  if (!body.privacy_agreed) {
    return NextResponse.json(
      { ok: false, error: "개인정보 수집 및 이용 동의가 필요합니다." },
      { status: 400 },
    );
  }
  if (asStringArray(body.goals).length === 0) {
    return NextResponse.json(
      { ok: false, error: "레슨 목표를 하나 이상 선택해주세요." },
      { status: 400 },
    );
  }
  if (body.memo && String(body.memo).length > 800) {
    return NextResponse.json(
      { ok: false, error: "상세 요청은 800자 이내로 입력해주세요." },
      { status: 400 },
    );
  }

  const result = await createLessonRequest({
    customer_name: body.customer_name.trim(),
    customer_phone: body.customer_phone.trim(),
    region: body.region.trim(),
    lesson_places: asStringArray(body.lesson_places),
    goals: asStringArray(body.goals),
    skill_level: body.skill_level || null,
    score_range: body.score_range || null,
    preferred_days: asStringArray(body.preferred_days),
    preferred_time_slot: body.preferred_time_slot || null,
    budget_min: asOptionalNumber(body.budget_min),
    budget_max: asOptionalNumber(body.budget_max),
    instructor_gender_preference: body.instructor_gender_preference || null,
    package_preference: body.package_preference || null,
    memo: body.memo || null,
    privacy_agreed: Boolean(body.privacy_agreed),
    marketing_agreed: Boolean(body.marketing_agreed),
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
