import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructorBySlug, getReviews } from "@/lib/data";
import { getPortfolioForSlug } from "@/lib/portfolio";
import { DAYS_KO } from "@/lib/constants";
import { BadgeList } from "@/components/Badge";
import { Stars, RatingInline } from "@/components/Stars";
import { AvailabilityTable } from "@/components/AvailabilityTable";
import { DemoBanner } from "@/components/DemoBanner";
import { ReviewForm } from "@/components/ReviewForm";
import { ProTabBar, type ProTab } from "@/components/ProTabBar";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { JsonLd } from "@/components/JsonLd";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  pageSeo,
  truncateMeta,
} from "@/lib/seo";

const won = (n: number) =>
  n > 0 ? `${n.toLocaleString("ko-KR")}원` : "상담 후 안내";
const wonFrom = (n: number) =>
  n > 0 ? `${n.toLocaleString("ko-KR")}원~` : "상담 후 안내";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) return { title: "프로를 찾을 수 없습니다" };
  const title = `${pro.display_name} ${pro.region} 골프레슨`;
  const price =
    pro.price_from > 0
      ? ` ${pro.price_from.toLocaleString("ko-KR")}원부터.`
      : "";
  const rating =
    pro.review_count > 0
      ? ` 후기 ${pro.review_count}개, 평점 ${pro.rating_avg.toFixed(1)}.`
      : "";

  return pageSeo({
    title,
    description: `${pro.bio}.${price}${rating} ${pro.specialties.join(", ")} 전문. 약력, 자격, 후기와 가능 시간을 확인하고 상담·예약하세요.`,
    path: `/pros/${pro.slug}`,
    image: pro.profile_image || pro.gallery[0],
    imageAlt: `${pro.display_name} 골프 레슨 프로필`,
    keywords: [
      `${pro.region} 골프레슨`,
      `${pro.display_name} 프로`,
      ...pro.specialties,
      ...pro.lesson_places,
    ],
    type: "profile",
  });
}

export default async function ProDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) notFound();

  const reviews = await getReviews(pro.id);
  const portfolio = getPortfolioForSlug(pro.slug);

  // 찜 상태/개수 (로그인 시 본인 찜 여부)
  let favorited = false;
  let likeCount = 0;
  let currentProfile: Awaited<ReturnType<typeof getCurrentProfile>> = null;
  try {
    currentProfile = await getCurrentProfile();
    const sb = await getSupabaseServer();
    const [{ count }, { data: authData }] = await Promise.all([
      sb
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("instructor_id", pro.id),
      sb.auth.getUser(),
    ]);
    likeCount = count ?? 0;
    const uid = authData.user?.id;
    if (uid) {
      const { data: fav } = await sb
        .from("favorites")
        .select("id")
        .eq("instructor_id", pro.id)
        .eq("student_user_id", uid)
        .maybeSingle();
      favorited = !!fav;
    }
  } catch {
    /* 로그인/테이블 미구성 시 무시 */
  }
  const sameAs = portfolio
    .map((item) => item.href)
    .filter((href) => href.startsWith("https://"));

  const hasPortfolio =
    portfolio.length > 0 ||
    pro.career_history.length > 0 ||
    pro.certifications.length > 0 ||
    pro.curriculum.length > 0;
  const hasPhotos = pro.gallery.length > 0;

  const tabs: ProTab[] = [
    { id: "info", label: "고수정보" },
    ...(hasPortfolio ? [{ id: "portfolio", label: "포트폴리오" }] : []),
    ...(hasPhotos ? [{ id: "photos", label: "사진" }] : []),
    { id: "reviews", label: `리뷰 ${reviews.length}` },
    { id: "qna", label: "질문답변" },
  ];

  // 가능 요일 요약
  const days = Array.from(
    new Set(pro.availability.map((a) => a.day_of_week)),
  ).sort();
  const availSummary = days.length
    ? `${days.map((d) => DAYS_KO[d]).join("·")} 가능`
    : "상담 시 안내";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pro.display_name,
    image: absoluteUrl(pro.profile_image || pro.gallery[0] || DEFAULT_OG_IMAGE),
    description: truncateMeta(pro.bio, 180),
    jobTitle: "골프 레슨 프로",
    url: absoluteUrl(`/pros/${pro.slug}`),
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    knowsAbout: pro.specialties,
    areaServed: pro.region,
    sameAs,
  };

  const lessonServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${pro.display_name} 골프 레슨`,
    serviceType: "Golf lesson",
    description: truncateMeta(pro.about || pro.bio, 220),
    url: absoluteUrl(`/pros/${pro.slug}`),
    image: absoluteUrl(pro.profile_image || pro.gallery[0] || DEFAULT_OG_IMAGE),
    provider: {
      "@type": "Person",
      name: pro.display_name,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: pro.region,
    },
    offers:
      pro.price_from > 0
        ? {
            "@type": "Offer",
            priceCurrency: "KRW",
            price: pro.price_from,
            url: absoluteUrl(`/pros/${pro.slug}/booking`),
            availability: "https://schema.org/InStock",
          }
        : undefined,
    aggregateRating:
      pro.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: pro.rating_avg,
            reviewCount: pro.review_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <>
      <DemoBanner />
      <JsonLd data={[personJsonLd, lessonServiceJsonLd]} />

      {/* 헤더 (라이트·컴팩트) */}
      <div className="border-b border-fairway-100 bg-white">
        <div className="container-page py-4">
          <Link
            href="/pros"
            className="text-[13px] font-semibold text-fairway-500 hover:text-fairway-800"
          >
            ← 레슨프로 목록
          </Link>
          <div className="mt-3 flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-fairway-100 sm:h-20 sm:w-20">
              <Image
                src={pro.profile_image}
                alt={pro.display_name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-black text-fairway-900 sm:text-xl">
                  {pro.display_name}
                </h1>
                {pro.verification_status === "verified" && (
                  <span className="rounded-full bg-fairway-900 px-2 py-0.5 text-[11px] font-bold text-gold-300">
                    검증완료
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-fairway-500">
                <RatingInline value={pro.rating_avg} count={pro.review_count} />
                <span>·</span>
                <span>{pro.region}</span>
                <span>·</span>
                <span>
                  {pro.career_years > 0
                    ? `경력 ${pro.career_years}년`
                    : "경력 확인 중"}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-fairway-600">
                {pro.bio}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <BadgeList badges={pro.badges} />
            <div className="shrink-0">
              <FavoriteButton
                instructorId={pro.id}
                initialActive={favorited}
                initialCount={likeCount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 탭바 */}
      <ProTabBar tabs={tabs} />

      <div className="container-page grid gap-6 pb-28 pt-6 lg:grid-cols-[1fr_320px] lg:pb-10">
        {/* 본문 */}
        <div className="space-y-6">
          {/* 고수정보 */}
          <Section id="info" title="고수정보">
            <div className="grid gap-x-6 gap-y-2.5 rounded-xl border border-fairway-100 bg-white p-4 sm:grid-cols-2">
              <InfoRow icon={<PinIcon />} label="지역" value={pro.region} />
              <InfoRow
                icon={<PlaceIcon />}
                label="레슨 장소"
                value={pro.lesson_places.join(", ") || "상담 후 결정"}
              />
              <InfoRow
                icon={<ClockIcon />}
                label="가능 시간"
                value={availSummary}
              />
              {pro.response_time && (
                <InfoRow
                  icon={<BoltIcon />}
                  label="응답"
                  value={pro.response_time}
                />
              )}
              <InfoRow
                icon={<CardIcon />}
                label="결제"
                value="상담 확정 후 안내 (카드·계좌이체)"
              />
              <InfoRow
                icon={<WonIcon />}
                label="레슨 시작가"
                value={wonFrom(pro.price_from)}
              />
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-bold text-fairway-900">소개</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-fairway-700">
                {pro.about}
              </p>
              {pro.lesson_style.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pro.lesson_style.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-fairway-50 px-2.5 py-1 text-[13px] font-medium text-fairway-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-bold text-fairway-900">
                전문 분야
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {pro.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-gold-100 px-2.5 py-1 text-[13px] font-semibold text-gold-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {pro.availability.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold text-fairway-900">
                  가능 시간
                </h3>
                <AvailabilityTable rules={pro.availability} />
                <p className="mt-2 text-[11px] text-fairway-500">
                  * 실제 예약 가능 여부는 상담 후 확정됩니다.
                </p>
              </div>
            )}
          </Section>

          {/* 포트폴리오 */}
          {hasPortfolio && (
            <Section id="portfolio" title="포트폴리오">
              {pro.career_history.length > 0 && (
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-bold text-fairway-900">
                    약력 · 경력
                  </h3>
                  <ul className="space-y-1.5">
                    {pro.career_history.map((c, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-fairway-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pro.certifications.length > 0 && (
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-bold text-fairway-900">
                    자격 · 라이선스
                  </h3>
                  <div className="space-y-2">
                    {pro.certifications.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-fairway-100 bg-white px-3 py-2.5"
                      >
                        <div>
                          <div className="text-sm font-semibold text-fairway-900">
                            {c.title}
                          </div>
                          <div className="text-[13px] text-fairway-500">
                            {c.issuer}
                            {c.issued_year ? ` · ${c.issued_year}년` : ""}
                          </div>
                        </div>
                        {c.verification_status === "verified" && (
                          <span className="rounded-full bg-fairway-100 px-2.5 py-1 text-[11px] font-bold text-fairway-700">
                            확인됨
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pro.curriculum.length > 0 && (
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-bold text-fairway-900">
                    커리큘럼
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {pro.curriculum.map((c) => (
                      <div
                        key={c.session}
                        className="flex items-start gap-2.5 rounded-lg bg-cream p-2.5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-fairway-700 text-[11px] font-bold text-gold-300">
                          {c.session}
                        </span>
                        <span className="text-[13px] leading-tight text-fairway-700">
                          {c.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {portfolio.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {portfolio.map((item) => {
                    const imageMode = item.imageMode ?? "cover";
                    return (
                      <a
                        key={`${item.platform}-${item.title}`}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`group overflow-hidden rounded-lg border border-fairway-100 bg-white transition hover:border-fairway-200 hover:shadow-card ${
                          imageMode === "cover"
                            ? ""
                            : "flex min-h-[132px] items-center gap-3 p-3"
                        }`}
                      >
                        {imageMode === "cover" ? (
                          <>
                            <div className="relative aspect-video overflow-hidden bg-fairway-100">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-black text-fairway-900">
                                  {item.platform}
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="text-sm font-black text-fairway-900">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-[13px] leading-relaxed text-fairway-600">
                                {item.description}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            {imageMode === "thumbnail" && (
                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-fairway-100 sm:h-24 sm:w-24">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  sizes="96px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="rounded-full bg-fairway-50 px-2 py-0.5 text-[11px] font-black text-fairway-700">
                                {item.platform}
                              </span>
                              <h3 className="mt-2 text-sm font-black text-fairway-900">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-[13px] leading-relaxed text-fairway-600">
                                {item.description}
                              </p>
                            </div>
                          </>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* 사진 */}
          {hasPhotos && (
            <Section id="photos" title="사진">
              <div className="grid gap-2 sm:grid-cols-3">
                {pro.gallery.map((g, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-lg bg-fairway-100 ${
                      i === 0 ? "aspect-[16/10] sm:col-span-2" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={g}
                      alt={`${pro.display_name} 레슨 ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 리뷰 */}
          <Section id="reviews" title={`리뷰 ${reviews.length}`}>
            {reviews.length === 0 ? (
              <p className="text-sm text-fairway-500">
                아직 등록된 후기가 없어요. 첫 후기를 남겨주세요.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-fairway-100 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-fairway-900">
                        {r.student_name_masked}
                      </span>
                      <Stars value={r.rating_total} size={14} />
                    </div>
                    {r.recommend_for && (
                      <span className="mt-1 inline-block rounded bg-fairway-50 px-2 py-0.5 text-[11px] text-fairway-600">
                        추천 대상: {r.recommend_for}
                      </span>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-fairway-700">
                      {r.content}
                    </p>
                    {r.instructor_reply && (
                      <div className="mt-2.5 rounded-lg bg-fairway-50 p-2.5 text-[13px]">
                        <span className="font-bold text-fairway-700">
                          프로 답글
                        </span>
                        <p className="mt-1 text-fairway-600">
                          {r.instructor_reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <ReviewForm
                instructorId={pro.id}
                defaultName={currentProfile?.name ?? currentProfile?.nickname}
                defaultPhone={currentProfile?.phone}
              />
            </div>
          </Section>

          {/* 질문답변 */}
          <Section id="qna" title="질문답변">
            <div className="rounded-xl border border-fairway-100 bg-white p-4 text-center">
              <p className="text-sm text-fairway-600">
                궁금한 점이 있으신가요? 상담·예약 요청 시 메모로 질문을 남기면
                프로가 직접 답변드립니다.
              </p>
              <Link
                href={`/pros/${pro.slug}/booking`}
                className="btn-outline mt-3"
              >
                질문하며 상담 요청하기
              </Link>
            </div>
          </Section>
        </div>

        {/* 데스크톱 사이드바 */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
          <div className="card space-y-3 p-4">
            <div>
              <div className="text-[13px] text-fairway-500">레슨 가격</div>
              <div className="text-xl font-black text-fairway-900">
                {wonFrom(pro.price_from)}
              </div>
            </div>

            {pro.packages.length > 0 && (
              <div className="space-y-2">
                {pro.packages.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-fairway-100 p-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-fairway-900">
                        {p.title}
                      </span>
                      <span className="text-sm font-bold text-fairway-800">
                        {won(p.price)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-fairway-500">
                      {p.session_count}회 · 회당 {p.duration_minutes}분
                    </div>
                    {p.description && (
                      <div className="mt-0.5 text-[11px] text-fairway-500">
                        {p.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/pros/${pro.slug}/booking`}
              className="btn-primary w-full"
            >
              상담 · 예약 요청하기
            </Link>
            <p className="text-center text-[11px] text-fairway-400">
              회원가입 없이 요청할 수 있어요
            </p>
          </div>
        </aside>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <MobileBookingBar slug={pro.slug} price={pro.price_from} />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 border-b border-fairway-100 pb-6 last:border-b-0"
    >
      <h2 className="mb-3 text-base font-extrabold text-fairway-900 sm:text-lg">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[13px]">
      <span className="text-fairway-400">{icon}</span>
      <span className="w-16 shrink-0 font-semibold text-fairway-500">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-fairway-800">
        {value}
      </span>
    </div>
  );
}

/* 아이콘 (16px, currentColor) */
const iconCls = "h-4 w-4";
function PinIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18s6-5.3 6-10a6 6 0 10-12 0c0 4.7 6 10 6 10zm0-7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function PlaceIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 8l7-5 7 5v8a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V8z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .3.18.57.46.69l2.75 1.25a.75.75 0 00.62-1.36L10.75 9.5V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path d="M11 2L4 11h4l-1 7 7-9h-4l1-7z" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v1H2V6zm0 3h16v5a2 2 0 01-2 2H4a2 2 0 01-2-2V9zm3 4h4v1H5v-1z" />
    </svg>
  );
}
function WonIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className={iconCls}
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.2 7l1.1 4 1.2-3h1l1.2 3 1.1-4h1.2l-1.7 6h-1.1l-1.2-3-1.2 3H6.7L5 7h1.2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
