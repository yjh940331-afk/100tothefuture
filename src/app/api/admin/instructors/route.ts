import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { adminSaveInstructor } from "@/lib/data";

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await adminSaveInstructor({
    id: body.id || undefined,
    slug: String(body.slug ?? ""),
    display_name: String(body.display_name ?? ""),
    profile_image: String(body.profile_image ?? ""),
    gallery: asStringList(body.gallery),
    intro_video_url: body.intro_video_url ? String(body.intro_video_url) : null,
    bio: String(body.bio ?? ""),
    about: String(body.about ?? ""),
    region: String(body.region ?? ""),
    lesson_places: asStringList(body.lesson_places),
    specialties: asStringList(body.specialties),
    career_years: Number(body.career_years ?? 0),
    career_history: asStringList(body.career_history),
    lesson_style: asStringList(body.lesson_style),
    gender: body.gender === "female" ? "female" : "male",
    price_from: Number(body.price_from ?? 0),
    response_time: body.response_time ? String(body.response_time) : null,
    badges: asStringList(body.badges),
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active !== false,
    verification_status:
      body.verification_status === "verified" || body.verification_status === "rejected"
        ? body.verification_status
        : "pending",
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

