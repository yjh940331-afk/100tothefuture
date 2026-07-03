import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { claimBookingsForUser } from "@/lib/data";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }
  if (!profile.phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "마이페이지에서 연락처를 먼저 등록해주세요." },
      { status: 400 },
    );
  }

  const result = await claimBookingsForUser({
    userId: profile.id,
    phone: profile.phone,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
