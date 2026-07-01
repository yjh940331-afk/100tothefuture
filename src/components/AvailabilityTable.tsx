import type { AvailabilityRule } from "@/lib/types";
import { DAYS_KO } from "@/lib/constants";

// 요일별 가능 시간을 주간 표 형태로 표시
export function AvailabilityTable({ rules }: { rules: AvailabilityRule[] }) {
  const byDay = new Map<number, AvailabilityRule[]>();
  rules.forEach((r) => {
    const arr = byDay.get(r.day_of_week) ?? [];
    arr.push(r);
    byDay.set(r.day_of_week, arr);
  });

  return (
    <div className="grid grid-cols-7 gap-1.5 text-center">
      {DAYS_KO.map((d, i) => {
        const dayRules = byDay.get(i);
        return (
          <div key={i} className="rounded-xl border border-fairway-100 p-2">
            <div
              className={`text-sm font-bold ${
                i === 0 ? "text-rose-500" : i === 6 ? "text-sky-500" : "text-fairway-700"
              }`}
            >
              {d}
            </div>
            <div className="mt-1.5 space-y-1">
              {dayRules?.length ? (
                dayRules.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md bg-fairway-50 px-1 py-1 text-[11px] font-semibold leading-tight text-fairway-700"
                  >
                    {r.start_time.slice(0, 5)}
                    <br />~{r.end_time.slice(0, 5)}
                  </div>
                ))
              ) : (
                <div className="py-1 text-[11px] text-fairway-300">-</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
