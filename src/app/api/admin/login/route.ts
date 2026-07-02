import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_FAIL_COOKIE,
  ADMIN_LOGIN_MAX_FAILURES,
  ADMIN_LOGIN_WINDOW_SECONDS,
  ADMIN_SESSION_MAX_AGE,
  adminPassword,
  createAdminSessionToken,
  parseLoginFailureCookie,
  serializeLoginFailureCookie,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const pw = adminPassword();
  if (!pw) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const now = Date.now();
  const failures = parseLoginFailureCookie(
    req.cookies.get(ADMIN_FAIL_COOKIE)?.value,
    now,
  );
  if (failures.count >= ADMIN_LOGIN_MAX_FAILURES) {
    return NextResponse.json(
      {
        ok: false,
        error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  if (body.password !== pw) {
    const res = NextResponse.json(
      { ok: false, error: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
    res.cookies.set(
      ADMIN_FAIL_COOKIE,
      serializeLoginFailureCookie(failures.count + 1, failures.firstFailedAt),
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/admin",
        maxAge: ADMIN_LOGIN_WINDOW_SECONDS,
      },
    );
    return res;
  }

  const token = await createAdminSessionToken(now);
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "관리자 세션을 생성할 수 없습니다." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  res.cookies.set(ADMIN_FAIL_COOKIE, "", {
    path: "/admin",
    maxAge: 0,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_FAIL_COOKIE, "", { path: "/admin", maxAge: 0 });
  return res;
}
