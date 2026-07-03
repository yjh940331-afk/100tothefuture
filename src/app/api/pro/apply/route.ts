import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { submitInstructorApplication } from "@/lib/data";

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }
  if (!profile.onboarded) {
    return NextResponse.json(
      { ok: false, error: "회원 정보를 먼저 입력해주세요." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const result = await submitInstructorApplication(profile.id, {
    display_name: String(body.display_name ?? ""),
    phone: String(body.phone ?? ""),
    region: String(body.region ?? ""),
    lesson_places: asStringArray(body.lesson_places),
    specialties: asStringArray(body.specialties),
    career_years: Number(body.career_years ?? 0),
    bio: body.bio ? String(body.bio) : null,
    about: body.about ? String(body.about) : null,
    proof_urls: asStringArray(body.proof_urls),
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
