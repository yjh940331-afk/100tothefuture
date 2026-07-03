"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className={className ?? "text-[13px] font-semibold text-fairway-500 hover:text-fairway-800"}>
      로그아웃
    </button>
  );
}
