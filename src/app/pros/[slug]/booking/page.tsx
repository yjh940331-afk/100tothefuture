import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructorBySlug } from "@/lib/data";
import { BookingForm } from "@/components/BookingForm";
import { DemoBanner } from "@/components/DemoBanner";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  return { title: pro ? `${pro.display_name} 상담·예약 요청` : "예약 요청" };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getInstructorBySlug(slug);
  if (!pro) notFound();

  return (
    <>
      <DemoBanner />
      <div className="container-page max-w-3xl py-10">
        <Link
          href={`/pros/${pro.slug}`}
          className="text-sm font-semibold text-fairway-500 hover:text-fairway-700"
        >
          ← {pro.display_name} 프로필
        </Link>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-fairway-100">
            <Image src={pro.profile_image} alt={pro.display_name} fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-fairway-900">상담 · 예약 요청</h1>
            <p className="text-fairway-600">
              {pro.display_name} · {pro.region} · {pro.bio}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-fairway-50 p-4 text-sm text-fairway-600">
          아래 내용을 남겨주시면 프로 또는 운영자가 확인 후 연락처로 일정을 확정해드립니다.
          결제는 확정 이후 별도로 진행되며, 지금 결제되지 않습니다.
        </p>

        <div className="mt-6">
          <BookingForm pro={pro} />
        </div>
      </div>
    </>
  );
}
