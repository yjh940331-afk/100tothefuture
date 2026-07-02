import { getSupabase, getSupabaseAdmin, isDbConfigured } from "./supabase";
import {
  notifyBookingCreated,
  notifyBookingStatusChanged,
  notifyLessonRequestCreated,
} from "./notifications";
import {
  SEED_INSTRUCTORS,
  SEED_REVIEWS,
  seedBySlug,
  seedReviewsFor,
} from "./seed-data";
import type {
  BookingStatus,
  AvailabilityRule,
  Booking,
  Instructor,
  LessonRequest,
  LessonRequestStatus,
  ReviewSummary,
} from "./types";

const BOOKING_BLOCKING_STATUSES = ["requested", "confirmed"] as const;

function isValidDate(value?: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isValidTime(value?: string | null): value is string {
  return Boolean(value && /^\d{2}:\d{2}$/.test(value));
}

function toMinutes(time: string): number {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function koreaToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

function dayOfWeekInKorea(date: string): number {
  return new Date(`${date}T12:00:00+09:00`).getUTCDay();
}

function timeWithin(start: string, end: string, time: string): boolean {
  const value = toMinutes(time);
  return toMinutes(start) <= value && value < toMinutes(end);
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

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

function isFoundingInstructor(instructor: Instructor): boolean {
  return (
    instructor.slug === "lee-hyun" || instructor.badges.includes("founding_pro")
  );
}

function foundingFirst(a: Instructor, b: Instructor): number {
  return Number(isFoundingInstructor(b)) - Number(isFoundingInstructor(a));
}

function sortablePrice(instructor: Instructor): number {
  return instructor.price_from > 0
    ? instructor.price_from
    : Number.MAX_SAFE_INTEGER;
}

function applyFilters(list: Instructor[], f: InstructorFilters): Instructor[] {
  let out = list.filter((i) => i.is_active);
  if (f.region) out = out.filter((i) => i.region === f.region);
  if (f.specialty)
    out = out.filter((i) => i.specialties.includes(f.specialty!));
  if (f.place) out = out.filter((i) => i.lesson_places.includes(f.place!));
  if (f.gender) out = out.filter((i) => i.gender === f.gender);
  if (f.priceMax) out = out.filter((i) => i.price_from <= f.priceMax!);
  if (f.timeSlot)
    out = out.filter((i) => matchesTimeSlot(i.availability, f.timeSlot));

  switch (f.sort) {
    case "rating":
      out.sort((a, b) => foundingFirst(a, b) || b.rating_avg - a.rating_avg);
      break;
    case "reviews":
      out.sort(
        (a, b) => foundingFirst(a, b) || b.review_count - a.review_count,
      );
      break;
    case "price":
      out.sort(
        (a, b) => foundingFirst(a, b) || sortablePrice(a) - sortablePrice(b),
      );
      break;
    default: // recommended: featured 먼저, 그다음 평점
      out.sort(
        (a, b) =>
          foundingFirst(a, b) ||
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

  const [
    { data: certs },
    { data: packages },
    { data: availability },
    { data: stat },
  ] = await Promise.all([
    sb
      .from("instructor_certifications")
      .select("*")
      .eq("instructor_id", row.id),
    sb
      .from("lesson_packages")
      .select("*")
      .eq("instructor_id", row.id)
      .eq("is_active", true)
      .order("sort_order"),
    sb
      .from("availability_rules")
      .select("*")
      .eq("instructor_id", row.id)
      .eq("is_active", true),
    sb
      .from("instructor_rating_stats")
      .select("*")
      .eq("instructor_id", row.id)
      .maybeSingle(),
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
  const { data } = await sb
    .from("instructors")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((r: any) => r.slug);
}

export async function getReviews(
  instructorId: string,
): Promise<ReviewSummary[]> {
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

export interface CreateLessonRequestInput {
  customer_name: string;
  customer_phone: string;
  region: string;
  lesson_places?: string[];
  goals?: string[];
  skill_level?: string | null;
  score_range?: string | null;
  preferred_days?: string[];
  preferred_time_slot?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  instructor_gender_preference?: string | null;
  package_preference?: string | null;
  memo?: string | null;
  privacy_agreed: boolean;
  marketing_agreed?: boolean;
}

function marketplaceTableError(error?: string) {
  if (!error) return false;
  return (
    error.includes("lesson_requests") ||
    error.includes("lesson_quotes") ||
    error.includes("Could not find the table") ||
    error.includes("does not exist") ||
    error.includes("schema cache")
  );
}

function normalizeBudget(value?: number | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

export async function createLessonRequest(
  input: CreateLessonRequestInput,
): Promise<{ ok: boolean; id?: string; demo?: boolean; error?: string }> {
  const name = input.customer_name.trim();
  const phone = input.customer_phone.trim();
  const region = input.region.trim();
  const lessonPlaces = cleanList(input.lesson_places);
  const goals = cleanList(input.goals);
  const preferredDays = cleanList(input.preferred_days);

  if (!name || !phone || !region) {
    return { ok: false, error: "이름, 연락처, 지역을 입력해주세요." };
  }
  if (!input.privacy_agreed) {
    return { ok: false, error: "개인정보 수집 및 이용 동의가 필요합니다." };
  }
  if (goals.length === 0) {
    return { ok: false, error: "레슨 목표를 하나 이상 선택해주세요." };
  }
  if (!isDbConfigured()) {
    return { ok: true, demo: true, id: `demo-request-${Date.now()}` };
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return {
      ok: false,
      error: "견적 요청 저장을 위한 서버 권한이 설정되지 않았습니다.",
    };
  }

  const budgetMin = normalizeBudget(input.budget_min);
  const budgetMax = normalizeBudget(input.budget_max);
  if (budgetMin && budgetMax && budgetMin > budgetMax) {
    return { ok: false, error: "예산 범위를 다시 확인해주세요." };
  }

  const payload = {
    customer_name: name,
    customer_phone: phone,
    region,
    lesson_places: lessonPlaces,
    goals,
    skill_level: input.skill_level?.trim() || null,
    score_range: input.score_range?.trim() || null,
    preferred_days: preferredDays,
    preferred_time_slot: input.preferred_time_slot?.trim() || null,
    budget_min: budgetMin,
    budget_max: budgetMax,
    instructor_gender_preference:
      input.instructor_gender_preference?.trim() || null,
    package_preference: input.package_preference?.trim() || null,
    memo: input.memo?.trim() || null,
    privacy_agreed: Boolean(input.privacy_agreed),
    marketing_agreed: Boolean(input.marketing_agreed),
    status: "open" as LessonRequestStatus,
  };

  const { data, error } = await sb
    .from("lesson_requests")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    const hint = marketplaceTableError(error.message)
      ? " Supabase SQL Editor에서 supabase/marketplace.sql을 먼저 실행해주세요."
      : "";
    return { ok: false, error: `${error.message}${hint}` };
  }

  await notifyLessonRequestCreated({
    id: data.id,
    customer_name: name,
    customer_phone: phone,
    region,
    goals,
    preferred_days: preferredDays,
    preferred_time_slot: payload.preferred_time_slot,
    budget_min: budgetMin,
    budget_max: budgetMax,
  });

  return { ok: true, id: data.id };
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
  if (!input.privacy_agreed) {
    return { ok: false, error: "개인정보 수집·이용 동의가 필요합니다." };
  }
  if (input.preferred_date && !isValidDate(input.preferred_date)) {
    return { ok: false, error: "희망 날짜 형식이 올바르지 않습니다." };
  }
  if (input.preferred_time && !isValidTime(input.preferred_time)) {
    return { ok: false, error: "희망 시간 형식이 올바르지 않습니다." };
  }
  if (input.preferred_date && input.preferred_date < koreaToday()) {
    return { ok: false, error: "지난 날짜로는 예약을 요청할 수 없습니다." };
  }
  if (!isDbConfigured()) {
    // DB 미설정: 데모 모드 — 실제 저장 대신 성공 처리 (실서비스 전 Supabase 연결 필요)
    return { ok: true, demo: true };
  }
  // 서버(API 라우트)에서 실행되므로 service_role 로 검증/저장한다.
  const sb = getSupabaseAdmin();
  if (!sb) {
    return {
      ok: false,
      error: "예약 저장을 위한 서버 권한이 설정되지 않았습니다.",
    };
  }

  const { data: instructor } = await sb
    .from("instructors")
    .select("id, display_name")
    .eq("id", input.instructor_id)
    .eq("is_active", true)
    .maybeSingle();
  if (!instructor) {
    return { ok: false, error: "예약 가능한 프로를 찾을 수 없습니다." };
  }

  if (input.lesson_package_id) {
    const { data: lessonPackage } = await sb
      .from("lesson_packages")
      .select("id")
      .eq("id", input.lesson_package_id)
      .eq("instructor_id", input.instructor_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!lessonPackage) {
      return { ok: false, error: "선택한 레슨 상품을 확인할 수 없습니다." };
    }
  }

  if (input.preferred_date && input.preferred_time) {
    const [
      { data: rules },
      { data: exceptions },
      { data: conflictingBookings },
    ] = await Promise.all([
      sb
        .from("availability_rules")
        .select("*")
        .eq("instructor_id", input.instructor_id)
        .eq("day_of_week", dayOfWeekInKorea(input.preferred_date))
        .eq("is_active", true),
      sb
        .from("availability_exceptions")
        .select("*")
        .eq("instructor_id", input.instructor_id)
        .eq("date", input.preferred_date),
      sb
        .from("bookings")
        .select("id")
        .eq("instructor_id", input.instructor_id)
        .eq("preferred_date", input.preferred_date)
        .eq("preferred_time", input.preferred_time)
        .in("status", BOOKING_BLOCKING_STATUSES),
    ]);

    const blocked = (exceptions ?? []).some(
      (ex: any) =>
        ex.type === "block" &&
        (!ex.start_time ||
          !ex.end_time ||
          timeWithin(ex.start_time, ex.end_time, input.preferred_time!)),
    );
    if (blocked) {
      return {
        ok: false,
        error: "해당 시간은 프로 일정상 예약할 수 없습니다.",
      };
    }

    const exceptionOpen = (exceptions ?? []).some(
      (ex: any) =>
        ex.type === "open" &&
        ex.start_time &&
        ex.end_time &&
        timeWithin(ex.start_time, ex.end_time, input.preferred_time!),
    );
    const ruleOpen = (rules ?? []).some((rule: any) =>
      timeWithin(rule.start_time, rule.end_time, input.preferred_time!),
    );
    if (!exceptionOpen && !ruleOpen) {
      return {
        ok: false,
        error: "프로의 가능 시간 안에서 희망 시간을 선택해주세요.",
      };
    }

    if ((conflictingBookings ?? []).length > 0) {
      return {
        ok: false,
        error: "이미 요청되었거나 확정된 시간입니다. 다른 시간을 선택해주세요.",
      };
    }
  }

  const { data, error } = await sb
    .from("bookings")
    .insert({ ...input, status: "requested" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // 동의 로그 기록
  await sb.from("consent_logs").insert([
    {
      booking_id: data.id,
      consent_type: "privacy",
      agreed: input.privacy_agreed,
    },
    {
      booking_id: data.id,
      consent_type: "third_party",
      agreed: input.third_party_agreed,
    },
  ]);

  await notifyBookingCreated({
    id: data.id,
    instructor_id: input.instructor_id,
    instructor_name: instructor.display_name,
    student_name: input.student_name,
    student_phone: input.student_phone,
    preferred_date: input.preferred_date,
    preferred_time: input.preferred_time,
    region: input.region,
    goal: input.goal,
  });
  return { ok: true, id: data.id };
}

export async function customerLookupBooking(input: {
  booking_id: string;
  student_phone: string;
}): Promise<{ ok: boolean; booking?: Booking; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb)
    return { ok: false, error: "예약 조회를 위한 서버 설정이 필요합니다." };

  const bookingId = input.booking_id.trim();
  const phone = normalizePhone(input.student_phone);
  if (!bookingId || !phone) {
    return { ok: false, error: "예약번호와 연락처를 입력해주세요." };
  }

  const { data, error } = await sb
    .from("bookings")
    .select("*, instructors(display_name, slug), lesson_packages(title)")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data || normalizePhone(data.student_phone ?? "") !== phone) {
    return { ok: false, error: "예약 정보를 찾을 수 없습니다." };
  }

  return {
    ok: true,
    booking: {
      ...data,
      instructor_name: data.instructors?.display_name,
      package_title: data.lesson_packages?.title,
    } as Booking,
  };
}

export async function customerCancelBooking(input: {
  booking_id: string;
  student_phone: string;
}): Promise<{ ok: boolean; booking?: Booking; error?: string }> {
  const found = await customerLookupBooking(input);
  if (!found.ok || !found.booking) return found;

  if (!["requested", "confirmed"].includes(found.booking.status)) {
    return { ok: false, error: "이미 완료되었거나 취소할 수 없는 예약입니다." };
  }

  const sb = getSupabaseAdmin();
  if (!sb)
    return { ok: false, error: "예약 취소를 위한 서버 설정이 필요합니다." };
  const { error } = await sb
    .from("bookings")
    .update({ status: "canceled" })
    .eq("id", found.booking.id);
  if (error) return { ok: false, error: error.message };
  await notifyBookingStatusChanged({
    id: found.booking.id,
    status: "canceled",
    student_name: found.booking.student_name,
    student_phone: found.booking.student_phone,
    instructor_name: found.booking.instructor_name,
    preferred_date: found.booking.preferred_date,
    preferred_time: found.booking.preferred_time,
  });

  return customerLookupBooking(input);
}

export interface CreateReviewInput {
  instructor_id: string;
  student_phone: string;
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
  if (!input.student_phone.trim()) {
    return { ok: false, error: "예약 시 사용한 연락처를 입력해주세요." };
  }
  if (!isDbConfigured()) return { ok: true, demo: true };
  const sb = getSupabaseAdmin();
  if (!sb)
    return {
      ok: false,
      error: "후기 등록을 위한 서버 권한이 설정되지 않았습니다.",
    };

  const { data: booking } = await sb
    .from("bookings")
    .select("id")
    .eq("instructor_id", input.instructor_id)
    .eq("student_phone", input.student_phone.trim())
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!booking) {
    return {
      ok: false,
      error:
        "완료된 예약을 확인할 수 없습니다. 예약 시 사용한 연락처를 입력해주세요.",
    };
  }

  const { data: existing } = await sb
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "이미 해당 예약으로 후기가 등록되었습니다." };
  }

  const { error } = await sb.from("reviews").insert({
    booking_id: booking.id,
    instructor_id: input.instructor_id,
    student_name_masked: input.student_name_masked,
    rating_total: input.rating_total,
    rating_kindness: input.rating_kindness,
    rating_explanation: input.rating_explanation,
    rating_effect: input.rating_effect,
    recommend_for: input.recommend_for,
    content: input.content,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------- 관리자 ----------
export async function adminListLessonRequests(): Promise<LessonRequest[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("lesson_requests")
    .select("*, lesson_quotes(id)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Failed to list lesson requests", error.message);
    return [];
  }
  return (data ?? []).map((row: any) => {
    const quotes = Array.isArray(row.lesson_quotes) ? row.lesson_quotes : [];
    const request = { ...row };
    delete request.lesson_quotes;
    return {
      ...request,
      lesson_places: request.lesson_places ?? [],
      goals: request.goals ?? [],
      preferred_days: request.preferred_days ?? [],
      matched_instructor_ids: request.matched_instructor_ids ?? [],
      quote_count: quotes.length,
    };
  }) as LessonRequest[];
}

export async function adminUpdateLessonRequest(
  id: string,
  input: {
    status?: LessonRequestStatus;
    admin_memo?: string;
    matched_instructor_ids?: string[];
  },
) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (typeof input.admin_memo === "string") patch.admin_memo = input.admin_memo;
  if (input.matched_instructor_ids)
    patch.matched_instructor_ids = cleanList(input.matched_instructor_ids);
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "변경할 내용이 없습니다." };
  }
  const { error } = await sb.from("lesson_requests").update(patch).eq("id", id);
  if (error) {
    const hint = marketplaceTableError(error.message)
      ? " Supabase SQL Editor에서 supabase/marketplace.sql을 먼저 실행해주세요."
      : "";
    return { ok: false, error: `${error.message}${hint}` };
  }
  return { ok: true };
}

export async function adminListBookings(): Promise<Booking[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("bookings")
    .select("*, instructors(display_name), lesson_packages(title)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((b: any) => ({
    ...b,
    instructor_name: b.instructors?.display_name,
    package_title: b.lesson_packages?.title,
  })) as Booking[];
}

async function bookingNotificationSnapshot(id: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("bookings")
    .select(
      "id, status, student_name, student_phone, preferred_date, preferred_time, instructors(display_name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const instructors = data.instructors as any;
  const instructorName = Array.isArray(instructors)
    ? instructors[0]?.display_name
    : instructors?.display_name;
  return {
    id: data.id,
    status: data.status,
    student_name: data.student_name,
    student_phone: data.student_phone,
    preferred_date: data.preferred_date,
    preferred_time: data.preferred_time,
    instructor_name: instructorName,
  };
}

export async function adminUpdateBookingStatus(id: string, status: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const { error } = await sb.from("bookings").update({ status }).eq("id", id);
  if (!error) {
    const snapshot = await bookingNotificationSnapshot(id);
    await notifyBookingStatusChanged(snapshot ?? { id, status });
  }
  return { ok: !error, error: error?.message };
}

export async function adminUpdateBookingDetails(
  id: string,
  input: { status?: BookingStatus; admin_memo?: string },
) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (typeof input.admin_memo === "string") patch.admin_memo = input.admin_memo;
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "변경할 내용이 없습니다." };
  }
  const { error } = await sb.from("bookings").update(patch).eq("id", id);
  if (!error && input.status) {
    const snapshot = await bookingNotificationSnapshot(id);
    await notifyBookingStatusChanged(snapshot ?? { id, status: input.status });
  }
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

export async function adminUpdateReviewReply(
  id: string,
  instructor_reply: string,
) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const { error } = await sb
    .from("reviews")
    .update({ instructor_reply: instructor_reply.trim() || null })
    .eq("id", id);
  return { ok: !error, error: error?.message };
}

export interface AdminInstructorInput {
  id?: string;
  slug: string;
  display_name: string;
  profile_image?: string;
  gallery?: string[];
  intro_video_url?: string | null;
  bio?: string;
  about?: string;
  region: string;
  lesson_places?: string[];
  specialties?: string[];
  career_years?: number;
  career_history?: string[];
  lesson_style?: string[];
  gender?: "male" | "female";
  price_from?: number;
  response_time?: string | null;
  badges?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  verification_status?: "pending" | "verified" | "rejected";
  curriculum?: { session: number; title: string }[];
}

function cleanList(values?: string[]) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

export async function adminSaveInstructor(input: AdminInstructorInput) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };

  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false,
      error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
    };
  }
  if (!input.display_name.trim() || !input.region.trim()) {
    return { ok: false, error: "프로명과 지역은 필수입니다." };
  }

  const payload = {
    slug,
    display_name: input.display_name.trim(),
    profile_image: input.profile_image?.trim() ?? "",
    gallery: cleanList(input.gallery),
    intro_video_url: input.intro_video_url?.trim() || null,
    bio: input.bio?.trim() ?? "",
    about: input.about?.trim() ?? "",
    region: input.region.trim(),
    lesson_places: cleanList(input.lesson_places),
    specialties: cleanList(input.specialties),
    career_years: Math.max(0, Number(input.career_years ?? 0)),
    career_history: cleanList(input.career_history),
    lesson_style: cleanList(input.lesson_style),
    gender: input.gender === "female" ? "female" : "male",
    price_from: Math.max(0, Number(input.price_from ?? 0)),
    response_time: input.response_time?.trim() || null,
    badges: cleanList(input.badges),
    is_featured: Boolean(input.is_featured),
    is_active: input.is_active !== false,
    verification_status: input.verification_status ?? "pending",
    curriculum: input.curriculum ?? [],
  };

  const query = input.id
    ? sb
        .from("instructors")
        .update(payload)
        .eq("id", input.id)
        .select("id")
        .single()
    : sb.from("instructors").insert(payload).select("id").single();
  const { data, error } = await query;
  return { ok: !error, id: data?.id, error: error?.message };
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
