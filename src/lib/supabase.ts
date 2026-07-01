import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 환경변수 (Cloudflare Pages: Settings > Environment variables 에 설정)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Supabase 연결이 설정돼 있는지 (없으면 시드 데이터로 폴백) */
export function isDbConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** 공개 읽기/쓰기용 클라이언트 (RLS 적용). 미설정 시 null. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** 관리자용 클라이언트 (service_role, RLS 우회). 서버에서만 사용. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
