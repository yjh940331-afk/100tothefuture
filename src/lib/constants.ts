// 사이트 전역에서 쓰는 카테고리/옵션 상수 (필터, 폼, 뱃지에서 공유)

export const REGIONS = [
  "강남",
  "서초",
  "송파",
  "판교",
  "분당",
  "수원",
  "용인",
  "일산",
  "인천",
] as const;
export type Region = (typeof REGIONS)[number];

export const LESSON_PLACES = [
  "실내연습장",
  "스크린골프",
  "야외연습장",
  "필드레슨",
] as const;
export type LessonPlace = (typeof LESSON_PLACES)[number];

export const SPECIALTIES = [
  "입문",
  "100타 탈출",
  "비거리",
  "드라이버",
  "아이언",
  "숏게임",
  "퍼팅",
  "필드레슨",
  "여성/주니어",
] as const;
export type Specialty = (typeof SPECIALTIES)[number];

// 시간대 필터 (요일별 가능 시간을 대략적인 슬롯으로 그룹핑)
export const TIME_SLOTS = [
  { key: "weekday_morning", label: "평일 오전" },
  { key: "weekday_evening", label: "평일 저녁" },
  { key: "weekend", label: "주말" },
] as const;
export type TimeSlotKey = (typeof TIME_SLOTS)[number]["key"];

// 검증 뱃지: 관리자가 증빙 확인 후 부여
export const BADGES: Record<
  string,
  { label: string; tone: "green" | "gold" | "blue" | "pink" }
> = {
  profile_verified: { label: "프로필 검수 완료", tone: "green" },
  founding_pro: { label: "첫 입점 프로", tone: "gold" },
  media_featured: { label: "JTBC 레슨 출연", tone: "blue" },
  cert_verified: { label: "자격증 확인", tone: "green" },
  career_verified: { label: "경력 확인", tone: "green" },
  breakout_expert: { label: "100타 탈출 전문", tone: "gold" },
  beginner_friendly: { label: "입문자 추천", tone: "blue" },
  women_popular: { label: "여성 수강생 인기", tone: "pink" },
  many_reviews: { label: "후기 많은 프로", tone: "gold" },
  fast_response: { label: "응답 빠른 프로", tone: "blue" },
};
export type BadgeKey = keyof typeof BADGES;

export const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  requested: "요청됨",
  confirmed: "확정",
  completed: "완료",
  canceled: "취소",
  rejected: "거절",
  no_show: "노쇼",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "승인 대기",
  visible: "노출 중",
  hidden: "숨김",
  reported: "신고됨",
};
