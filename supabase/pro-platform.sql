-- =====================================================================
-- 프로 신청/승인, 회원 예약 연결, 프로 CRM, 카카오 채널 알림 기반
-- Supabase SQL Editor에서 schema.sql + members.sql + marketplace.sql 이후 실행하세요.
-- =====================================================================

create extension if not exists "pgcrypto";

alter table profiles
  add column if not exists kakao_channel_agreed boolean not null default false,
  add column if not exists kakao_channel_user_key text;

alter table instructors
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists idx_instructors_user_id
  on instructors (user_id)
  where user_id is not null;

alter table bookings
  add column if not exists student_user_id uuid references auth.users(id) on delete set null;

alter table reviews
  add column if not exists student_user_id uuid references auth.users(id) on delete set null;

alter table lesson_requests
  add column if not exists student_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_bookings_student_user
  on bookings (student_user_id, created_at desc);
create index if not exists idx_reviews_student_user
  on reviews (student_user_id, created_at desc);
create index if not exists idx_lesson_requests_student_user
  on lesson_requests (student_user_id, created_at desc);
create index if not exists idx_lesson_requests_matched_instructors
  on lesson_requests using gin (matched_instructor_ids);

create table if not exists instructor_applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         text not null default 'submitted'
                 check (status in ('submitted','approved','rejected')),
  display_name   text not null,
  phone          text not null,
  region         text not null,
  lesson_places  text[] not null default '{}',
  specialties    text[] not null default '{}',
  career_years   int not null default 0,
  bio            text,
  about          text,
  proof_urls     text[] not null default '{}',
  admin_memo     text,
  instructor_id  uuid references instructors(id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_instructor_applications_status
  on instructor_applications (status, created_at desc);

alter table instructor_applications enable row level security;

drop policy if exists "instructor applications self select" on instructor_applications;
drop policy if exists "instructor applications self insert" on instructor_applications;
drop policy if exists "instructor applications self update" on instructor_applications;

create policy "instructor applications self select"
  on instructor_applications for select
  using (auth.uid() = user_id);

create policy "instructor applications self insert"
  on instructor_applications for insert
  with check (auth.uid() = user_id);

create policy "instructor applications self update"
  on instructor_applications for update
  using (auth.uid() = user_id and status = 'submitted')
  with check (auth.uid() = user_id and status = 'submitted');

-- 프로가 본인에게 매칭된 리드와 견적을 읽을 수 있게 열어둡니다.
-- 실제 쓰기는 Next.js API(service_role)가 권한 검증 후 처리합니다.
drop policy if exists "lesson requests matched instructor read" on lesson_requests;
create policy "lesson requests matched instructor read"
  on lesson_requests for select
  using (
    exists (
      select 1
      from instructors i
      where i.user_id = auth.uid()
        and i.id = any(lesson_requests.matched_instructor_ids)
    )
  );

drop policy if exists "lesson quotes instructor read" on lesson_quotes;
create policy "lesson quotes instructor read"
  on lesson_quotes for select
  using (
    exists (
      select 1
      from instructors i
      where i.user_id = auth.uid()
        and i.id = lesson_quotes.instructor_id
    )
  );
