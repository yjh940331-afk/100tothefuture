import type { Metadata } from "next";
import { listInstructors, type InstructorFilters as Filters } from "@/lib/data";
import { pageSeo } from "@/lib/seo";
import { InstructorCard } from "@/components/InstructorCard";
import { InstructorFilters } from "@/components/InstructorFilters";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata: Metadata = pageSeo({
  title: "골프 레슨프로 찾기",
  description:
    "지역, 전문분야, 가격, 가능 시간으로 검증된 골프 레슨프로를 비교하세요. 100타 탈출부터 비거리, 숏게임까지 내 조건에 맞는 프로를 찾을 수 있습니다.",
  path: "/pros",
  keywords: [
    "골프 레슨프로 찾기",
    "골프 프로 비교",
    "지역별 골프 레슨",
    "골프 레슨 추천",
  ],
});

type SP = Record<string, string | string[] | undefined>;

export default async function ProsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const get = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : undefined;

  const filters: Filters = {
    region: get("region"),
    specialty: get("specialty"),
    place: get("place"),
    timeSlot: get("timeSlot"),
    gender: get("gender"),
    priceMax: get("priceMax") ? Number(get("priceMax")) : undefined,
    sort: (get("sort") as Filters["sort"]) ?? "recommended",
  };

  const pros = await listInstructors(filters);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (!value) return false;
    if (key === "sort" && value === "recommended") return false;
    return true;
  }).length;

  return (
    <>
      <DemoBanner />
      <div className="border-b border-fairway-100 bg-white">
        <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <span className="text-sm font-bold text-gold-700">
              검증 프로 매칭
            </span>
            <h1 className="mt-2 text-3xl font-black text-fairway-900 sm:text-4xl">
              레슨프로 찾기
            </h1>
            <p className="mt-2 max-w-2xl text-fairway-600">
              지역, 전문 분야, 가격, 가능 시간으로 좁혀보고 내 목표에 맞는
              프로에게 상담을 요청하세요.
            </p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-fairway-100 bg-cream text-center">
            <MiniStat label="등록 프로" value={`${pros.length}명`} />
            <MiniStat label="적용 필터" value={`${activeFilterCount}개`} />
            <MiniStat
              label="정렬"
              value={
                filters.sort === "price"
                  ? "가격순"
                  : filters.sort === "rating"
                    ? "평점순"
                    : "추천순"
              }
            />
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-20 lg:h-fit">
          <InstructorFilters />
        </aside>

        <section className="order-1 lg:order-2">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-fairway-900">
                조건에 맞는 프로
              </h2>
              <p className="mt-1 text-sm font-medium text-fairway-600">
                총 <span className="text-fairway-900">{pros.length}</span>명의
                프로가 있습니다.
              </p>
            </div>
            <p className="rounded-full bg-fairway-50 px-3 py-1.5 text-xs font-semibold text-fairway-600">
              검증 배지와 후기 수를 함께 확인해보세요.
            </p>
          </div>
          {pros.length === 0 ? (
            <div className="card p-12 text-center">
              <h3 className="text-lg font-extrabold text-fairway-900">
                조건에 맞는 프로가 없어요
              </h3>
              <p className="mt-2 text-fairway-500">
                지역이나 가격 필터를 조금 넓혀보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pros.map((pro) => (
                <InstructorCard key={pro.id} pro={pro} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-fairway-100 px-3 py-4 last:border-r-0">
      <div className="text-xs font-semibold text-fairway-500">{label}</div>
      <div className="mt-1 text-lg font-black text-fairway-900">{value}</div>
    </div>
  );
}
