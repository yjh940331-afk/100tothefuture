import Link from "next/link";
import { getFeaturedInstructors } from "@/lib/data";
import { InstructorCard } from "@/components/InstructorCard";
import { DemoBanner } from "@/components/DemoBanner";
import { SPECIALTIES } from "@/lib/constants";

export const runtime = "edge";

export default async function HomePage() {
  const featured = await getFeaturedInstructors(3);

  return (
    <>
      <DemoBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#3a7f52,transparent_45%),radial-gradient(circle_at_80%_0%,#c8964a,transparent_40%)]" />
        <div className="container-page relative py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-fairway-900/60 px-4 py-1.5 text-sm font-semibold text-gold-300">
            검증된 레슨프로 매칭 플랫폼
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            100타 탈출, 혼자 고민하지 말고
            <br />
            <span className="text-gold-300">검증된 프로</span>와 시작하세요.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fairway-200">
            내 스윙 문제에 맞는 레슨프로를 찾고, 약력·자격·후기를 확인한 뒤 가능한
            시간에 바로 상담·예약하세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pros" className="btn-gold text-base">
              레슨프로 찾기
            </Link>
            <Link
              href="/pros?specialty=100타 탈출"
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              100타 탈출 전문 프로 보기
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-fairway-200">
            <Stat label="자격·경력 검증" value="관리자 직접 확인" />
            <Stat label="후기" value="예약 완료자만 작성" />
            <Stat label="예약" value="가능 시간 확인 후 요청" />
          </div>
        </div>
      </section>

      {/* 전문분야 빠른 진입 */}
      <section className="container-page relative z-10 -mt-8">
        <div className="card flex flex-wrap items-center gap-2 p-4">
          <span className="mr-1 text-sm font-bold text-fairway-700">무엇이 고민이세요?</span>
          {SPECIALTIES.map((s) => (
            <Link
              key={s}
              href={`/pros?specialty=${encodeURIComponent(s)}`}
              className="rounded-full border border-fairway-200 px-3 py-1.5 text-sm font-medium text-fairway-700 transition-colors hover:border-fairway-500 hover:bg-fairway-50"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* 추천 프로 */}
      <section className="container-page py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-fairway-900">추천 레슨프로</h2>
            <p className="mt-1 text-fairway-600">검증을 마친 인기 프로를 먼저 만나보세요.</p>
          </div>
          <Link href="/pros" className="text-sm font-bold text-fairway-700 hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pro) => (
            <InstructorCard key={pro.id} pro={pro} />
          ))}
        </div>
      </section>

      {/* 신뢰 장치 */}
      <section className="border-y border-fairway-100 bg-white">
        <div className="container-page py-16">
          <h2 className="text-center text-2xl font-extrabold text-fairway-900">
            왜 100 to the Future 인가요?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              title="검증된 프로필"
              desc="자격증·경력 증빙을 관리자가 직접 확인한 뒤 '검증완료' 배지를 부여합니다. 검증하지 않은 내용은 표시하지 않습니다."
            />
            <Feature
              title="진짜 후기만"
              desc="예약을 완료한 수강생만 후기를 작성할 수 있습니다. 나쁜 후기라고 지우지 않고, 욕설·개인정보 노출만 관리합니다."
            />
            <Feature
              title="가능 시간 확인 후 예약"
              desc="프로별 요일·시간을 확인하고, 희망 일정으로 상담·예약을 요청하세요. 회원가입 없이도 요청할 수 있습니다."
            />
          </div>
        </div>
      </section>

      {/* 진행 흐름 */}
      <section className="container-page py-16">
        <h2 className="text-center text-2xl font-extrabold text-fairway-900">
          이렇게 진행돼요
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "프로 찾기", "지역·전문분야·가격·시간으로 나에게 맞는 프로를 검색"],
            ["02", "프로필 확인", "약력·자격·검증배지·커리큘럼·후기 확인"],
            ["03", "상담·예약 요청", "가능한 시간에 희망 내용과 함께 요청"],
            ["04", "레슨 & 후기", "레슨 후 검증된 후기 작성으로 다음 골퍼에게 도움"],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <span className="text-3xl font-black text-gold-400">{n}</span>
              <h3 className="mt-3 font-bold text-fairway-900">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fairway-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="container-page pb-4">
        <div className="rounded-2xl bg-fairway-800 p-10 text-center text-white sm:p-14">
          <h2 className="text-3xl font-black">올해는 진짜 100타, 깨봅시다.</h2>
          <p className="mt-3 text-fairway-200">검증된 프로와 함께라면 더 빠릅니다.</p>
          <Link href="/pros" className="btn-gold mt-6 inline-flex text-base">
            지금 레슨프로 찾기
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-fairway-300">{label}</div>
      <div className="font-bold text-gold-200">{value}</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-fairway-100 bg-cream p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fairway-700 text-gold-300">
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-bold text-fairway-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fairway-600">{desc}</p>
    </div>
  );
}
