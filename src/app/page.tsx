import Link from "next/link";
import Image from "next/image";
import { getFeaturedInstructors, getReviews } from "@/lib/data";
import { GOLF_INFO_CATEGORIES, getSponsorBanners } from "@/lib/golf-info";
import { getPortfolioForSlug } from "@/lib/portfolio";
import { SEED_INSTRUCTORS, seedReviewsFor } from "@/lib/seed-data";
import type { Instructor, ReviewSummary } from "@/lib/types";
import { DemoBanner } from "@/components/DemoBanner";
import { Break100Carousel } from "@/components/Break100Carousel";
import { CompactAdSlider } from "@/components/CompactAdSlider";
import { InstructorCard } from "@/components/InstructorCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=2200&q=75";
const SHORTCUTS = [
  {
    label: "견적요청",
    href: "/request",
    icon: "quote",
    tone: "from-gold-100 via-gold-300 to-gold-500 text-fairway-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_20px_rgba(200,150,74,0.24)]",
  },
  {
    label: "프로찾기",
    href: "/pros",
    icon: "search",
    tone: "from-fairway-400 via-fairway-600 to-fairway-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_20px_rgba(34,80,52,0.24)]",
  },
  {
    label: "100타진단",
    href: "/request?goal=100%ED%83%80%20%ED%83%88%EC%B6%9C",
    icon: "target",
    tone: "from-[#e8d6a8] via-gold-400 to-[#8f6830] text-fairway-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_20px_rgba(146,94,48,0.22)]",
  },
  {
    label: "드라이버",
    href: "/request?goal=%EB%93%9C%EB%9D%BC%EC%9D%B4%EB%B2%84",
    icon: "driver",
    tone: "from-[#5ea476] via-fairway-500 to-fairway-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_20px_rgba(58,127,82,0.22)]",
  },
  {
    label: "아이언",
    href: "/request?goal=%EC%95%84%EC%9D%B4%EC%96%B8",
    icon: "iron",
    tone: "from-[#d8c993] via-[#9d8b55] to-fairway-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_20px_rgba(120,75,46,0.18)]",
  },
  {
    label: "숏게임",
    href: "/request?goal=%EC%88%8F%EA%B2%8C%EC%9E%84",
    icon: "flag",
    tone: "from-[#73b58b] via-[#2f7b50] to-fairway-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_20px_rgba(42,101,64,0.22)]",
  },
  {
    label: "골프정보",
    href: "/info",
    icon: "book",
    tone: "from-gold-50 via-gold-200 to-gold-500 text-fairway-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_20px_rgba(212,169,78,0.22)]",
  },
  {
    label: "내예약",
    href: "/bookings",
    icon: "calendar",
    tone: "from-[#516457] via-fairway-800 to-fairway-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_20px_rgba(12,30,21,0.2)]",
  },
] as const;

type PortfolioPreview = {
  pro: Instructor;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  platform: string;
  href: string;
};

type HomeReview = ReviewSummary & {
  instructor: Instructor;
};

export default async function HomePage() {
  const fetchedFeatured = await getFeaturedInstructors(3);
  const usingSeedFeatured = fetchedFeatured.length === 0;
  const featured = usingSeedFeatured
    ? SEED_INSTRUCTORS.filter((pro) => pro.is_featured && pro.is_active).slice(
        0,
        3,
      )
    : fetchedFeatured;
  const sponsorBanners = getSponsorBanners("home");
  const portfolioItems = buildPortfolioPreviews(featured);
  const reviewGroups = await Promise.all(
    featured.map(async (pro) =>
      (usingSeedFeatured
        ? seedReviewsFor(pro.id)
        : await getReviews(pro.id)
      ).map((review) => ({
        ...review,
        instructor: pro,
      })),
    ),
  );
  const reviewItems = reviewGroups
    .flat()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 3);

  return (
    <>
      <DemoBanner />

      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <div
          className="motion-hero-drift absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/88 to-fairway-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-fairway-950 to-transparent" />

        <div className="container-page relative grid min-h-[390px] items-center gap-7 py-8 sm:min-h-[460px] sm:py-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="motion-fade-up max-w-4xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/40 bg-fairway-950/55 px-2.5 py-1 text-[11px] font-bold text-gold-200 backdrop-blur sm:text-[12px]">
              레슨 매칭
            </span>
            <h1 className="mt-3 text-[28px] font-black leading-tight sm:text-4xl">
              조건만 입력하면
              <br />
              <span className="text-gold-300">프로 추천</span>
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-5 text-fairway-100 sm:text-sm">
              지역·목표·예산에 맞는 골프 프로를 찾습니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/request" className="btn-gold motion-button-pop">
                견적 요청
              </Link>
              <Link
                href="/pros"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                프로 찾기
              </Link>
            </div>

            <div className="motion-fade-up motion-delay-1 mt-5 grid max-w-md grid-cols-3 gap-1.5 border-t border-white/15 pt-3 text-[10px] text-fairway-100 sm:mt-7 sm:text-[12px]">
              <Stat label="요청" value="후보 정리" />
              <Stat label="검증" value="후기·뱃지" />
              <Stat label="예약" value="상담 후 확정" />
            </div>
          </div>
          <Break100Carousel className="motion-fade-up motion-delay-2 hidden lg:block lg:justify-self-end" />
        </div>
      </section>

      <section className="container-page relative z-10 -mt-6 sm:-mt-8">
        <div className="rounded-lg border border-fairway-100 bg-white p-3 shadow-card sm:p-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {SHORTCUTS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-center transition duration-300 hover:-translate-y-0.5 hover:bg-fairway-50/70"
              >
                <span
                  className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.tone} ring-1 ring-white/60 transition duration-300 group-hover:scale-[1.04] sm:h-12 sm:w-12`}
                >
                  <span
                    className="absolute inset-px rounded-[11px] bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.58),transparent_34%)]"
                    aria-hidden
                  />
                  <span
                    className="absolute -bottom-3 -right-2 h-8 w-8 rounded-full bg-white/10 blur-sm"
                    aria-hidden
                  />
                  <ShortcutIcon name={item.icon} />
                </span>
                <span className="truncate text-[11px] font-bold leading-4 text-fairway-800 sm:text-[12px]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pt-4 sm:pt-5">
        <CompactAdSlider banners={sponsorBanners} />
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-bold text-gold-700">추천 프로</p>
            <h2 className="mt-0.5 text-lg font-extrabold text-fairway-900 sm:text-xl">
              바로 상담 가능
            </h2>
            <p className="mt-1 text-[13px] text-fairway-600 sm:text-sm">
              후기·가격·일정을 확인하세요.
            </p>
          </div>
          <Link
            href="/pros"
            className="text-sm font-bold text-fairway-700 hover:underline"
          >
            전체 보기
          </Link>
        </div>
        <div className="motion-fade-up grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pro) => (
            <InstructorCard key={pro.id} pro={pro} />
          ))}
        </div>
      </section>

      <PortfolioPreviewSection items={portfolioItems} pros={featured} />

      <ReviewPreviewSection reviews={reviewItems} />

      <section className="border-y border-fairway-100 bg-white">
        <div className="container-page py-4 sm:py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gold-700">골프정보</p>
              <h2 className="mt-0.5 text-base font-extrabold text-fairway-900">
                짧게 보기
              </h2>
            </div>
            <Link
              href="/info"
              className="text-sm font-bold text-fairway-700 hover:underline"
            >
              정보 전체 보기
            </Link>
          </div>
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
            {GOLF_INFO_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/info/${category.slug}`}
                className="group flex min-w-[168px] items-center gap-2 rounded-lg border border-fairway-100 bg-white p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-fairway-200 hover:bg-fairway-50 hover:shadow-card sm:min-w-[210px]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-fairway-100">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="48px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-black text-fairway-900">
                    {category.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-fairway-600">
                    {category.highlights.slice(0, 2).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-8 sm:py-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-bold text-gold-700">
              브로커형 레슨 매칭
            </p>
            <h2 className="mt-1.5 text-lg font-extrabold text-fairway-900 sm:text-xl">
              골프 레슨은 프로보다 조건이 먼저인 경우가 많습니다
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-fairway-600">
              숨고식 요청서 흐름을 골프에 맞춰 바꾸고, 운영자가 검증과 매칭
              품질을 관리합니다.
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
        <h2 className="text-center text-lg font-extrabold text-fairway-900 sm:text-xl">
          이렇게 진행돼요
        </h2>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "01",
              "요청서 작성",
              "목표, 지역, 시간, 예산을 1분 안에 남깁니다.",
            ],
            ["02", "후보 확인", "운영자가 조건이 맞는 검증 프로를 추립니다."],
            [
              "03",
              "제안 비교",
              "가격, 경력, 후기, 가능 시간을 보고 상담합니다.",
            ],
            ["04", "예약 진행", "직접 예약하거나 패키지 상담 후 확정합니다."],
          ].map(([step, title, desc]) => (
            <div
              key={step}
              className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="w-10 shrink-0 text-lg font-black leading-none text-gold-500">
                {step}
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-fairway-900">
                  {title}
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-fairway-600">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-4">
        <div className="motion-fade-up relative overflow-hidden rounded-lg bg-fairway-900 p-8 text-center text-white sm:p-10">
          <div
            className="motion-hero-drift absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-black">
              이번 주 가능한 골프 레슨을 찾아볼까요?
            </h2>
            <p className="mt-3 text-fairway-100">
              시간이 먼저라면 견적 요청, 프로가 먼저라면 직접 검색이 빠릅니다.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/request" className="btn-gold inline-flex text-base">
                맞춤 견적 요청
              </Link>
              <Link
                href="/pros"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                프로 목록 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function buildPortfolioPreviews(pros: Instructor[]): PortfolioPreview[] {
  return pros
    .flatMap((pro) => {
      const saved = getPortfolioForSlug(pro.slug);
      const items =
        saved.length > 0
          ? saved
          : pro.gallery.map((image, index) => ({
              title:
                index === 0
                  ? `${pro.display_name} 레슨 현장`
                  : `${pro.specialties[index - 1] ?? "골프"} 포트폴리오`,
              eyebrow: pro.region,
              description: pro.bio,
              image,
              platform: "Lesson",
            }));

      return items.slice(0, 2).map((item) => ({
        pro,
        title: item.title,
        eyebrow: item.eyebrow,
        description: item.description,
        image: item.image,
        platform: item.platform,
        href: `/pros/${pro.slug}#portfolio`,
      }));
    })
    .slice(0, 2);
}

function profileImageFor(pro: Instructor) {
  return pro.profile_image || pro.gallery[0] || HERO_IMAGE;
}

function coverImageFor(pro: Instructor) {
  return pro.gallery[0] || pro.profile_image || HERO_IMAGE;
}

function PortfolioPreviewSection({
  items,
  pros,
}: {
  items: PortfolioPreview[];
  pros: Instructor[];
}) {
  if (items.length === 0 && pros.length === 0) return null;

  return (
    <section className="border-y border-fairway-100 bg-white">
      <div className="container-page py-5 sm:py-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-gold-700">포트폴리오</p>
            <h2 className="mt-0.5 text-base font-extrabold text-fairway-900 sm:text-lg">
              프로 레슨 사례
            </h2>
          </div>
          <Link
            href={items[0]?.href ?? "/pros"}
            className="shrink-0 text-sm font-bold text-fairway-700 hover:underline"
          >
            더보기
          </Link>
        </div>

        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-1">
          {pros.map((pro) => (
            <Link
              key={pro.id}
              href={`/pros/${pro.slug}`}
              className="group w-[64px] shrink-0 text-center sm:w-[72px]"
            >
              <span className="relative mx-auto block h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-fairway-100 shadow-sm ring-1 ring-fairway-100 transition group-hover:-translate-y-0.5 group-hover:ring-gold-300 sm:h-16 sm:w-16">
                <Image
                  src={profileImageFor(pro)}
                  alt={pro.display_name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span className="mt-1 block truncate text-[11px] font-bold text-fairway-800">
                {pro.display_name.replace(" 프로", "")}
              </span>
            </Link>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={`${item.pro.id}-${item.title}`}
                href={item.href}
                className="group overflow-hidden rounded-lg border border-fairway-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="relative aspect-[16/7] overflow-hidden bg-fairway-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-fairway-900 backdrop-blur">
                    {item.platform}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-[11px] font-bold text-gold-700">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-0.5 line-clamp-1 text-[14px] font-black text-fairway-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-[12px] leading-4 text-fairway-600">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href={items[0]?.href ?? "/pros"}
          className="mt-3 flex h-10 items-center justify-center rounded-lg bg-fairway-50 text-[13px] font-bold text-fairway-800 transition hover:bg-fairway-100"
        >
          포트폴리오 더보기
        </Link>
      </div>
    </section>
  );
}

function ReviewPreviewSection({ reviews }: { reviews: HomeReview[] }) {
  return (
    <section className="bg-cream">
      <div className="container-page py-5 sm:py-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-gold-700">리뷰</p>
            <h2 className="mt-0.5 text-base font-extrabold text-fairway-900 sm:text-lg">
              인기 후기
            </h2>
          </div>
          <Link
            href="/pros"
            className="shrink-0 text-sm font-bold text-fairway-700 hover:underline"
          >
            전체 보기
          </Link>
        </div>

        <div className="mt-3 rounded-lg border border-fairway-100 bg-white px-3 shadow-sm">
          {reviews.length === 0 ? (
            <div className="py-5 text-center">
              <p className="text-sm font-bold text-fairway-900">
                첫 후기를 준비 중이에요
              </p>
              <p className="mt-1 text-[12px] text-fairway-500">
                검증된 수강 후기를 곧 보여드릴게요.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-fairway-100">
              {reviews.map((review, index) => (
                <Link
                  key={review.id}
                  href={`/pros/${review.instructor.slug}#reviews`}
                  className="group flex items-center gap-3 py-3"
                >
                  <span className="w-5 shrink-0 text-sm font-black text-gold-600">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h3 className="truncate text-[14px] font-black text-fairway-900">
                        {review.recommend_for ??
                          review.instructor.specialties[0]}
                      </h3>
                      <span className="shrink-0 text-[12px] font-bold text-gold-600">
                        ★ {review.rating_total.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[12px] leading-4 text-fairway-600">
                      {review.content}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-fairway-400">
                      {review.instructor.display_name} ·{" "}
                      {review.student_name_masked}
                    </p>
                  </div>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-fairway-100">
                    <Image
                      src={coverImageFor(review.instructor)}
                      alt={review.instructor.display_name}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <Link
            href="/pros"
            className="mt-3 flex h-10 items-center justify-center rounded-lg bg-white text-[13px] font-bold text-fairway-800 shadow-sm transition hover:bg-fairway-50"
          >
            후기 더보기
          </Link>
        )}
      </div>
    </section>
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

function ShortcutIcon({ name }: { name: (typeof SHORTCUTS)[number]["icon"] }) {
  const common = {
    className: "relative z-10 h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.24)]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "quote") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M8 9h8M8 13h6M8 17h4" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" />
      </svg>
    );
  }

  if (name === "driver") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M16 4 7 19" />
        <path d="M14 4h5l-1.5 4h-4z" />
        <circle cx="6" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "iron") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M15 4 8 19" />
        <path d="M7 19h6l2-4H9z" />
      </svg>
    );
  }

  if (name === "flag") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M7 20V5" />
        <path d="M7 5h10l-2 4 2 4H7" />
        <path d="M5 20h6" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M6 5h9a3 3 0 0 1 3 3v11H9a3 3 0 0 0-3 3z" />
        <path d="M6 5v17M9 9h6M9 13h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" {...common}>
      <rect x="5" y="6" width="14" height="14" rx="2" />
      <path d="M8 4v4M16 4v4M5 10h14M9 14h2M13 14h2" />
    </svg>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-fairway-100 bg-cream px-3.5 py-3 shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fairway-700 text-gold-300">
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden
        >
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
