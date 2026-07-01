import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { adminUpdateBookingStatus, adminUpdateReviewStatus } from "@/lib/data";

export const runtime = "edge";

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
  if (type === "booking") result = await adminUpdateBookingStatus(id, status);
  else if (type === "review") result = await adminUpdateReviewStatus(id, status);
  else return NextResponse.json({ ok: false, error: "알 수 없는 유형" }, { status: 400 });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
