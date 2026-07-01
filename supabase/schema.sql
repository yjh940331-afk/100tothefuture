-- =====================================================================
-- 100 to the Future — 데이터베이스 스키마 (Supabase / PostgreSQL)
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- 실행 순서: 1) schema.sql  2) seed.sql
-- =====================================================================

-- 확장
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM 타입
-- ---------------------------------------------------------------------
do $$ begin
  create type verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested','confirmed','completed','canceled','rejected','no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending','visible','hidden','reported');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 레슨프로
-- ---------------------------------------------------------------------
create table if not exists instructors (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,               -- SEO URL: kim-pro
  display_name        text not null,
  profile_image       text not null default '',
  gallery             text[] not null default '{}',       -- 스윙/레슨 사진
  intro_video_url     text,
  bio                 text not null default '',            -- 한 줄 소개
  about               text not null default '',            -- 상세 소개
  region              text not null,
  lesson_places       text[] not null default '{}',
  specialties         text[] not null default '{}',
  career_years        int not null default 0,
  career_history      text[] not null default '{}',
  lesson_style        text[] not null default '{}',
  gender              text not null default 'male' check (gender in ('male','female')),
  price_from          int not null default 0,
  response_time       text,
  badges              text[] not null default '{}',        -- 관리자가 검증 후 부여
  is_featured         boolean not null default false,
  is_active           boolean not null default true,
  verification_status verification_status not null default 'pending',
  curriculum          jsonb not null default '[]',         -- [{session, title}]
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 자격/라이선스 (증빙 이미지는 관리자가 검수)
-- ---------------------------------------------------------------------
create table if not exists instructor_certifications (
  id                  uuid primary key default gen_random_uuid(),
  instructor_id       uuid not null references instructors(id) on delete cascade,
  title               text not null,
  issuer              text not null default '',
  issued_year         int,
  proof_file_url      text,
  verification_status verification_status not null default 'pending'
);

-- ---------------------------------------------------------------------
-- 레슨 상품 (1회/4회권/8회권/월)
-- ---------------------------------------------------------------------
create table if not exists lesson_packages (
  id               uuid primary key default gen_random_uuid(),
  instructor_id    uuid not null references instructors(id) on delete cascade,
  title            text not null,
  description      text,
  duration_minutes int not null default 50,
  session_count    int not null default 1,
  price            int not null default 0,
  is_active        boolean not null default true,
  -- 결제는 P2. 미리 열어두는 필드:
  commission_rate  numeric(4,3) default 0.000,
  sort_order       int not null default 0
);

-- ---------------------------------------------------------------------
-- 가능 시간: 요일 규칙 + 날짜 예외
-- 예약 가능 시간 = availability_rules + availability_exceptions + bookings 조합으로 계산
-- ---------------------------------------------------------------------
create table if not exists availability_rules (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6), -- 0=일
  start_time    time not null,
  end_time      time not null,
  slot_minutes  int not null default 50,
  is_active     boolean not null default true
);

create table if not exists availability_exceptions (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  date          date not null,
  start_time    time,
  end_time      time,
  type          text not null check (type in ('open','block')),
  reason        text
);

-- ---------------------------------------------------------------------
-- 예약/상담 요청 (MVP: 회원가입 없이 요청 가능)
-- ---------------------------------------------------------------------
create table if not exists bookings (
  id                 uuid primary key default gen_random_uuid(),
  instructor_id      uuid not null references instructors(id) on delete cascade,
  lesson_package_id  uuid references lesson_packages(id) on delete set null,
  student_name       text not null,
  student_phone      text not null,
  preferred_date     date,
  preferred_time     time,
  region             text,
  goal               text,                                 -- 현재 타수/약점/희망 내용
  student_memo       text,
  admin_memo         text,
  status             booking_status not null default 'requested',
  privacy_agreed     boolean not null default false,
  third_party_agreed boolean not null default false,
  -- 결제(P2) 대비 필드
  price              int,
  payment_status     text default 'none',
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 리뷰 (예약 완료 건에 대해서만 작성 → 관리자 승인 후 노출)
-- ---------------------------------------------------------------------
create table if not exists reviews (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid references bookings(id) on delete set null,
  instructor_id        uuid not null references instructors(id) on delete cascade,
  student_name_masked  text not null default '익명',       -- "김**"
  rating_total         int not null check (rating_total between 1 and 5),
  rating_kindness      int check (rating_kindness between 1 and 5),
  rating_explanation   int check (rating_explanation between 1 and 5),
  rating_effect        int check (rating_effect between 1 and 5),
  recommend_for        text,
  content              text not null default '',
  photo_urls           text[] not null default '{}',
  instructor_reply     text,
  status               review_status not null default 'pending',
  benefit_provided     boolean not null default false,     -- 혜택 제공 리뷰 표시(표시광고 지침 대비)
  created_at           timestamptz not null default now()
);

create table if not exists review_reports (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references reviews(id) on delete cascade,
  reason      text not null,
  status      text not null default 'open',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 개인정보 동의 로그 (약관/제3자 제공/마케팅)
-- ---------------------------------------------------------------------
create table if not exists consent_logs (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id) on delete cascade,
  consent_type text not null,        -- privacy | third_party | marketing
  agreed       boolean not null,
  ip_address   text,
  agreed_at    timestamptz not null default now()
);

create table if not exists notification_logs (
  id                  uuid primary key default gen_random_uuid(),
  event_type          text not null,
  channel             text not null check (channel in ('webhook','sms','push')),
  recipient_type      text not null check (recipient_type in ('admin','customer','pro')),
  recipient_user_id   uuid,
  recipient_phone     text,
  title               text not null default '',
  content             text not null default '',
  status              text not null check (status in ('skipped','sent','failed')),
  provider            text,
  provider_message_id text,
  error_message       text,
  payload             jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

create table if not exists app_push_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  phone        text,
  platform     text not null check (platform in ('ios','android','web')),
  token        text not null unique,
  is_active    boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_instructors_active   on instructors (is_active);
create index if not exists idx_instructors_region   on instructors (region);
create index if not exists idx_packages_instructor  on lesson_packages (instructor_id);
create index if not exists idx_rules_instructor      on availability_rules (instructor_id);
create index if not exists idx_bookings_instructor   on bookings (instructor_id);
create index if not exists idx_reviews_instructor    on reviews (instructor_id, status);
create index if not exists idx_notification_logs_booking
  on notification_logs ((payload->>'id'), event_type, created_at desc);
create index if not exists idx_app_push_tokens_phone
  on app_push_tokens (phone, is_active);
create unique index if not exists idx_bookings_unique_open_slot
  on bookings (instructor_id, preferred_date, preferred_time)
  where preferred_date is not null
    and preferred_time is not null
    and status in ('requested'::booking_status, 'confirmed'::booking_status);
create unique index if not exists idx_reviews_booking_once
  on reviews (booking_id)
  where booking_id is not null;

-- ---------------------------------------------------------------------
-- 프로별 평점 집계 뷰 (노출된 리뷰만)
-- ---------------------------------------------------------------------
create or replace view instructor_rating_stats as
select
  i.id as instructor_id,
  coalesce(round(avg(r.rating_total)::numeric, 1), 0) as rating_avg,
  count(r.id) as review_count
from instructors i
left join reviews r on r.instructor_id = i.id and r.status = 'visible'
group by i.id;

-- =====================================================================
-- Row Level Security
-- 공개 읽기: 활성 프로/상품/시간/노출된 리뷰
-- 공개 쓰기: 예약 요청, 신고, 동의 로그
-- 리뷰 작성은 서버 API가 완료 예약을 검증한 뒤 service_role 로만 수행
-- 관리 작업(승인/수정/삭제)은 service_role 키로만 (RLS 우회)
-- =====================================================================
alter table instructors               enable row level security;
alter table instructor_certifications enable row level security;
alter table lesson_packages           enable row level security;
alter table availability_rules        enable row level security;
alter table availability_exceptions   enable row level security;
alter table bookings                  enable row level security;
alter table reviews                   enable row level security;
alter table review_reports            enable row level security;
alter table consent_logs              enable row level security;
alter table notification_logs         enable row level security;
alter table app_push_tokens           enable row level security;

-- 공개 읽기
create policy "public read active instructors" on instructors
  for select using (is_active = true);
create policy "public read certifications" on instructor_certifications
  for select using (true);
create policy "public read packages" on lesson_packages
  for select using (is_active = true);
create policy "public read rules" on availability_rules
  for select using (is_active = true);
create policy "public read exceptions" on availability_exceptions
  for select using (true);
create policy "public read visible reviews" on reviews
  for select using (status = 'visible');

-- 공개 쓰기 (요청/작성만, 상태는 기본값 유지)
create policy "public insert bookings" on bookings
  for insert with check (status = 'requested');
drop policy if exists "public insert reviews" on reviews;
create policy "public insert reports" on review_reports
  for insert with check (true);
create policy "public insert consent" on consent_logs
  for insert with check (true);

-- (관리자용 update/delete 정책은 두지 않음 → service_role 키만 접근 가능)
