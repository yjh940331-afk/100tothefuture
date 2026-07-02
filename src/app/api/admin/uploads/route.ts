import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "pro-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function cleanSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function cleanKind(value: unknown) {
  return value === "gallery" ? "gallery" : "profile";
}

async function ensurePublicBucket() {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false as const, error: "DB 미설정" };

  const { data: buckets, error: listError } = await sb.storage.listBuckets();
  if (listError) return { ok: false as const, error: listError.message };
  if (buckets?.some((bucket) => bucket.name === BUCKET)) {
    return { ok: true as const, sb };
  }

  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Object.keys(ALLOWED_IMAGE_TYPES),
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, sb };
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const slug = cleanSlug(form?.get("slug"));
  const kind = cleanKind(form?.get("kind"));

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "먼저 영문 슬러그를 입력해주세요." },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "업로드할 사진을 선택해주세요." }, { status: 400 });
  }
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "JPG, PNG, WebP 이미지만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: "이미지는 8MB 이하로 업로드해주세요." },
      { status: 400 },
    );
  }

  const ready = await ensurePublicBucket();
  if (!ready.ok) {
    return NextResponse.json({ ok: false, error: ready.error }, { status: 500 });
  }

  const path = `instructors/${slug}/${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await ready.sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data } = ready.sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, path });
}
