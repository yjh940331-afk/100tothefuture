import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getProImagesBucket, publicMediaUrl } from "@/lib/r2";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
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

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const slug = cleanSlug(form?.get("slug"));
  const kind = cleanKind(form?.get("kind"));
  const cropped = form?.get("cropped") === "true";

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "먼저 영문 슬러그를 입력해주세요." },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "업로드할 사진을 선택해주세요." }, { status: 400 });
  }
  if (!cropped) {
    return NextResponse.json(
      { ok: false, error: "사진은 편집 화면을 거쳐 업로드해주세요. 페이지를 새로고침한 뒤 다시 시도해주세요." },
      { status: 400 },
    );
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
      { ok: false, error: "이미지는 25MB 이하로 업로드해주세요." },
      { status: 400 },
    );
  }

  const bucket = getProImagesBucket();
  if (!bucket) {
    return NextResponse.json(
      { ok: false, error: "R2 이미지 저장소가 연결되지 않았습니다." },
      { status: 500 },
    );
  }

  const path = `instructors/${slug}/${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket.put(path, file, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      uploadedBy: "admin",
      slug,
      kind,
      cropped: "true",
    },
  });

  return NextResponse.json({ ok: true, url: publicMediaUrl(path), path, storage: "r2" });
}
