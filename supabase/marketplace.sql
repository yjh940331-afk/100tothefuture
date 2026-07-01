-- ================================================================
-- 100 to the Future — 골프 레슨 브로커/견적 요청 기능
-- 기존 Supabase 프로젝트에는 이 파일만 SQL Editor에서 실행하세요.
-- ================================================================

create extension if not exists "pgcrypto";

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

create index if not exists idx_lesson_requests_status_created
  on lesson_requests (status, created_at desc);
create index if not exists idx_lesson_requests_region
  on lesson_requests (region);
create index if not exists idx_lesson_quotes_request
  on lesson_quotes (lesson_request_id, status);

alter table lesson_requests enable row level security;
alter table lesson_quotes enable row level security;

-- 고객 요청 생성/운영 관리는 Next.js API의 service_role 키로만 수행합니다.
-- service_role은 RLS를 우회하므로 공개 insert/update 정책을 만들지 않습니다.
