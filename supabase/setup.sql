-- ================================================================
-- 100 to the Future — 원클릭 셋업 (schema + seed)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql + seed.sql 을 합친 파일입니다)
-- ================================================================

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
-- 레슨 견적 요청/제안 (숨고형 브로커 플로우)
-- 고객은 프로를 고르지 않고 조건만 남기고, 운영자/프로가 후보와 견적을 제안한다.
-- ---------------------------------------------------------------------
create table if not exists lesson_requests (
  id                           uuid primary key default gen_random_uuid(),
  customer_name                text not null,
  customer_phone               text not null,
  region                       text not null,
  lesson_places                text[] not null default '{}',
  goals                        text[] not null default '{}',
  skill_level                  text,
  score_range                  text,
  preferred_days               text[] not null default '{}',
  preferred_time_slot          text,
  budget_min                   int,
  budget_max                   int,
  instructor_gender_preference text check (instructor_gender_preference in ('male','female') or instructor_gender_preference is null),
  package_preference           text,
  memo                         text,
  status                       text not null default 'open' check (status in ('open','contacted','quoted','closed','canceled')),
  admin_memo                   text,
  matched_instructor_ids       uuid[] not null default '{}',
  privacy_agreed               boolean not null default false,
  marketing_agreed             boolean not null default false,
  created_at                   timestamptz not null default now()
);

create table if not exists lesson_quotes (
  id                  uuid primary key default gen_random_uuid(),
  lesson_request_id   uuid not null references lesson_requests(id) on delete cascade,
  instructor_id        uuid references instructors(id) on delete set null,
  title               text not null default '',
  message             text,
  price               int,
  duration_minutes    int,
  session_count       int,
  status              text not null default 'draft' check (status in ('draft','sent','accepted','declined','expired')),
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
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
create index if not exists idx_lesson_requests_status_created
  on lesson_requests (status, created_at desc);
create index if not exists idx_lesson_requests_region
  on lesson_requests (region);
create index if not exists idx_lesson_quotes_request
  on lesson_quotes (lesson_request_id, status);
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
alter table lesson_requests           enable row level security;
alter table lesson_quotes             enable row level security;
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


-- =====================================================================
-- 100 to the Future — 예시 시드 데이터
-- schema.sql 실행 후 이 파일을 SQL Editor 에서 실행하세요.
-- 실서비스 오픈 전 실제 프로 데이터로 교체하세요.
-- =====================================================================

-- 레슨프로 4명
insert into instructors
  (slug, display_name, profile_image, gallery, bio, about, region, lesson_places,
   specialties, career_years, career_history, lesson_style, gender, price_from,
   response_time, badges, is_featured, is_active, verification_status, curriculum)
values
(
  'kim-pro', '김도현 프로',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=70'],
  '100타 탈출 전문 · 영상분석 기반 교정',
  '10년간 3,000명 이상을 지도한 100타 탈출 전문 프로입니다. 매 회차 스윙 영상을 촬영·비교해 무엇이 바뀌었는지 눈으로 확인시켜 드립니다.',
  '강남', array['실내연습장','스크린골프','필드레슨'],
  array['100타 탈출','드라이버','아이언'], 10,
  array['KPGA 프로 2014년 입회','前 OO컨트리클럽 소속 프로','누적 지도 수강생 3,000명+'],
  array['영상분석형','빡세게 교정형'], 'male', 60000,
  '평균 1시간 이내',
  array['profile_verified','cert_verified','career_verified','breakout_expert','many_reviews','fast_response'],
  true, true, 'verified',
  '[{"session":1,"title":"스윙 진단, 그립/어드레스 교정"},{"session":2,"title":"아이언 컨택 안정화"},{"session":3,"title":"드라이버 OB 줄이기"},{"session":4,"title":"어프로치 거리감"},{"session":5,"title":"퍼팅 루틴 만들기"},{"session":6,"title":"필드 상황별 공략"},{"session":7,"title":"스코어 관리 전략"},{"session":8,"title":"라운드 전 최종 점검"}]'::jsonb
),
(
  'park-pro', '박서연 프로',
  'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=70'],
  '여성·입문자 전문 · 친절 설명형',
  '골프가 처음이라 막막한 분, 오래 쉬었다 다시 시작하는 분을 편안하게 이끌어 드립니다.',
  '판교', array['실내연습장','스크린골프'],
  array['입문','여성/주니어','숏게임'], 7,
  array['KLPGA 프로','여성 입문 클래스 다수 운영','주니어 골프 지도 경력'],
  array['친절 설명형','기초 탄탄형'], 'female', 55000,
  '평균 2시간 이내',
  array['profile_verified','cert_verified','beginner_friendly','women_popular'],
  true, true, 'verified',
  '[{"session":1,"title":"그립·어드레스·기본자세"},{"session":2,"title":"하프스윙 컨택 연습"},{"session":3,"title":"풀스윙 리듬 만들기"},{"session":4,"title":"아이언 방향성"}]'::jsonb
),
(
  'lee-pro', '이준혁 프로',
  'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=70'],
  '필드레슨 · 라운드 운영 전문',
  '연습장에서는 잘 맞는데 필드만 나가면 무너지는 분들을 위한 실전형 프로입니다.',
  '수원', array['야외연습장','필드레슨'],
  array['필드레슨','100타 탈출','드라이버'], 12,
  array['KPGA 프로','투어 프로암 다수 출전','필드 레슨 전문 12년'],
  array['필드 중심형','실전형'], 'male', 70000,
  '평균 3시간 이내',
  array['profile_verified','cert_verified','career_verified','breakout_expert'],
  false, true, 'verified',
  '[]'::jsonb
),
(
  'jung-pro', '정민아 프로',
  'https://images.unsplash.com/photo-1500932334442-8761ee4810a7?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=70'],
  '숏게임·퍼팅 스페셜리스트',
  '스코어의 절반은 100야드 안에서 결정됩니다. 어프로치 거리감과 3퍼트 탈출에 집중합니다.',
  '분당', array['실내연습장','스크린골프'],
  array['숏게임','퍼팅','100타 탈출'], 8,
  array['KLPGA 프로','숏게임 클리닉 운영'],
  array['데이터 기반형','친절 설명형'], 'female', 58000,
  '평균 1시간 이내',
  array['profile_verified','cert_verified','fast_response','women_popular'],
  false, true, 'verified',
  '[]'::jsonb
)
on conflict (slug) do nothing;

-- 자격증
insert into instructor_certifications (instructor_id, title, issuer, issued_year, verification_status)
select id, 'KPGA 정회원', '한국프로골프협회', 2014, 'verified'::verification_status from instructors where slug='kim-pro'
union all select id, '생활스포츠지도사 2급(골프)', '국민체육진흥공단', 2015, 'verified'::verification_status from instructors where slug='kim-pro'
union all select id, 'KLPGA 정회원', '한국여자프로골프협회', 2018, 'verified'::verification_status from instructors where slug='park-pro'
union all select id, 'KPGA 정회원', '한국프로골프협회', 2012, 'verified'::verification_status from instructors where slug='lee-pro'
union all select id, 'KLPGA 정회원', '한국여자프로골프협회', 2017, 'verified'::verification_status from instructors where slug='jung-pro';

-- 레슨 상품
insert into lesson_packages (instructor_id, title, description, duration_minutes, session_count, price, sort_order)
select id, '원포인트 1회 레슨', '가장 급한 문제 하나를 집중 교정', 50, 1, 60000, 1 from instructors where slug='kim-pro'
union all select id, '100타 탈출 4회권', '핵심 문제 2~3개 집중', 50, 4, 220000, 2 from instructors where slug='kim-pro'
union all select id, '100타 탈출 8주 패키지', '진단부터 필드 적용까지 완주', 50, 8, 400000, 3 from instructors where slug='kim-pro'
union all select id, '왕초보 첫걸음 1회', '그립·자세·스윙 기초', 50, 1, 55000, 1 from instructors where slug='park-pro'
union all select id, '입문 완성 8회권', '필드 나갈 수 있는 몸 만들기', 50, 8, 380000, 2 from instructors where slug='park-pro'
union all select id, '야외 원포인트 1회', '스윙 실전 점검', 60, 1, 70000, 1 from instructors where slug='lee-pro'
union all select id, '필드 동반 레슨(9홀)', '라운드하며 실전 코칭', 180, 1, 250000, 2 from instructors where slug='lee-pro'
union all select id, '숏게임 집중 4회권', '어프로치+퍼팅', 50, 4, 210000, 1 from instructors where slug='jung-pro';

-- 가능 시간 (화/목 저녁, 토 오전 공통)
insert into availability_rules (instructor_id, day_of_week, start_time, end_time, slot_minutes)
select id, 2, '19:00'::time, '22:00'::time, 50 from instructors
union all select id, 4, '19:00'::time, '22:00'::time, 50 from instructors
union all select id, 6, '09:00'::time, '13:00'::time, 50 from instructors;

-- 노출 리뷰 (예약 완료 가정)
insert into reviews (instructor_id, student_name_masked, rating_total, rating_kindness, rating_explanation, rating_effect, recommend_for, content, instructor_reply, status)
select id, '김**', 5,5,5,5, '100타 탈출', '평균 108타에서 3개월 만에 96타 쳤어요. 드라이버 슬라이스 원인을 딱 짚어주시고 매 회차 영상으로 비교해주셨습니다.', '회원님 연습량이 정말 좋으셨어요! 다음 목표 90타도 금방입니다 :)', 'visible'::review_status from instructors where slug='kim-pro'
union all select id, '이**', 5,5,4,5, '직장인', '설명이 군더더기 없고 과제를 명확히 주셔서 혼자 연습할 때도 헤매지 않았어요.', null, 'visible'::review_status from instructors where slug='kim-pro'
union all select id, '최**', 5,5,5,4, '여성/입문자', '골프 완전 처음이었는데 그립부터 차근차근 알려주셔서 무섭지 않았어요.', null, 'visible'::review_status from instructors where slug='park-pro'
union all select id, '정**', 4,4,5,4, '필드 준비', '필드레슨이 정말 도움됐습니다. 연습장과 필드는 다르다는 걸 배웠어요.', null, 'visible'::review_status from instructors where slug='lee-pro';
