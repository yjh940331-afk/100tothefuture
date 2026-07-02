import Image from "next/image";
import Link from "next/link";
import type { Instructor } from "@/lib/types";
import { RatingInline } from "./Stars";
import { Badge } from "./Badge";

const priceFmt = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원~` : "상담 후 안내");

// 대표 뱃지 2개만 카드에 노출 (검증 우선)
function topBadges(badges: string[]): string[] {
  const priority = [
    "founding_pro",
    "media_featured",
    "breakout_expert",
    "cert_verified",
    "beginner_friendly",
    "women_popular",
    "many_reviews",
    "fast_response",
    "career_verified",
    "profile_verified",
  ];
  return priority.filter((b) => badges.includes(b)).slice(0, 2);
}

export function InstructorCard({ pro }: { pro: Instructor }) {
  return (
    <Link
      href={`/pros/${pro.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-fairway-200 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-fairway-100">
        <Image
          src={pro.profile_image}
          alt={pro.display_name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-fairway-950/60 to-transparent" />
        {pro.verification_status === "verified" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-fairway-950/85 px-2.5 py-1 text-xs font-bold text-gold-300">
            검증완료
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-fairway-800">
          {pro.region} · {pro.career_years > 0 ? `경력 ${pro.career_years}년` : "경력 확인 중"}
        </span>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-extrabold text-fairway-900">
            {pro.display_name}
          </h3>
          <span className="shrink-0 text-sm font-extrabold text-fairway-800">
            {priceFmt(pro.price_from)}
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-fairway-600">
          {pro.bio}
        </p>

        <RatingInline value={pro.rating_avg} count={pro.review_count} />

        <div className="flex flex-wrap gap-1.5">
          {topBadges(pro.badges).map((b) => (
            <Badge key={b} badgeKey={b} />
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-fairway-100 pt-3">
          <div className="flex flex-wrap gap-1">
            {pro.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-md bg-fairway-50 px-2 py-0.5 text-xs font-medium text-fairway-600"
              >
                #{s}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-xs font-bold text-fairway-600 group-hover:text-fairway-800">
            자세히 보기
          </span>
        </div>
      </div>
    </Link>
  );
}
