import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  adminUpdateLessonRequest,
  adminUpdateBookingDetails,
  adminUpdateBookingStatus,
  adminUpdateReviewReply,
  adminUpdateReviewStatus,
} from "@/lib/data";

const BOOKING_STATUSES = new Set([
  "requested",
  "confirmed",
  "completed",
  "canceled",
  "rejected",
  "no_show",
]);
const REVIEW_STATUSES = new Set(["pending", "visible", "hidden", "reported"]);
const LESSON_REQUEST_STATUSES = new Set([
  "open",
  "contacted",
  "quoted",
  "closed",
  "canceled",
]);

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { ok: false, error: "권한이 없습니다." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { type, id, status } = body;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "대상 ID가 필요합니다." },
      { status: 400 },
    );
  }

  let result;
  if (type === "booking") {
    if (!BOOKING_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "허용되지 않은 예약 상태입니다." },
        { status: 400 },
      );
    }
    result = await adminUpdateBookingStatus(id, status);
  } else if (type === "booking_details") {
    if (status && !BOOKING_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "허용되지 않은 예약 상태입니다." },
        { status: 400 },
      );
    }
    result = await adminUpdateBookingDetails(id, {
      status,
      admin_memo:
        typeof body.admin_memo === "string" ? body.admin_memo : undefined,
    });
  } else if (type === "review") {
    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "허용되지 않은 후기 상태입니다." },
        { status: 400 },
      );
    }
    result = await adminUpdateReviewStatus(id, status);
  } else if (type === "review_reply") {
    result = await adminUpdateReviewReply(
      id,
      typeof body.instructor_reply === "string" ? body.instructor_reply : "",
    );
  } else if (type === "lesson_request") {
    if (status && !LESSON_REQUEST_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "허용되지 않는 견적 요청 상태입니다." },
        { status: 400 },
      );
    }
    result = await adminUpdateLessonRequest(id, {
      status,
      admin_memo:
        typeof body.admin_memo === "string" ? body.admin_memo : undefined,
      matched_instructor_ids: Array.isArray(body.matched_instructor_ids)
        ? body.matched_instructor_ids
        : undefined,
    });
  } else {
    return NextResponse.json(
      { ok: false, error: "알 수 없는 요청 유형입니다." },
      { status: 400 },
    );
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
