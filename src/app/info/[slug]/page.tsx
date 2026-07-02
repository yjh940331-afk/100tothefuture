import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GOLF_INFO_CATEGORIES, getGolfInfoCategory, getSponsorBanners } from "@/lib/golf-info";
import { pageSeo } from "@/lib/seo";
import { SponsorAdCard } from "@/components/SponsorAdCard";

export function generateStaticParams() {
  return GOLF_INFO_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getGolfInfoCategory(slug);
  if (!category) return { title: "골프 정보" };
  return pageSeo({
    title: category.title,
    description: category.description,
    path: `/info/${category.slug}`,
    image: category.image,
    imageAlt: `${category.title} 골프 정보`,
    keywords: [category.title, category.eyebrow, ...category.highlights],
    type: "article",
  });
}

export default async function GolfInfoCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getGolfInfoCategory(slug);
  if (!category) notFound();
  const sponsorBanners = getSponsorBanners(category.slug);

  return (
    <main>
      <section className="relative overflow-hidden bg-fairway-950 text-white">
        <Image
          src={category.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fairway-950 via-fairway-950/85 to-fairway-950/35" />
        <div className="container-page relative py-8 sm:py-12">
          <Link href="/info" className="text-sm font-bold text-fairway-100 hover:text-white">
            골프정보
          </Link>
          <p className="mt-6 text-[13px] font-bold text-gold-200">{category.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{category.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-fairway-100 sm:text-base">
            {category.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {category.highlights.map((highlight) => (
              <span key={highlight} className="rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-8 md:grid-cols-3 sm:py-10">
        {category.articles.map((article) => (
          <article key={article.title} className="rounded-lg border border-fairway-100 bg-white p-4 shadow-sm">
            <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-black text-gold-800">
              {article.tag}
            </span>
            <h2 className="mt-3 text-lg font-black text-fairway-900">{article.title}</h2>
            <p className="mt-2 text-sm leading-6 text-fairway-600">{article.description}</p>
          </article>
        ))}
      </section>

      {sponsorBanners.length > 0 && (
        <section className="border-y border-fairway-100 bg-cream">
          <div className="container-page py-8 sm:py-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-bold text-gold-700">Sponsor</p>
                <h2 className="mt-1 text-xl font-extrabold text-fairway-900">{category.title} 광고 배너</h2>
                <p className="mt-1 text-sm text-fairway-600">
                  이 주제를 보는 골퍼에게 어울리는 브랜드와 상품을 사진 배너로 연결합니다.
                </p>
              </div>
              <a
                href="mailto:contact@100tothefuture.com?subject=골프정보 상세 광고 문의"
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
      )}

      <section className="container-page pb-8">
        <div className="rounded-lg border border-fairway-100 bg-white p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-fairway-900">내 상황에 맞는 레슨도 같이 찾아볼까요?</p>
            <p className="mt-1 text-sm text-fairway-500">정보를 본 뒤 바로 프로 상담이나 맞춤 견적 요청으로 이어갈 수 있습니다.</p>
          </div>
          <div className="mt-3 flex gap-2 sm:mt-0">
            <Link href="/request" className="btn-primary">
              맞춤 견적
            </Link>
            <Link href="/pros" className="btn-outline">
              프로 찾기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
