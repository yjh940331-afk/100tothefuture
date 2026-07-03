import { NextResponse } from "next/server";
import {
  customerCancelBooking,
  customerLookupBooking,
  customerListBookingsByPhone,
} from "@/lib/data";

function normalizeBody(body: any) {
  return {
    booking_id: String(body.booking_id ?? body.bookingId ?? "").trim(),
    student_phone: String(body.student_phone ?? body.studentPhone ?? "").trim(),
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = normalizeBody(body);
  // 예약번호가 있으면 단건, 없으면 연락처로 목록 조회
  if (input.booking_id) {
    const result = await customerLookupBooking(input);
    return NextResponse.json(result, { status: result.ok ? 200 : 404 });
  }
  const result = await customerListBookingsByPhone(input.student_phone);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = normalizeBody(body);
  const result = await customerCancelBooking(input);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
