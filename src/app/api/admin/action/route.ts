import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { adminUpdateBookingStatus, adminUpdateReviewStatus } from "@/lib/data";

const BOOKING_STATUSES = new Set([
  "requested",
  "confirmed",
  "completed",
  "canceled",
  "rejected",
  "no_show",
]);
const REVIEW_STATUSES = new Set(["pending", "visible", "hidden", "reported"]);

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "권한 없음" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { type, id, status } = body;
  if (!id || !status) {
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }

  let result;
  if (type === "booking") {
    if (!BOOKING_STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "허용되지 않은 예약 상태" }, { status: 400 });
    }
    result = await adminUpdateBookingStatus(id, status);
  } else if (type === "review") {
    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "허용되지 않은 후기 상태" }, { status: 400 });
    }
    result = await adminUpdateReviewStatus(id, status);
  } else {
    return NextResponse.json({ ok: false, error: "알 수 없는 유형" }, { status: 400 });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
