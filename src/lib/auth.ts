import { getSupabaseServer } from "./supabase-server";

export interface Profile {
  id: string;
  role: "student" | "instructor" | "admin";
  name: string | null;
  nickname: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  region: string | null;
  marketing_agreed: boolean;
  onboarded: boolean;
}

/** 현재 로그인 사용자 (없으면 null) */
export async function getSessionUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 현재 사용자 + profiles 행 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
}
