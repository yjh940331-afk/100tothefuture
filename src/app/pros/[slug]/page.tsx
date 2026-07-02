import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructorBySlug, getReviews } from "@/lib/data";
import { BadgeList } from "@/components/Badge";
import { Stars, RatingInline } from "@/components/Stars";
import { AvailabilityTable } from "@/components/AvailabilityTable";
import { DemoBanner } from "@/components/DemoBanner";
import { ReviewForm } from "@/components/ReviewForm";

const won = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "상담 후 안내");
const wonFrom = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원~` : "상담 후 안내");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) return { title: "프로를 찾을 수 없습니다" };
  const title = `${pro.region} 100타 탈출 골프레슨 | ${pro.display_name}`;
  return {
    title,
    description: `${pro.display_name} · ${pro.bio}. ${pro.specialties.join(", ")} 전문. 약력·자격·후기를 확인하고 상담·예약하세요.`,
    openGraph: { title, images: [pro.profile_image] },
  };
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
  const coverImage = pro.gallery[0] ?? pro.profile_image;

  return (
    <>
      <DemoBanner />

      {/* 헤더 */}
      <div className="relative overflow-hidden bg-fairway-950 text-white">
        <Image
          src={coverImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/86 to-fairway-950/35" />
        <div className="container-page relative py-8 sm:py-12">
          <Link href="/pros" className="text-sm font-semibold text-fairway-100 hover:text-white">
            ← 레슨프로 목록
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-white/70 bg-fairway-100 shadow-card sm:h-32 sm:w-32">
                <Image src={pro.profile_image} alt={pro.display_name} fill sizes="128px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black sm:text-4xl">{pro.display_name}</h1>
                  {pro.verification_status === "verified" && (
                    <span className="rounded-full bg-gold-300 px-2.5 py-1 text-xs font-bold text-fairway-950">
                      검증완료
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-fairway-100">{pro.bio}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fairway-100">
                  <span>지역 {pro.region}</span>
                  <span>{pro.career_years > 0 ? `경력 ${pro.career_years}년` : "경력 확인 중"}</span>
                  {pro.response_time && <span>{pro.response_time}</span>}
                  <RatingInline value={pro.rating_avg} count={pro.review_count} />
                </div>
                <div className="mt-4">
                  <BadgeList badges={pro.badges} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                  {pro.specialties[0] ?? "골프 레슨"}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                  {pro.lesson_places[0] ?? "상담 후 결정"}
                </span>
              </div>
              <div className="mt-4 text-sm text-fairway-100">레슨 시작가</div>
              <div className="mt-1 text-3xl font-black text-gold-200">{wonFrom(pro.price_from)}</div>
              <Link href={`/pros/${pro.slug}/booking`} className="btn-gold mt-5 w-full">
                상담 · 예약 요청하기
              </Link>
              <p className="mt-3 text-center text-xs text-fairway-200">지금 결제되지 않습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        {/* 본문 */}
        <div className="space-y-10">
          {/* 갤러리 */}
          {pro.gallery.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {pro.gallery.map((g, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-lg bg-fairway-100 ${
                    i === 0 ? "aspect-[16/10] sm:col-span-2" : "aspect-[4/3]"
                  }`}
                >
                  <Image src={g} alt={`${pro.display_name} 레슨 ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <Section title="소개">
            <p className="whitespace-pre-line leading-relaxed text-fairway-700">{pro.about}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pro.lesson_style.map((s) => (
                <span key={s} className="rounded-full bg-fairway-50 px-3 py-1 text-sm font-medium text-fairway-700">
                  {s}
                </span>
              ))}
            </div>
          </Section>

          <Section title="전문 분야 · 레슨 장소">
            <div className="flex flex-wrap gap-2">
              {pro.specialties.map((s) => (
                <span key={s} className="rounded-lg bg-gold-100 px-3 py-1.5 text-sm font-semibold text-gold-800">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {pro.lesson_places.map((p) => (
                <span key={p} className="rounded-lg border border-fairway-200 px-3 py-1.5 text-sm text-fairway-700">
                  {p}
                </span>
              ))}
            </div>
          </Section>

          <Section title="약력 · 경력">
            <ul className="space-y-2">
              {pro.career_history.map((c, i) => (
                <li key={i} className="flex gap-2 text-fairway-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          {pro.certifications.length > 0 && (
            <Section title="자격 · 라이선스">
              <div className="space-y-2">
                {pro.certifications.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-fairway-100 bg-white px-4 py-3">
                    <div>
                      <div className="font-semibold text-fairway-900">{c.title}</div>
                      <div className="text-sm text-fairway-500">
                        {c.issuer}
                        {c.issued_year ? ` · ${c.issued_year}년` : ""}
                      </div>
                    </div>
                    {c.verification_status === "verified" && (
                      <span className="rounded-full bg-fairway-100 px-2.5 py-1 text-xs font-bold text-fairway-700">
                        확인됨
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {pro.curriculum.length > 0 && (
            <Section title="100타 탈출 커리큘럼">
              <div className="grid gap-2 sm:grid-cols-2">
                {pro.curriculum.map((c) => (
                  <div key={c.session} className="flex items-start gap-3 rounded-lg bg-cream p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fairway-700 text-xs font-bold text-gold-300">
                      {c.session}
                    </span>
                    <span className="text-sm leading-tight text-fairway-700">{c.title}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="가능 시간">
            {pro.availability.length > 0 ? (
              <>
                <AvailabilityTable rules={pro.availability} />
                <p className="mt-3 text-xs text-fairway-500">
                  * 실제 예약 가능 여부는 상담 후 확정됩니다. 휴무·예외 일정이 있을 수 있어요.
                </p>
              </>
            ) : (
              <p className="text-fairway-500">가능 시간은 상담 시 안내드립니다.</p>
            )}
          </Section>

          {/* 리뷰 */}
          <Section title={`후기 (${reviews.length})`}>
            {reviews.length === 0 ? (
              <p className="text-fairway-500">아직 등록된 후기가 없어요. 첫 후기를 남겨주세요.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-fairway-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-fairway-900">{r.student_name_masked}</span>
                      <Stars value={r.rating_total} />
                    </div>
                    {r.recommend_for && (
                      <span className="mt-1 inline-block rounded bg-fairway-50 px-2 py-0.5 text-xs text-fairway-600">
                        추천 대상: {r.recommend_for}
                      </span>
                    )}
                    <p className="mt-2 leading-relaxed text-fairway-700">{r.content}</p>
                    {r.instructor_reply && (
                      <div className="mt-3 rounded-lg bg-fairway-50 p-3 text-sm">
                        <span className="font-bold text-fairway-700">프로 답글</span>
                        <p className="mt-1 text-fairway-600">{r.instructor_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <ReviewForm instructorId={pro.id} />
            </div>
          </Section>
        </div>

        {/* 예약 사이드바 */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card space-y-4 p-5">
            <div>
              <div className="text-sm text-fairway-500">레슨 가격</div>
              <div className="text-2xl font-black text-fairway-900">
                {wonFrom(pro.price_from)}
              </div>
            </div>

            {pro.packages.length > 0 && (
              <div className="space-y-2">
                {pro.packages.map((p) => (
                  <div key={p.id} className="rounded-xl border border-fairway-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-fairway-900">{p.title}</span>
                      <span className="font-bold text-fairway-800">{won(p.price)}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-fairway-500">
                      {p.session_count}회 · 회당 {p.duration_minutes}분
                    </div>
                    {p.description && (
                      <div className="mt-1 text-xs text-fairway-500">{p.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link href={`/pros/${pro.slug}/booking`} className="btn-primary w-full">
              상담 · 예약 요청하기
            </Link>
            <p className="text-center text-xs text-fairway-400">
              회원가입 없이 요청할 수 있어요
            </p>
            <div className="border-t border-fairway-100 pt-4">
              <h3 className="text-sm font-extrabold text-fairway-900">진행 흐름</h3>
              <ol className="mt-3 space-y-2 text-sm text-fairway-600">
                <li>1. 희망 일정과 고민을 남깁니다.</li>
                <li>2. 프로 또는 운영자가 연락드립니다.</li>
                <li>3. 일정 확정 후 결제와 레슨을 진행합니다.</li>
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-fairway-100 pb-10 last:border-b-0">
      <h2 className="mb-4 text-xl font-extrabold text-fairway-900">{title}</h2>
      {children}
    </section>
  );
}
