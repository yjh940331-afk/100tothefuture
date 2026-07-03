-- =====================================================================
-- 회원관리 (Phase 1) — profiles / student_profiles / favorites + 기존 확장
-- Supabase SQL Editor 에서 실행. (schema.sql 이후)
-- =====================================================================

-- 공통 프로필 (auth.users 1:1)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','instructor','admin')),
  name text,
  nickname text,
  phone text,
  email text,
  avatar_url text,
  region text,
  marketing_agreed boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- 수강생 추가 정보
create table if not exists student_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_avg_score int,
  target_score int,
  career_months int,
  weekly_practice int,
  goal text
);

-- 찜(좋아요)
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  instructor_id uuid not null references instructors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_user_id, instructor_id)
);
create index if not exists idx_favorites_instructor on favorites (instructor_id);
create index if not exists idx_favorites_student on favorites (student_user_id);

-- 기존 테이블에 로그인 계정 연결 (게스트도 유지 → nullable)
alter table bookings    add column if not exists student_user_id uuid references auth.users(id) on delete set null;
alter table reviews     add column if not exists student_user_id uuid references auth.users(id) on delete set null;
alter table instructors add column if not exists user_id         uuid references auth.users(id) on delete set null;

-- 가입 시 profiles 자동 생성 (카카오 메타데이터에서 이름/사진 추출)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, nickname, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_name'),
    coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'name'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table profiles         enable row level security;
alter table student_profiles enable row level security;
alter table favorites        enable row level security;

-- profiles: 본인 읽기/수정, 공개는 최소 컬럼만(리뷰/프로 표시용) — 여기선 본인 전체 + 공개 select 허용
create policy "profiles self select"  on profiles for select using (auth.uid() = id);
create policy "profiles self update"  on profiles for update using (auth.uid() = id);
create policy "profiles self insert"  on profiles for insert with check (auth.uid() = id);

-- student_profiles: 본인만
create policy "student self all" on student_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites: 본인 것만 관리, 좋아요 수 집계를 위해 공개 select 허용
create policy "favorites public count" on favorites for select using (true);
create policy "favorites self insert"  on favorites for insert with check (auth.uid() = student_user_id);
create policy "favorites self delete"  on favorites for delete using (auth.uid() = student_user_id);

-- bookings: 로그인 수강생은 본인 예약 조회 (게스트/관리자는 기존 흐름 유지)
create policy "bookings student select" on bookings
  for select using (auth.uid() is not null and auth.uid() = student_user_id);

-- reviews: 로그인 유저가 본인 리뷰 작성/수정 (기존 공개 insert 정책과 공존)
create policy "reviews owner update" on reviews
  for update using (auth.uid() = student_user_id);

-- ---------------------------------------------------------------------
-- 집계 뷰: 프로별 좋아요/누적 레슨수
-- ---------------------------------------------------------------------
create or replace view instructor_engagement as
select
  i.id as instructor_id,
  (select count(*) from favorites f where f.instructor_id = i.id) as like_count,
  (select count(*) from bookings b where b.instructor_id = i.id and b.status = 'completed') as lesson_count
from instructors i;
