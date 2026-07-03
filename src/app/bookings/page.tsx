import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/lib/seo";
import { BookingLookup } from "@/components/BookingLookup";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = pageSeo({
  title: "내 예약 조회",
  description:
    "100 to the Future에서 신청한 골프 레슨 예약을 조회하고 취소할 수 있습니다.",
  path: "/bookings",
  noIndex: true,
});

export default async function BookingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm font-bold text-gold-600">My Booking</p>
        <h1 className="mt-2 text-2xl font-black text-fairway-900 sm:text-3xl">
          내 예약 조회
        </h1>
        <p className="mt-2 text-sm leading-6 text-fairway-600">
          예약 시 입력한 연락처만 넣으면 내 예약을 모두 확인하고, 확정 전 예약은
          직접 취소할 수 있습니다.
        </p>
      </div>

      {profile && (
        <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3 rounded-lg bg-fairway-50 px-4 py-3">
          <p className="text-[13px] font-medium text-fairway-700">
            로그인 회원은 마이페이지에서 예약·찜을 한눈에 볼 수 있어요.
          </p>
          <Link href="/mypage" className="btn-primary shrink-0 !min-h-9 !px-3 !py-1.5 text-[13px]">
            마이페이지
          </Link>
        </div>
      )}

      <BookingLookup defaultPhone={profile?.phone ?? ""} />
    </div>
  );
}
