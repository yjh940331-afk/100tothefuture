import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버(컴포넌트/라우트)용 Supabase — 쿠키 기반 로그인 세션 읽기/갱신
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // 서버 컴포넌트에서는 쿠키 set이 불가(예외) → 라우트/액션에서만 반영됨
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* noop */
          }
        },
      },
    },
  );
}
