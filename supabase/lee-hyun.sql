-- ================================================================
-- 100 to the Future — 첫 입점 프로: 이현 프로
-- Supabase SQL Editor에서 실행하면 instructors / lesson_packages에 upsert 됩니다.
-- ================================================================

insert into instructors
  (slug, display_name, profile_image, gallery, bio, about, region, lesson_places,
   specialties, career_years, career_history, lesson_style, gender, price_from,
   response_time, badges, is_featured, is_active, verification_status, curriculum)
values
(
  'lee-hyun',
  '이현 프로',
  '/pros/lee-hyun-avatar.jpg',
  array[
    '/pros/lee-hyun-hero.jpg',
    '/pros/lee-hyun-field.jpg',
    '/pros/lee-hyun-bunker.jpg'
  ],
  '프로골퍼 · JTBC 레슨 스튜디오 출연 · 프라이빗 1:1 레슨',
  '안녕하세요, 이현 프로입니다. JTBC 레슨 스튜디오와 JTBC GOLF 레슨 콘텐츠에서 비거리, 캐스팅, 체중이동, 상체 움직임 등 아마추어 골퍼가 자주 겪는 스윙 고민을 다뤘습니다. 자연스러운 스윙을 만들 수 있도록 현재 움직임을 먼저 확인하고, 필요한 동작만 단계적으로 교정하는 1:1 프라이빗 레슨을 준비하고 있습니다.',
  '지역 상담',
  array['실내연습장','야외연습장','필드레슨'],
  array['비거리','드라이버','아이언','100타 탈출'],
  0,
  array[
    '프로골퍼 이현',
    'JTBC 레슨 스튜디오 출연',
    'JTBC GOLF 골짤강 레슨 콘텐츠 출연',
    '프라이빗 1:1 개인레슨 운영',
    'Instagram @leehyun_golf'
  ],
  array['자연스러운 스윙','비거리 훈련','캐스팅/체중이동 교정','상체 움직임 교정'],
  'male',
  0,
  '상담 후 안내',
  array['founding_pro','media_featured','profile_verified','breakout_expert'],
  true,
  true,
  'verified'::verification_status,
  '[
    {"session":1,"title":"현재 스윙 진단과 핵심 문제 확인"},
    {"session":2,"title":"캐스팅과 체중이동 패턴 교정"},
    {"session":3,"title":"비거리 향상을 위한 회전·순서 훈련"},
    {"session":4,"title":"상체 움직임 안정화와 방향성 점검"}
  ]'::jsonb
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  profile_image = excluded.profile_image,
  gallery = excluded.gallery,
  bio = excluded.bio,
  about = excluded.about,
  region = excluded.region,
  lesson_places = excluded.lesson_places,
  specialties = excluded.specialties,
  career_years = excluded.career_years,
  career_history = excluded.career_history,
  lesson_style = excluded.lesson_style,
  gender = excluded.gender,
  price_from = excluded.price_from,
  response_time = excluded.response_time,
  badges = excluded.badges,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active,
  verification_status = excluded.verification_status,
  curriculum = excluded.curriculum;

delete from lesson_packages
where instructor_id = (select id from instructors where slug = 'lee-hyun')
  and title in ('프라이빗 1:1 개인레슨');

insert into lesson_packages
  (instructor_id, title, description, duration_minutes, session_count, price, sort_order)
select
  id,
  '프라이빗 1:1 개인레슨',
  '지역, 시간, 레슨 장소 확인 후 안내',
  50,
  1,
  0,
  1
from instructors
where slug = 'lee-hyun';
