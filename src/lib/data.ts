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
  InstructorApplication,
  InstructorApplicationStatus,
  LessonRequest,
  LessonRequestStatus,
  ProLead,
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
    user_id: row.user_id ?? null,
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

function hasPublicInstructorImage(
  instructor: Pick<Instructor, "profile_image">,
) {
  return instructor.profile_image.trim().length > 0;
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

function isPinnedInstructor(instructor: Pick<Instructor, "slug" | "badges">) {
  return instructor.slug === "lee-hyun";
}

function foundingFirst(a: Instructor, b: Instructor): number {
  const rank = (instructor: Instructor) => {
    if (isPinnedInstructor(instructor)) return 0;
    if (instructor.badges.includes("founding_pro")) return 1;
    return 2;
  };
  return rank(a) - rank(b);
}

function sortablePrice(instructor: Instructor): number {
  return instructor.price_from > 0
    ? instructor.price_from
    : Number.MAX_SAFE_INTEGER;
}

function applyFilters(list: Instructor[], f: InstructorFilters): Instructor[] {
  let out = list.filter((i) => i.is_active && hasPublicInstructorImage(i));
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
  const pinned = list.filter(isPinnedInstructor);
  const featured = list.filter((i) => i.is_featured && !isPinnedInstructor(i));
  const rest = list.filter((i) => !i.is_featured && !isPinnedInstructor(i));
  return [...pinned, ...featured, ...rest].slice(0, limit);
}

export async function getRecommendedInstructorsForMember(
  userId?: string | null,
  limit = 3,
): Promise<Instructor[]> {
  const list = await listInstructors({ sort: "recommended" });
  if (!userId || list.length === 0) return list.slice(0, limit);

  const sb = getSupabaseAdmin();
  if (!sb) return list.slice(0, limit);

  const [{ data: profile }, { data: student }] = await Promise.all([
    sb.from("profiles").select("region").eq("id", userId).maybeSingle(),
    sb
      .from("student_profiles")
      .select("current_avg_score,target_score,goal")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return [...list]
    .sort(
      (a, b) =>
        foundingFirst(a, b) ||
        scoreInstructorForMember(b, {
          region: profile?.region,
          goal: student?.goal,
          current_avg_score: student?.current_avg_score,
          target_score: student?.target_score,
        }) -
          scoreInstructorForMember(a, {
            region: profile?.region,
            goal: student?.goal,
            current_avg_score: student?.current_avg_score,
            target_score: student?.target_score,
          }),
    )
    .slice(0, limit);
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

  const instructor = mapInstructor(row, {
    certifications: certs ?? [],
    packages: packages ?? [],
    availability: (availability ?? []) as AvailabilityRule[],
    rating_avg: Number(stat?.rating_avg ?? 0),
    review_count: Number(stat?.review_count ?? 0),
  });
  return hasPublicInstructorImage(instructor) ? instructor : null;
}

export async function getAllSlugs(): Promise<string[]> {
  return (await listInstructors()).map((instructor) => instructor.slug);
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
  student_user_id?: string | null;
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
    error.includes("instructor_applications") ||
    error.includes("student_user_id") ||
    error.includes("kakao_channel_agreed") ||
    error.includes("Could not find the table") ||
    error.includes("does not exist") ||
    error.includes("schema cache")
  );
}

function normalizeBudget(value?: number | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

function makeInstructorSlug(input: {
  display_name: string;
  phone?: string;
  id: string;
}) {
  const ascii = input.display_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii) return `${ascii}-${input.id.slice(0, 6)}`;
  const digits = normalizePhone(input.phone ?? "");
  return `pro-${digits.slice(-4) || input.id.slice(0, 8)}`;
}

function textMatches(haystack: string, needles: string[]) {
  const target = haystack.toLowerCase();
  return needles.some(
    (needle) => needle && target.includes(needle.toLowerCase()),
  );
}

function scoreInstructorForMember(
  instructor: Instructor,
  context: {
    region?: string | null;
    goal?: string | null;
    current_avg_score?: number | null;
    target_score?: number | null;
  },
) {
  let score = 0;
  if (instructor.is_featured) score += 2;
  if (instructor.verification_status === "verified") score += 2;
  score += Math.min(instructor.rating_avg, 5);
  score += Math.min(instructor.review_count, 20) / 10;

  if (context.region && instructor.region === context.region) score += 5;

  const goal = context.goal?.trim();
  if (goal) {
    const fields = [
      instructor.bio,
      instructor.about,
      ...instructor.specialties,
      ...instructor.lesson_style,
    ];
    if (fields.some((field) => textMatches(field, [goal]))) score += 6;
    const goalWords = goal
      .split(/[\s,/·]+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2);
    if (fields.some((field) => textMatches(field, goalWords))) score += 3;
  }

  const current = Number(context.current_avg_score ?? 0);
  const target = Number(context.target_score ?? 0);
  if ((current >= 100 || target >= 90) && target > 0 && target < current) {
    if (instructor.specialties.some((item) => item.includes("100타")))
      score += 5;
    if (instructor.specialties.some((item) => item.includes("입문")))
      score += 2;
  }

  return score;
}

function scoreInstructorForRequest(
  instructor: Instructor,
  input: {
    region: string;
    goals: string[];
    lessonPlaces: string[];
  },
) {
  let score = 0;
  if (instructor.region === input.region) score += 6;
  score +=
    input.goals.filter((goal) => instructor.specialties.includes(goal)).length *
    5;
  score +=
    input.lessonPlaces.filter((place) =>
      instructor.lesson_places.includes(place),
    ).length * 3;
  if (instructor.verification_status === "verified") score += 2;
  if (instructor.is_featured) score += 1;
  score += Math.min(instructor.rating_avg, 5) / 2;
  return score;
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

  if (input.student_user_id) {
    const { error: linkError } = await sb
      .from("lesson_requests")
      .update({ student_user_id: input.student_user_id })
      .eq("id", data.id);
    if (linkError && !marketplaceTableError(linkError.message)) {
      console.error(
        "Failed to link lesson request to member",
        linkError.message,
      );
    }
  }

  await autoMatchLessonRequest(data.id, {
    region,
    goals,
    lessonPlaces,
  });

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

async function autoMatchLessonRequest(
  requestId: string,
  input: { region: string; goals: string[]; lessonPlaces: string[] },
) {
  const sb = getSupabaseAdmin();
  if (!sb) return;

  try {
    const candidates = await listInstructors({ sort: "recommended" });
    const matchedIds = candidates
      .map((instructor) => ({
        instructor,
        id: instructor.id,
        score: scoreInstructorForRequest(instructor, input),
      }))
      .filter((item) => item.score > 0 || isPinnedInstructor(item.instructor))
      .sort(
        (a, b) =>
          foundingFirst(a.instructor, b.instructor) || b.score - a.score,
      )
      .slice(0, 5)
      .map((item) => item.id);

    if (matchedIds.length === 0) return;
    const { error } = await sb
      .from("lesson_requests")
      .update({ matched_instructor_ids: matchedIds })
      .eq("id", requestId);
    if (error && !marketplaceTableError(error.message)) {
      console.error("Failed to auto-match lesson request", error.message);
    }
  } catch (error) {
    console.error("Failed to auto-match lesson request", error);
  }
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
  student_user_id?: string | null; // 로그인 계정 연결 (게스트는 null)
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

// 연락처만으로 내 예약 목록 조회 (예약번호 없이도)
export async function customerListBookingsByPhone(
  phoneInput: string,
): Promise<{ ok: boolean; bookings?: Booking[]; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb)
    return { ok: false, error: "예약 조회를 위한 서버 설정이 필요합니다." };

  const compact = normalizePhone(phoneInput);
  if (compact.length < 8) {
    return { ok: false, error: "연락처를 정확히 입력해주세요." };
  }
  const dashed =
    compact.length === 11
      ? `${compact.slice(0, 3)}-${compact.slice(3, 7)}-${compact.slice(7)}`
      : compact;

  const { data, error } = await sb
    .from("bookings")
    .select("*, instructors(display_name, slug), lesson_packages(title)")
    .or(`student_phone.eq.${compact},student_phone.eq.${dashed}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { ok: false, error: error.message };

  const bookings = (data ?? [])
    .filter((b: any) => normalizePhone(b.student_phone ?? "") === compact)
    .map((b: any) => ({
      ...b,
      instructor_name: b.instructors?.display_name,
      package_title: b.lesson_packages?.title,
    })) as Booking[];

  if (bookings.length === 0) {
    return { ok: false, error: "해당 연락처로 접수된 예약이 없어요." };
  }
  return { ok: true, bookings };
}

export async function claimBookingsForUser(input: {
  userId: string;
  phone: string;
}): Promise<{ ok: boolean; claimed: number; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb)
    return {
      ok: false,
      claimed: 0,
      error: "예약 연결을 위한 서버 설정이 필요합니다.",
    };

  const compact = normalizePhone(input.phone);
  if (compact.length < 8) {
    return {
      ok: false,
      claimed: 0,
      error: "회원 연락처를 먼저 정확히 입력해주세요.",
    };
  }
  const dashed =
    compact.length === 11
      ? `${compact.slice(0, 3)}-${compact.slice(3, 7)}-${compact.slice(7)}`
      : compact;

  const { data, error } = await sb
    .from("bookings")
    .select("id, student_phone, student_user_id")
    .or(`student_phone.eq.${compact},student_phone.eq.${dashed}`)
    .limit(100);
  if (error) return { ok: false, claimed: 0, error: error.message };

  const ids = (data ?? [])
    .filter(
      (booking: any) => normalizePhone(booking.student_phone ?? "") === compact,
    )
    .filter(
      (booking: any) =>
        !booking.student_user_id || booking.student_user_id === input.userId,
    )
    .map((booking: any) => booking.id);

  if (ids.length === 0) return { ok: true, claimed: 0 };

  const { error: updateError } = await sb
    .from("bookings")
    .update({ student_user_id: input.userId })
    .in("id", ids);
  if (updateError) {
    return { ok: false, claimed: 0, error: updateError.message };
  }

  return { ok: true, claimed: ids.length };
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
  student_user_id?: string | null;
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

  const compactPhone = normalizePhone(input.student_phone);
  const { data: completedBookings } = await sb
    .from("bookings")
    .select("id, student_phone, student_user_id")
    .eq("instructor_id", input.instructor_id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  const booking = (completedBookings ?? []).find((item: any) => {
    if (
      input.student_user_id &&
      item.student_user_id === input.student_user_id
    ) {
      return true;
    }
    return normalizePhone(item.student_phone ?? "") === compactPhone;
  });

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

  const reviewPayload = {
    booking_id: booking.id,
    instructor_id: input.instructor_id,
    student_user_id: input.student_user_id ?? booking.student_user_id ?? null,
    student_name_masked: input.student_name_masked,
    rating_total: input.rating_total,
    rating_kindness: input.rating_kindness,
    rating_explanation: input.rating_explanation,
    rating_effect: input.rating_effect,
    recommend_for: input.recommend_for,
    content: input.content,
    status: "pending",
  };
  let { error } = await sb.from("reviews").insert(reviewPayload);
  if (error && marketplaceTableError(error.message)) {
    const fallbackPayload: Record<string, unknown> = { ...reviewPayload };
    delete fallbackPayload.student_user_id;
    const fallback = await sb.from("reviews").insert(fallbackPayload);
    error = fallback.error;
  }
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface InstructorApplicationInput {
  display_name: string;
  phone: string;
  region: string;
  lesson_places?: string[];
  specialties?: string[];
  career_years?: number;
  bio?: string | null;
  about?: string | null;
  proof_urls?: string[];
}

function mapInstructorApplication(
  row: any,
  profile?: {
    name?: string | null;
    nickname?: string | null;
    phone?: string | null;
  },
): InstructorApplication {
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    display_name: row.display_name,
    phone: row.phone,
    region: row.region,
    lesson_places: row.lesson_places ?? [],
    specialties: row.specialties ?? [],
    career_years: row.career_years ?? 0,
    bio: row.bio ?? null,
    about: row.about ?? null,
    proof_urls: row.proof_urls ?? [],
    admin_memo: row.admin_memo ?? null,
    instructor_id: row.instructor_id ?? null,
    reviewed_at: row.reviewed_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
    profile_name: profile?.name ?? null,
    profile_nickname: profile?.nickname ?? null,
    profile_phone: profile?.phone ?? null,
  };
}

export async function getInstructorApplicationForUser(
  userId: string,
): Promise<InstructorApplication | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("instructor_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (!marketplaceTableError(error.message)) {
      console.error("Failed to load instructor application", error.message);
    }
    return null;
  }
  return data ? mapInstructorApplication(data) : null;
}

export async function submitInstructorApplication(
  userId: string,
  input: InstructorApplicationInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb)
    return {
      ok: false,
      error: "프로 신청 저장을 위한 서버 설정이 필요합니다.",
    };

  const displayName = input.display_name.trim();
  const phone = input.phone.trim();
  const region = input.region.trim();
  const specialties = cleanList(input.specialties);
  if (!displayName || !phone || !region) {
    return { ok: false, error: "프로명, 연락처, 활동 지역은 필수입니다." };
  }
  if (specialties.length === 0) {
    return { ok: false, error: "전문 분야를 하나 이상 선택해주세요." };
  }

  const existing = await getInstructorApplicationForUser(userId);
  if (existing?.status === "approved") {
    return { ok: false, error: "이미 승인된 프로 계정입니다." };
  }

  const payload = {
    user_id: userId,
    status: "submitted" as InstructorApplicationStatus,
    display_name: displayName,
    phone,
    region,
    lesson_places: cleanList(input.lesson_places),
    specialties,
    career_years: Math.max(0, Number(input.career_years ?? 0)),
    bio: input.bio?.trim() || null,
    about: input.about?.trim() || null,
    proof_urls: cleanList(input.proof_urls),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("instructor_applications")
    .upsert(payload, { onConflict: "user_id" })
    .select("id")
    .single();
  if (error) {
    const hint = marketplaceTableError(error.message)
      ? " Supabase SQL Editor에서 supabase/pro-platform.sql을 먼저 실행해주세요."
      : "";
    return { ok: false, error: `${error.message}${hint}` };
  }
  return { ok: true, id: data.id };
}

export async function adminListInstructorApplications(): Promise<
  InstructorApplication[]
> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("instructor_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    if (!marketplaceTableError(error.message)) {
      console.error("Failed to list instructor applications", error.message);
    }
    return [];
  }

  const userIds = [...new Set((data ?? []).map((row: any) => row.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await sb
          .from("profiles")
          .select("id,name,nickname,phone")
          .in("id", userIds)
      : { data: [] };
  const profileMap = new Map(
    (profiles ?? []).map((profile: any) => [profile.id, profile]),
  );

  return (data ?? []).map((row: any) =>
    mapInstructorApplication(row, profileMap.get(row.user_id)),
  );
}

export async function adminReviewInstructorApplication(
  id: string,
  input: { status: InstructorApplicationStatus; admin_memo?: string },
) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  if (!["approved", "rejected", "submitted"].includes(input.status)) {
    return { ok: false, error: "허용되지 않는 신청 상태입니다." };
  }

  const { data: application, error: loadError } = await sb
    .from("instructor_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !application) {
    return {
      ok: false,
      error: loadError?.message ?? "신청서를 찾을 수 없습니다.",
    };
  }

  let instructorId = application.instructor_id as string | null;
  if (input.status === "approved") {
    const saved = await adminSaveInstructor({
      id: instructorId ?? undefined,
      user_id: application.user_id,
      slug: makeInstructorSlug({
        display_name: application.display_name,
        phone: application.phone,
        id: application.id,
      }),
      display_name: application.display_name,
      profile_image: "",
      gallery: [],
      bio:
        application.bio ||
        `${application.region} ${cleanList(application.specialties).join(", ")} 레슨 프로`,
      about: application.about || application.bio || "",
      region: application.region,
      lesson_places: application.lesson_places ?? [],
      specialties: application.specialties ?? [],
      career_years: application.career_years ?? 0,
      career_history: cleanList(application.proof_urls ?? []),
      lesson_style: [],
      gender: "male",
      price_from: 0,
      response_time: "상담 후 안내",
      badges: ["profile_verified"],
      is_featured: false,
      is_active: false,
      verification_status: "verified",
    });
    if (!saved.ok) return saved;
    instructorId = saved.id ?? instructorId;

    const { error: profileError } = await sb
      .from("profiles")
      .update({ role: "instructor" })
      .eq("id", application.user_id);
    if (profileError) return { ok: false, error: profileError.message };
  }

  const { error } = await sb
    .from("instructor_applications")
    .update({
      status: input.status,
      admin_memo:
        typeof input.admin_memo === "string"
          ? input.admin_memo.trim() || null
          : application.admin_memo,
      instructor_id: instructorId,
      reviewed_at:
        input.status === "submitted" ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function getInstructorForUser(
  userId: string,
): Promise<Instructor | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("instructors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (!marketplaceTableError(error.message)) {
      console.error("Failed to load instructor for user", error.message);
    }
    return null;
  }
  return data ? mapInstructor(data) : null;
}

export async function getProDashboardForUser(userId: string): Promise<{
  instructor: Instructor | null;
  bookings: Booking[];
  leads: ProLead[];
  setupNeeded?: boolean;
}> {
  const sb = getSupabaseAdmin();
  if (!sb) return { instructor: null, bookings: [], leads: [] };
  const instructor = await getInstructorForUser(userId);
  if (!instructor) return { instructor: null, bookings: [], leads: [] };

  const [{ data: bookings }, { data: leads, error: leadsError }] =
    await Promise.all([
      sb
        .from("bookings")
        .select("*, lesson_packages(title)")
        .eq("instructor_id", instructor.id)
        .order("created_at", { ascending: false })
        .limit(50),
      sb
        .from("lesson_requests")
        .select("*, lesson_quotes(*)")
        .contains("matched_instructor_ids", [instructor.id])
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (leadsError && marketplaceTableError(leadsError.message)) {
    return {
      instructor,
      bookings: (bookings ?? []).map((booking: any) => ({
        ...booking,
        package_title: booking.lesson_packages?.title,
      })) as Booking[],
      leads: [],
      setupNeeded: true,
    };
  }

  return {
    instructor,
    bookings: (bookings ?? []).map((booking: any) => ({
      ...booking,
      package_title: booking.lesson_packages?.title,
    })) as Booking[],
    leads: (leads ?? []).map((lead: any) => {
      const quotes = Array.isArray(lead.lesson_quotes)
        ? lead.lesson_quotes
        : [];
      const quote =
        quotes.find((item: any) => item.instructor_id === instructor.id) ??
        null;
      const request = { ...lead };
      delete request.lesson_quotes;
      return {
        ...request,
        lesson_places: request.lesson_places ?? [],
        goals: request.goals ?? [],
        preferred_days: request.preferred_days ?? [],
        matched_instructor_ids: request.matched_instructor_ids ?? [],
        quote_count: quotes.length,
        quote,
      } as ProLead;
    }),
  };
}

export async function sendProQuote(
  userId: string,
  requestId: string,
  input: { title?: string; message: string; price?: number | null },
) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "DB 미설정" };
  const instructor = await getInstructorForUser(userId);
  if (!instructor)
    return { ok: false, error: "승인된 프로 계정을 찾을 수 없습니다." };

  const { data: request, error: requestError } = await sb
    .from("lesson_requests")
    .select("id, matched_instructor_ids")
    .eq("id", requestId)
    .maybeSingle();
  if (requestError || !request) {
    return {
      ok: false,
      error: requestError?.message ?? "리드를 찾을 수 없습니다.",
    };
  }
  if (!(request.matched_instructor_ids ?? []).includes(instructor.id)) {
    return { ok: false, error: "이 프로에게 배정된 리드가 아닙니다." };
  }

  const message = input.message.trim();
  if (!message) return { ok: false, error: "견적 메시지를 입력해주세요." };

  const payload = {
    lesson_request_id: requestId,
    instructor_id: instructor.id,
    title: input.title?.trim() || `${instructor.display_name} 견적`,
    message,
    price:
      input.price && Number.isFinite(Number(input.price))
        ? Math.max(0, Math.round(Number(input.price)))
        : null,
    status: "sent",
    sent_at: new Date().toISOString(),
  };

  const { data: existing } = await sb
    .from("lesson_quotes")
    .select("id")
    .eq("lesson_request_id", requestId)
    .eq("instructor_id", instructor.id)
    .maybeSingle();

  const query = existing?.id
    ? sb.from("lesson_quotes").update(payload).eq("id", existing.id)
    : sb.from("lesson_quotes").insert(payload);
  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  await sb
    .from("lesson_requests")
    .update({ status: "quoted" })
    .eq("id", requestId);
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
  user_id?: string | null;
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

  const payload: Record<string, unknown> = {
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
  if (input.user_id !== undefined) payload.user_id = input.user_id;

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
