import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const pw = adminPassword();
  if (!pw) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
  const body = await req.json().catch(() => ({}));
  if (body.password !== pw) {
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, pw, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8시간
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
