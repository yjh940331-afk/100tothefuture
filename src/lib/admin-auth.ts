import { cookies } from "next/headers";

// MVP용 단순 비밀번호 게이트.
// 운영 강화 시 Supabase Auth + role 기반으로 교체 권장.
export const ADMIN_COOKIE = "ttf_admin";

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

/** 관리자 로그인 상태인지 (httpOnly 쿠키 값 == ADMIN_PASSWORD) */
export async function isAdminAuthed(): Promise<boolean> {
  const pw = adminPassword();
  if (!pw) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === pw;
}
