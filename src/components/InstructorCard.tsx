import Image from "next/image";
import Link from "next/link";
import type { Instructor } from "@/lib/types";
import { RatingInline } from "./Stars";
import { Badge } from "./Badge";

const priceFmt = (n: number) => `${n.toLocaleString("ko-KR")}원~`;

// 대표 뱃지 2개만 카드에 노출 (검증 우선)
function topBadges(badges: string[]): string[] {
  const priority = [
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
      className="card group overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-fairway-100">
        <Image
          src={pro.profile_image}
          alt={pro.display_name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {pro.verification_status === "verified" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-fairway-900/85 px-2.5 py-1 text-xs font-bold text-gold-300">
            검증완료
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-fairway-900">
            {pro.display_name}
          </h3>
          <span className="text-xs font-semibold text-fairway-500">
            {pro.region} · 경력 {pro.career_years}년
          </span>
        </div>

        <p className="line-clamp-1 text-sm text-fairway-600">{pro.bio}</p>

        <RatingInline value={pro.rating_avg} count={pro.review_count} />

        <div className="flex flex-wrap gap-1.5">
          {topBadges(pro.badges).map((b) => (
            <Badge key={b} badgeKey={b} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-fairway-100 pt-3">
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
          <span className="text-sm font-extrabold text-fairway-800">
            {priceFmt(pro.price_from)}
          </span>
        </div>
      </div>
    </Link>
  );
}
