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
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1611374243147-44a702c2d44c?auto=format&fit=crop&w=1200&q=70'],
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
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=70'],
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
  'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=1200&q=70',
  array['https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?auto=format&fit=crop&w=1200&q=70'],
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
select id, 2, '19:00', '22:00', 50 from instructors
union all select id, 4, '19:00', '22:00', 50 from instructors
union all select id, 6, '09:00', '13:00', 50 from instructors;

-- 노출 리뷰 (예약 완료 가정)
insert into reviews (instructor_id, student_name_masked, rating_total, rating_kindness, rating_explanation, rating_effect, recommend_for, content, instructor_reply, status)
select id, '김**', 5,5,5,5, '100타 탈출', '평균 108타에서 3개월 만에 96타 쳤어요. 드라이버 슬라이스 원인을 딱 짚어주시고 매 회차 영상으로 비교해주셨습니다.', '회원님 연습량이 정말 좋으셨어요! 다음 목표 90타도 금방입니다 :)', 'visible'::review_status from instructors where slug='kim-pro'
union all select id, '이**', 5,5,4,5, '직장인', '설명이 군더더기 없고 과제를 명확히 주셔서 혼자 연습할 때도 헤매지 않았어요.', null, 'visible'::review_status from instructors where slug='kim-pro'
union all select id, '최**', 5,5,5,4, '여성/입문자', '골프 완전 처음이었는데 그립부터 차근차근 알려주셔서 무섭지 않았어요.', null, 'visible'::review_status from instructors where slug='park-pro'
union all select id, '정**', 4,4,5,4, '필드 준비', '필드레슨이 정말 도움됐습니다. 연습장과 필드는 다르다는 걸 배웠어요.', null, 'visible'::review_status from instructors where slug='lee-pro';
