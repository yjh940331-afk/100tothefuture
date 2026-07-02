import Link from "next/link";
import Image from "next/image";
import { getFeaturedInstructors } from "@/lib/data";
import { SPECIALTIES } from "@/lib/constants";
import { GOLF_INFO_CATEGORIES, getSponsorBanners } from "@/lib/golf-info";
import { DemoBanner } from "@/components/DemoBanner";
import { InstructorCard } from "@/components/InstructorCard";
import { SponsorAdCard } from "@/components/SponsorAdCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=2200&q=75";

export default async function HomePage() {
  const featured = await getFeaturedInstructors(3);
  const sponsorBanners = getSponsorBanners("home");

  return (
    <>
      <DemoBanner />

      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/88 to-fairway-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-fairway-950 to-transparent" />

        <div className="container-page relative flex min-h-[420px] flex-col justify-center py-12 sm:min-h-[460px] sm:py-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/40 bg-fairway-950/55 px-3 py-1 text-[13px] font-semibold text-gold-200 backdrop-blur">
            골프 레슨 전용 매칭 플랫폼
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">
            내 조건에 맞는 골프 프로,
            <br />
            <span className="text-gold-300">요청서 한 번</span>으로 비교하세요
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fairway-100 sm:text-base">
            지역, 목표, 시간, 예산을 남기면 검증된 레슨 프로 후보를 추려 상담 가능한 제안으로 연결합니다.
            원하는 프로를 직접 골라 바로 예약할 수도 있어요.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/request" className="btn-gold">
              맞춤 견적 요청
            </Link>
            <Link href="/pros" className="btn border border-white/30 text-white hover:bg-white/10">
              프로 직접 찾기
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-1 gap-2 border-t border-white/15 pt-4 text-[13px] text-fairway-100 sm:grid-cols-3">
            <Stat label="요청서" value="48시간 안에 후보 정리" />
            <Stat label="프로 검증" value="경력·후기·뱃지 확인" />
            <Stat label="예약" value="상담 후 직접 예약" />
          </div>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-10">
        <div className="rounded-lg border border-fairway-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-fairway-800">무엇부터 해결하고 싶으세요?</p>
              <p className="mt-1 text-sm text-fairway-500">목표를 고르면 맞춤 견적 요청서로 바로 이어집니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.slice(0, 6).map((specialty) => (
                <Link
                  key={specialty}
                  href={`/request?goal=${encodeURIComponent(specialty)}`}
                  className="rounded-full border border-fairway-200 px-3 py-1.5 text-sm font-medium text-fairway-700 transition-colors hover:border-fairway-500 hover:bg-fairway-50"
                >
                  {specialty}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-gold-700">추천 프로</p>
            <h2 className="mt-1 text-xl font-extrabold text-fairway-900">바로 상담 가능한 골프 프로</h2>
            <p className="mt-1 text-fairway-600">후기, 경력, 시작 가격을 확인하고 직접 예약할 수 있습니다.</p>
          </div>
          <Link href="/pros" className="text-sm font-bold text-fairway-700 hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pro) => (
            <InstructorCard key={pro.id} pro={pro} />
          ))}
        </div>
      </section>

      <section className="border-y border-fairway-100 bg-white">
        <div className="container-page py-5 sm:py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gold-700">골프정보</p>
              <h2 className="mt-0.5 text-base font-extrabold text-fairway-900">프로 선택 전 필요한 정보만 짧게</h2>
              <p className="mt-0.5 text-[13px] text-fairway-600">
                레슨프로를 고를 때 참고할 기본 정보만 가볍게 모았습니다.
              </p>
            </div>
            <Link href="/info" className="text-sm font-bold text-fairway-700 hover:underline">
              정보 전체 보기
            </Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {GOLF_INFO_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/info/${category.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-fairway-100 bg-white p-2.5 transition hover:border-fairway-200 hover:bg-fairway-50"
              >
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-fairway-100">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-gold-700">{category.eyebrow}</p>
                  <h3 className="mt-0.5 truncate text-sm font-black text-fairway-900">{category.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-[12px] leading-4 text-fairway-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-fairway-100 bg-cream">
        <div className="container-page py-8 sm:py-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] font-bold text-gold-700">스폰서 배너</p>
              <h2 className="mt-1 text-xl font-extrabold text-fairway-900">골프장비와 브랜드 광고가 들어갈 자리</h2>
              <p className="mt-1 text-sm text-fairway-600">
                장비, 웨어, 라운드 준비물처럼 구매 전환이 쉬운 영역을 사진 배너로 노출합니다.
              </p>
            </div>
            <a
              href="mailto:contact@100tothefuture.com?subject=100tothefuture 광고 문의"
              className="text-sm font-bold text-fairway-700 hover:underline"
            >
              광고 문의
            </a>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {sponsorBanners.map((banner) => (
              <SponsorAdCard key={banner.id} banner={banner} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-8 sm:py-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-bold text-gold-700">브로커형 레슨 매칭</p>
            <h2 className="mt-1.5 text-lg font-extrabold text-fairway-900 sm:text-xl">
              골프 레슨은 프로보다 조건이 먼저인 경우가 많습니다
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-fairway-600">
              숨고식 요청서 흐름을 골프에 맞춰 바꾸고, 운영자가 검증과 매칭 품질을 관리합니다.
            </p>
          </div>
          <div className="mt-5 grid gap-2.5 md:grid-cols-3">
            <Feature
              title="요청서 기반 매칭"
              desc="지역, 목표, 가능 시간, 예산을 기준으로 후보 프로를 좁혀 고객의 선택 피로를 줄입니다."
            />
            <Feature
              title="검증 프로 운영"
              desc="프로필, 경력, 자격, 후기, 응답 속도를 관리해 레슨 품질을 비교할 수 있게 합니다."
            />
            <Feature
              title="예약·알림 확장"
              desc="직접 예약, 알림톡, 앱 푸시, 예약금 결제까지 같은 데이터 흐름에서 확장할 수 있습니다."
            />
          </div>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <h2 className="text-center text-lg font-extrabold text-fairway-900 sm:text-xl">이렇게 진행돼요</h2>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "요청서 작성", "목표, 지역, 시간, 예산을 1분 안에 남깁니다."],
            ["02", "후보 확인", "운영자가 조건이 맞는 검증 프로를 추립니다."],
            ["03", "제안 비교", "가격, 경력, 후기, 가능 시간을 보고 상담합니다."],
            ["04", "예약 진행", "직접 예약하거나 패키지 상담 후 확정합니다."],
          ].map(([step, title, desc]) => (
            <div key={step} className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white p-3 shadow-sm">
              <span className="w-10 shrink-0 text-lg font-black leading-none text-gold-500">{step}</span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-fairway-900">{title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-fairway-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-4">
        <div className="relative overflow-hidden rounded-lg bg-fairway-900 p-8 text-center text-white sm:p-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-black">이번 주 가능한 골프 레슨을 찾아볼까요?</h2>
            <p className="mt-3 text-fairway-100">시간이 먼저라면 견적 요청, 프로가 먼저라면 직접 검색이 빠릅니다.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/request" className="btn-gold inline-flex text-base">
                맞춤 견적 요청
              </Link>
              <Link href="/pros" className="btn border border-white/30 text-white hover:bg-white/10">
                프로 목록 보기
              </Link>
            </div>
          </div>
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
    <div className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-cream px-3.5 py-3 shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fairway-700 text-gold-300">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold text-fairway-900">{title}</h3>
        <p className="mt-1 text-[13px] leading-5 text-fairway-600">{desc}</p>
      </div>
    </div>
  );
}
