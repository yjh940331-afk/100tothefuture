import { createBrowserClient } from "@supabase/ssr";

// 브라우저(클라이언트 컴포넌트)용 Supabase — 카카오 로그인 등 세션 처리
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
