import type { Metadata } from "next";
import { BookingLookup } from "@/components/BookingLookup";

export const metadata: Metadata = {
  title: "내 예약 조회",
  description: "100 to the Future에서 신청한 골프 레슨 예약을 조회하고 취소할 수 있습니다.",
};

export default function BookingsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold text-gold-600">My Booking</p>
        <h1 className="mt-2 text-3xl font-black text-fairway-900 sm:text-4xl">내 예약 조회</h1>
        <p className="mt-3 text-base leading-7 text-fairway-600">
          예약번호와 연락처로 예약 상태를 확인하고, 확정 전 예약은 직접 취소할 수 있습니다.
        </p>
      </div>
      <BookingLookup />
    </div>
  );
}

