import type { Metadata } from "next";
import { listInstructors, type InstructorFilters as Filters } from "@/lib/data";
import { InstructorCard } from "@/components/InstructorCard";
import { InstructorFilters } from "@/components/InstructorFilters";
import { DemoBanner } from "@/components/DemoBanner";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "레슨프로 찾기",
  description:
    "지역·전문분야·가격·가능 시간으로 검증된 골프 레슨프로를 찾아보세요. 100타 탈출 전문 프로 매칭.",
};

type SP = Record<string, string | string[] | undefined>;

export default async function ProsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

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

  return (
    <>
      <DemoBanner />
      <div className="border-b border-fairway-100 bg-white">
        <div className="container-page py-10">
          <h1 className="text-3xl font-black text-fairway-900">레슨프로 찾기</h1>
          <p className="mt-2 text-fairway-600">
            검증된 프로 중 나에게 맞는 프로를 찾아 상담·예약을 요청하세요.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <InstructorFilters />
        </aside>

        <section>
          <div className="mb-4 text-sm font-semibold text-fairway-600">
            총 <span className="text-fairway-900">{pros.length}</span>명의 프로
          </div>
          {pros.length === 0 ? (
            <div className="card p-12 text-center text-fairway-500">
              조건에 맞는 프로가 없어요. 필터를 조정해보세요.
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
