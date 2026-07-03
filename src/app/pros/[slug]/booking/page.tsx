import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructorBySlug } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { DEFAULT_OG_IMAGE, pageSeo } from "@/lib/seo";
import { BookingForm } from "@/components/BookingForm";
import { LoginPrompt } from "@/components/LoginPrompt";
import { DemoBanner } from "@/components/DemoBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) return { title: "예약 요청" };
  return pageSeo({
    title: `${pro.display_name} 상담·예약 요청`,
    description: `${pro.display_name} 프로에게 원하는 일정과 골프 고민을 남기고 상담·예약을 요청하세요.`,
    path: `/pros/${pro.slug}/booking`,
    image:
      pro.slug === "lee-hyun"
        ? DEFAULT_OG_IMAGE
        : pro.gallery[0] || pro.profile_image,
    imageAlt: `${pro.display_name} 상담·예약`,
    keywords: [
      `${pro.display_name} 예약`,
      `${pro.region} 골프레슨 예약`,
      ...pro.specialties,
    ],
    noIndex: true,
  });
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) notFound();

  const profile = await getCurrentProfile();
  const member = profile
    ? { name: profile.name, phone: profile.phone, region: profile.region }
    : null;

  return (
    <>
      <DemoBanner />
      <div className="border-b border-fairway-100 bg-white">
        <div className="container-page py-8">
          <Link
            href={`/pros/${pro.slug}`}
            className="text-sm font-semibold text-fairway-500 hover:text-fairway-700"
          >
            ← {pro.display_name} 프로필
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-fairway-100">
              <Image
                src={pro.profile_image}
                alt={pro.display_name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-gold-700">
                상담 · 예약 요청
              </span>
              <h1 className="mt-1 text-2xl font-black text-fairway-900 sm:text-3xl">
                원하는 일정과 고민을 남겨주세요
              </h1>
              <p className="mt-1 text-fairway-600">
                {pro.display_name} · {pro.region} · {pro.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {!member && <LoginPrompt next={`/pros/${pro.slug}/booking`} />}
          <BookingForm pro={pro} member={member} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-5">
            <h2 className="text-lg font-extrabold text-fairway-900">
              요청 전 확인
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fairway-600">
              <li>결제는 일정 확정 이후 별도로 진행됩니다.</li>
              <li>희망 시간은 프로 일정에 따라 조정될 수 있습니다.</li>
              <li>연락처는 상담과 일정 확정을 위해서만 사용됩니다.</li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-fairway-100">
              <Image
                src={pro.profile_image}
                alt={pro.display_name}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="font-extrabold text-fairway-900">
                {pro.display_name}
              </h2>
              <p className="mt-1 text-sm text-fairway-600">
                {pro.region} · 경력 {pro.career_years}년
              </p>
              <div className="mt-4 border-t border-fairway-100 pt-4">
                <div className="text-sm text-fairway-500">레슨 시작가</div>
                <div className="mt-1 text-2xl font-black text-fairway-900">
                  {pro.price_from.toLocaleString("ko-KR")}원~
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
