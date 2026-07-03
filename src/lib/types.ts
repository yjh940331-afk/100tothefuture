// DB 테이블과 대응되는 애플리케이션 타입.
// Supabase 스키마(supabase/schema.sql)와 시드 데이터(seed-data.ts)가 공유한다.

export type BookingStatus =
  "requested" | "confirmed" | "completed" | "canceled" | "rejected" | "no_show";

export type ReviewStatus = "pending" | "visible" | "hidden" | "reported";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type LessonRequestStatus =
  "open" | "contacted" | "quoted" | "closed" | "canceled";
export type InstructorApplicationStatus = "submitted" | "approved" | "rejected";

export interface LessonRequest {
  id: string;
  student_user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  region: string;
  lesson_places: string[];
  goals: string[];
  skill_level?: string | null;
  score_range?: string | null;
  preferred_days: string[];
  preferred_time_slot?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  instructor_gender_preference?: string | null;
  package_preference?: string | null;
  memo?: string | null;
  status: LessonRequestStatus;
  admin_memo?: string | null;
  matched_instructor_ids: string[];
  quote_count?: number;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
  created_at: string;
}

export interface LessonQuote {
  id: string;
  lesson_request_id: string;
  instructor_id?: string | null;
  instructor_name?: string | null;
  title: string;
  message?: string | null;
  price?: number | null;
  duration_minutes?: number | null;
  session_count?: number | null;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  created_at: string;
}

export interface Certification {
  id: string;
  title: string; // 예: "KPGA 정회원"
  issuer: string; // 발급기관
  issued_year: number | null;
  proof_file_url?: string | null;
  verification_status: VerificationStatus;
}

export interface LessonPackage {
  id: string;
  title: string; // 예: "100타 탈출 8주 패키지"
  description?: string | null;
  duration_minutes: number; // 회당 레슨 시간
  session_count: number; // 총 회차
  price: number; // 원
  is_active: boolean;
}

export interface AvailabilityRule {
  id: string;
  day_of_week: number; // 0=일 ~ 6=토
  start_time: string; // "19:00"
  end_time: string; // "22:00"
  slot_minutes: number; // 예약 단위 (30/50/60)
  is_active: boolean;
}

export interface CurriculumItem {
  session: number; // 회차
  title: string;
}

export interface ReviewSummary {
  id: string;
  instructor_id: string;
  student_user_id?: string | null;
  student_name_masked: string; // "김**"
  rating_total: number; // 1~5
  rating_kindness?: number | null;
  rating_explanation?: number | null;
  rating_effect?: number | null;
  content: string;
  recommend_for?: string | null; // 추천 대상
  instructor_reply?: string | null;
  status: ReviewStatus;
  created_at: string; // ISO
}

export interface Instructor {
  id: string;
  user_id?: string | null;
  slug: string; // SEO URL용: "kim-pro"
  display_name: string;
  profile_image: string;
  gallery: string[]; // 스윙/레슨 사진
  intro_video_url?: string | null;
  bio: string; // 한 줄 소개
  about: string; // 상세 소개
  region: string;
  lesson_places: string[];
  specialties: string[];
  career_years: number;
  career_history: string[]; // 투어/대회/지도 이력
  lesson_style: string[]; // 빡세게 교정형, 친절 설명형 ...
  gender: "male" | "female";
  price_from: number; // 최저가 (목록 표시용)
  response_time?: string | null; // "평균 1시간 이내"
  badges: string[]; // BadgeKey[]
  is_featured: boolean;
  is_active: boolean;
  verification_status: VerificationStatus;

  // 상세 페이지에서 조인해 채우는 값
  certifications: Certification[];
  packages: LessonPackage[];
  availability: AvailabilityRule[];
  curriculum: CurriculumItem[];

  // 목록/카드용 집계값
  rating_avg: number;
  review_count: number;
}

export interface InstructorApplication {
  id: string;
  user_id: string;
  status: InstructorApplicationStatus;
  display_name: string;
  phone: string;
  region: string;
  lesson_places: string[];
  specialties: string[];
  career_years: number;
  bio?: string | null;
  about?: string | null;
  proof_urls: string[];
  admin_memo?: string | null;
  instructor_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  profile_name?: string | null;
  profile_nickname?: string | null;
  profile_phone?: string | null;
}

export interface ProLead extends LessonRequest {
  quote?: LessonQuote | null;
}

export interface Booking {
  id: string;
  instructor_id: string;
  instructor_name?: string;
  package_title?: string;
  lesson_package_id?: string | null;
  student_name: string;
  student_phone: string;
  preferred_date?: string | null; // "2026-07-10"
  preferred_time?: string | null; // "19:00"
  region?: string | null;
  goal?: string | null; // 현재 평균타수/약점 등 희망 내용
  student_memo?: string | null;
  admin_memo?: string | null;
  price?: number | null;
  payment_status?: string | null;
  status: BookingStatus;
  privacy_agreed: boolean;
  third_party_agreed: boolean; // 연락처를 프로에게 전달 동의
  created_at: string;
}
