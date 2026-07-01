import { getSupabase, getSupabaseAdmin, isDbConfigured } from "./supabase";
import { SEED_INSTRUCTORS, SEED_REVIEWS, seedBySlug, seedReviewsFor } from "./seed-data";
import type {
  AvailabilityRule,
  Booking,
  Instructor,
  ReviewSummary,
} from "./types";

export interface InstructorFilters {
  region?: string;
  specialty?: string;
  place?: string;
  timeSlot?: string; // weekday_morning | weekday_evening | weekend
  priceMax?: number;
  gender?: string;
  sort?: "recommended" | "rating" | "reviews" | "price" | "new";
}

// ---------- 매핑 ----------
function mapInstructor(row: any, extra: Partial<Instructor> = {}): Instructor {
  return {
    id: row.id,
    slug: row.slug,
    display_name: row.display_name,
    profile_image: row.profile_image ?? "",
    gallery: row.gallery ?? [],
    intro_video_url: row.intro_video_url ?? null,
    bio: row.bio ?? "",
    about: row.about ?? "",
    region: row.region,
    lesson_places: row.lesson_places ?? [],
    specialties: row.specialties ?? [],
    career_years: row.career_years ?? 0,
    career_history: row.career_history ?? [],
    lesson_style: row.lesson_style ?? [],
    gender: row.gender ?? "male",
    price_from: row.price_from ?? 0,
    response_time: row.response_time ?? null,
    badges: row.badges ?? [],
    is_featured: row.is_featured ?? false,
    is_active: row.is_active ?? true,
    verification_status: row.verification_status ?? "pending",
    curriculum: row.curriculum ?? [],
    certifications: extra.certifications ?? [],
    packages: extra.packages ?? [],
    availability: extra.availability ?? [],
    rating_avg: extra.rating_avg ?? 0,
    review_count: extra.review_count ?? 0,
  };
}

// ---------- 시간대 필터 ----------
function matchesTimeSlot(rules: AvailabilityRule[], slot?: string): boolean {
  if (!slot) return true;
  return rules.some((r) => {
    const startHour = parseInt(r.start_time.slice(0, 2), 10);
    const endHour = parseInt(r.end_time.slice(0, 2), 10);
    const weekday = r.day_of_week >= 1 && r.day_of_week <= 5;
    const weekend = r.day_of_week === 0 || r.day_of_week === 6;
    if (slot === "weekday_morning") return weekday && startHour < 12;
    if (slot === "weekday_evening") return weekday && endHour > 17;
    if (slot === "weekend") return weekend;
    return true;
  });
}

function applyFilters(list: Instructor[], f: InstructorFilters): Instructor[] {
  let out = list.filter((i) => i.is_active);
  if (f.region) out = out.filter((i) => i.region === f.region);
  if (f.specialty) out = out.filter((i) => i.specialties.includes(f.specialty!));
  if (f.place) out = out.filter((i) => i.lesson_places.includes(f.place!));
  if (f.gender) out = out.filter((i) => i.gender === f.gender);
  if (f.priceMax) out = out.filter((i) => i.price_from <= f.priceMax!);
  if (f.timeSlot) out = out.filter((i) => matchesTimeSlot(i.availability, f.timeSlot));

  switch (f.sort) {
    case "rating":
      out.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case "reviews":
      out.sort((a, b) => b.review_count - a.review_count);
      break;
    case "price":
      out.sort((a, b) => a.price_from - b.price_from);
      break;
    default: // recommended: featured 먼저, 그다음 평점
      out.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          b.rating_avg - a.rating_avg,
      );
  }
  return out;
}

// ---------- 읽기 ----------
export async function listInstructors(
  f: InstructorFilters = {},
): Promise<Instructor[]> {
  const sb = getSupabase();
  if (!sb) return applyFilters(SEED_INSTRUCTORS, f);

  const [{ data: rows }, { data: stats }, { data: rules }] = await Promise.all([
    sb.from("instructors").select("*").eq("is_active", true),
    sb.from("instructor_rating_stats").select("*"),
    sb.from("availability_rules").select("*").eq("is_active", true),
  ]);

  const statMap = new Map((stats ?? []).map((s: any) => [s.instructor_id, s]));
  const ruleMap = new Map<string, AvailabilityRule[]>();
  (rules ?? []).forEach((r: any) => {
    const arr = ruleMap.get(r.instructor_id) ?? [];
    arr.push(r);
    ruleMap.set(r.instructor_id, arr);
  });

  const list = (rows ?? []).map((row: any) => {
    const s = statMap.get(row.id);
    return mapInstructor(row, {
      rating_avg: Number(s?.rating_avg ?? 0),
      review_count: Number(s?.review_count ?? 0),
      availability: ruleMap.get(row.id) ?? [],
    });
  });
  return applyFilters(list, f);
}

export async function getFeaturedInstructors(limit = 3): Promise<Instructor[]> {
  const list = await listInstructors({ sort: "recommended" });
  const featured = list.filter((i) => i.is_featured);
  return (featured.length ? featured : list).slice(0, limit);
}

export async function getInstructorBySlug(
  slug: string,
): Promise<Instructor | null> {
  const sb = getSupabase();
  if (!sb) return seedBySlug(slug) ?? null;

  const { data: row } = await sb
    .from("instructors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!row) return null;

  const [{ data: certs }, { data: packages }, { data: availability }, { data: stat }] =
    await Promise.all([
      sb.from("instructor_certifications").select("*").eq("instructor_id", row.id),
      sb
        .from("lesson_packages")
        .select("*")
        .eq("instructor_id", row.id)
        .eq("is_active", true)
        .order("sort_order"),
      sb.from("availability_rules").select("*").eq("instructor_id", row.id).eq("is_active", true),
      sb.from("instructor_rating_stats").select("*").eq("instructor_id", row.id).maybeSingle(),
    ]);

  return mapInstructor(row, {
    certifications: certs ?? [],
    packages: packages ?? [],
    availability: (availability ?? []) as AvailabilityRule[],
    rating_avg: Number(stat?.rating_avg ?? 0),
    review_count: Number(stat?.review_count ?? 0),
  });
}

export async function getAllSlugs(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return SEED_INSTRUCTORS.map((i) => i.slug);
  const { data } = await sb.from("instructors").select("slug").eq("is_active", true);
  return (data ?? []).map((r: any) => r.slug);
}

export async function getReviews(instructorId: string): Promise<ReviewSummary[]> {
  const sb = getSupabase();
  if (!sb) return seedReviewsFor(instructorId);
  const { data } = await sb
    .from("reviews")
    .select("*")
    .eq("instructor_id", instructorId)
    .eq("status", "visible")
    .order("created_at", { ascending: false });
  return (data ?? []) as ReviewSummary[];
}

// ---------- 쓰기 ----------
export interface CreateBookingInput {
  instructor_id: string;
  lesson_package_id?: string | null;
  student_name: string;
  student_phone: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  region?: string | null;
  goal?: string | null;
  privacy_agreed: boolean;
  third_party_agreed: boolean;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<{ ok: boolean; id?: string; demo?: boolean; error?: string }> {
  if (!isDbConfigured()) {
    // DB 미설정: 데모 모드 — 실제 저장 대신 성공 처리 (실서비스 전 Supabase 연결 필요)
    return { ok: true, demo: true };
  }
  const sb = getSupabase()!;
  const { data, error } = await sb
    .from("bookings")
    .insert({ ...input, status: "requested" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // 동의 로그 기록
  await sb.from("consent_logs").insert([
    { booking_id: data.id, consent_type: "privacy", agreed: input.privacy_agreed },
    { booking_id: data.id, consent_type: "third_party", agreed: input.third_party_agreed },
  ]);
  return { ok: true, id: data.id };
}

export interface CreateReviewInput {
  instructor_id: string;
  student_name_masked: string;
  rating_total: number;
  rating_kindness?: number;
  rating_explanation?: number;
  rating_effect?: number;
  recommend_for?: string;
  content: string;
}

export async function createReview(
  input: CreateReviewInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isDbConfigured()) return { ok: true, demo: true };
  const sb = getSupabase()!;
  const { error } = await sb.from("reviews").insert({ ...input, status: "pending" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------- 관리자 ----------
export async function adminListBookings(): Promise<Booking[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("bookings")
    .select("*, instructors(display_name)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((b: any) => ({
    ...b,
    instructor_name: b.instructors?.display_name,
  })) as Booking[];
}

export async function adminUpdateBookingStatus(id: string, status: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const { error } = await sb.from("bookings").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function adminListReviews(): Promise<ReviewSummary[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("reviews")
    .select("*, instructors(display_name)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    ...r,
    instructor_name: r.instructors?.display_name,
  })) as ReviewSummary[];
}

export async function adminUpdateReviewStatus(id: string, status: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const { error } = await sb.from("reviews").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function adminListInstructors(): Promise<Instructor[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return SEED_INSTRUCTORS;
  const { data } = await sb.from("instructors").select("*").order("created_at");
  return (data ?? []).map((row: any) => mapInstructor(row));
}

export { isDbConfigured };
export const DEMO_MODE = !isDbConfigured();
export const SEED_REVIEW_COUNT = SEED_REVIEWS.length;
