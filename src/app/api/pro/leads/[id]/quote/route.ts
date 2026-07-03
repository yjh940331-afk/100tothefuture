import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { sendProQuote } from "@/lib/data";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }
  if (profile.role !== "instructor") {
    return NextResponse.json(
      { ok: false, error: "프로 승인 후 사용할 수 있습니다." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const result = await sendProQuote(profile.id, id, {
    message: String(body.message ?? ""),
    price:
      body.price === null || body.price === undefined || body.price === ""
        ? null
        : Number(body.price),
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
