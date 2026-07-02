import { isDbConfigured } from "@/lib/supabase";

// Supabase 미연결 시 상단에 표시되는 안내 (연결 후 자동으로 사라짐)
export function DemoBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="border-b border-gold-200 bg-gold-50 text-gold-900">
      <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs font-semibold">
        <span className="rounded bg-gold-200 px-1.5 py-0.5 text-[10px] font-black tracking-wide">
          DEMO
        </span>
        <span>
          예시 데이터로 표시 중입니다. Supabase를 연결하면 실제
          데이터·예약·리뷰가 저장됩니다.
        </span>
      </div>
    </div>
  );
}
