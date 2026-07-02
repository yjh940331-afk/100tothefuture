import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GOLF_INFO_CATEGORIES, getSponsorBanners } from "@/lib/golf-info";
import { pageSeo } from "@/lib/seo";
import { SponsorAdCard } from "@/components/SponsorAdCard";

export const metadata: Metadata = pageSeo({
  title: "골프 정보 허브",
  description:
    "골프웨어, 장비, 프로 이야기, 골프위키까지 레슨 전후에 필요한 정보를 한곳에서 확인하세요.",
  path: "/info",
  keywords: ["골프 정보", "골프웨어", "골프장비", "골프 초보 정보", "골프위키"],
});

export default function GolfInfoPage() {
  const featured = GOLF_INFO_CATEGORIES[0];
  const sponsorBanners = getSponsorBanners("info");

  return (
    <main>
      <section className="border-b border-fairway-100 bg-white">
        <div className="container-page grid gap-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-12">
          <div>
            <p className="text-[13px] font-bold text-gold-700">Golf Info</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-fairway-950 sm:text-3xl">
              레슨 전후에 필요한 골프 정보를 함께 모읍니다
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-fairway-600 sm:text-base">
              김캐디처럼 예약만이 아니라 장비, 웨어, 골프 이야기, 기본 용어까지 연결해
              초보 골퍼가 계속 돌아올 수 있는 정보 허브로 확장합니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {GOLF_INFO_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/info/${category.slug}`}
                  className="rounded-full border border-fairway-200 px-3 py-1.5 text-sm font-bold text-fairway-700 hover:bg-fairway-50"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>

          <Link href={`/info/${featured.slug}`} className="group overflow-hidden rounded-lg bg-fairway-950 text-white shadow-card">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fairway-950 via-fairway-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs font-bold text-gold-200">{featured.eyebrow}</p>
                <h2 className="mt-1 text-xl font-black">{featured.title}</h2>
                <p className="mt-1 text-sm text-fairway-100">{featured.articles[0]?.title}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOLF_INFO_CATEGORIES.map((category) => (
            <InfoCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="border-t border-fairway-100 bg-cream">
        <div className="container-page py-8 sm:py-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] font-bold text-gold-700">Ad Partner</p>
              <h2 className="mt-1 text-xl font-extrabold text-fairway-900">골프용품 광고 배너</h2>
              <p className="mt-1 text-sm text-fairway-600">콘텐츠를 보는 골퍼에게 장비, 웨어, 필드 준비물 배너를 함께 노출합니다.</p>
            </div>
            <a
              href="mailto:contact@100tothefuture.com?subject=골프정보 광고 문의"
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
    </main>
  );
}

function InfoCard({ category }: { category: (typeof GOLF_INFO_CATEGORIES)[number] }) {
  return (
    <Link
      href={`/info/${category.slug}`}
      className="group overflow-hidden rounded-lg border border-fairway-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-fairway-200 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-fairway-100">
        <Image
          src={category.image}
          alt={category.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="text-[11px] font-bold uppercase text-gold-700">{category.eyebrow}</p>
        <h2 className="mt-0.5 text-base font-black text-fairway-900">{category.title}</h2>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-fairway-600">{category.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {category.highlights.slice(0, 2).map((highlight) => (
            <span key={highlight} className="rounded-md bg-fairway-50 px-2 py-0.5 text-[11px] font-bold text-fairway-600">
              {highlight}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
