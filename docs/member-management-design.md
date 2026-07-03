# 회원관리 설계 (Members / Instructors / Auth)

> 결정사항(2026-07-03): **카카오 로그인** · **프로 셀프 계정+전용페이지** · **단계적 구축**.
> 인증/DB는 전부 **Supabase**, 이미지는 **Cloudflare R2**(기존 인프라 재사용).

## 1. 사용자 3종
- **student(수강생)**: 카카오로 가입, 예약·리뷰·찜·레슨이력
- **instructor(프로)**: 카카오로 가입 후 프로 신청 → 관리자 승인 → 셀프 관리
- **admin(운영자)**: 기존 비밀번호 로그인 유지(별도)

## 2. 인증 (Supabase Auth + Kakao)
- Supabase Auth의 Kakao OAuth 프로바이더 사용.
- 세션은 쿠키 기반 → **`@supabase/ssr`(이미 설치됨)** 로 서버/클라이언트 클라이언트 구성.
  현재 `getSupabase()`는 세션 없이 anon으로 읽기만 함 → 로그인 사용자용으로 쿠키 세션 클라이언트 추가 필요.
- 카카오가 주는 값: 카카오 id, 닉네임, 프로필사진, (동의 시)이메일. **전화번호는 카카오 심사 없이는 안 옴** → 최초 로그인 시 온보딩에서 별도 입력받음.

### 카카오 설정(운영자가 1회)
1. Kakao Developers → 앱 생성 → REST API 키 발급
2. 카카오 로그인 활성화, Redirect URI = `https://roiasbibswycgxapjrjn.supabase.co/auth/v1/callback`
3. 동의항목: 닉네임/프로필사진(필수), 이메일(선택)
4. Supabase → Authentication → Providers → Kakao → REST API 키/시크릿 입력, 활성화

## 3. DB 스키마 (Supabase / 신규·확장)
```sql
-- 공통 프로필 (auth.users 1:1)
profiles(
  id uuid pk references auth.users on delete cascade,
  role text check (role in ('student','instructor','admin')) default 'student',
  name text, nickname text, phone text, email text,
  avatar_url text, region text,
  marketing_agreed bool default false,
  created_at timestamptz default now()
)

-- 수강생 추가 정보
student_profiles(
  user_id uuid pk references profiles(id) on delete cascade,
  current_avg_score int, target_score int,
  career_months int, weekly_practice int, goal text
)

-- 기존 테이블 확장
instructors      + user_id uuid references auth.users  (프로가 본인 행 소유/수정)
bookings         + student_user_id uuid references auth.users  (게스트 예약도 유지=nullable)
reviews          + student_user_id uuid references auth.users  (photo_urls 는 이미 있음)

-- 찜(좋아요) — 스키마에 이미 존재하면 재사용
favorites(
  id uuid pk default gen_random_uuid(),
  student_user_id uuid references auth.users,
  instructor_id uuid references instructors on delete cascade,
  created_at timestamptz default now(),
  unique(student_user_id, instructor_id)
)
```

### 집계(별도 테이블 없이 파생)
- **수강생 레슨 횟수** = `bookings` 중 내 것 & status=completed 카운트
- **프로 누적 레슨수** = 해당 프로 completed 예약 카운트
- **프로 좋아요수** = favorites 카운트
- 트래픽 커지면 materialized view/캐시로 전환 (docs/scaling.md 참고)

## 4. RLS 정책 (핵심)
- `profiles`: 본인 select/update. 공개는 nickname/avatar 등 제한 컬럼만(리뷰 표시용).
- `student_profiles`: 본인만.
- `bookings`: 수강생은 `student_user_id = auth.uid()` 인 것만, 프로는 자기 instructor의 예약만, 관리자=service_role 전체.
- `reviews`: 작성은 로그인+본인 완료예약 검증(정책 또는 API), 수정은 본인.
- `favorites`: 본인 insert/delete.
- 프로 관리 작업은 `instructors.user_id = auth.uid()` 로 셀프 접근 허용.

## 5. 페이지
### 수강생
- `/login` (카카오 버튼)
- `/onboarding` (최초: 전화번호·지역·마케팅동의)
- `/mypage` (내 예약 / 내 리뷰 / 찜한 프로 / 레슨 이력·횟수)
- `/mypage/edit` (프로필 수정)

### 프로
- `/pro/apply` (프로 신청: 자격·경력·증빙) → 관리자 승인
- `/pro/dashboard` (프로필·가능시간 수정, 예약/견적 관리, 리뷰 답글, 통계: 조회수·좋아요·누적레슨·평점)
- 공개 페이지는 기존 `/pros/[slug]` 에 **좋아요 버튼 + 좋아요수 + 누적레슨수** 추가

### 리뷰 사진
- 수강생용 이미지 업로드 엔드포인트 추가(R2 재사용) → `reviews.photo_urls`에 저장.
- 상세페이지 리뷰에 썸네일 갤러리.

## 6. 개인정보 (PIPA)
- 수강생 수집 최소화: 이름·연락처·지역·목표. 마케팅/제3자제공 동의는 `consent_logs`(기존)에 기록.
- 프로: 이름·연락처·자격증빙(관리자 검증), 정산 계좌는 결제(P2) 붙일 때.
- 처리방침/약관에 회원·프로 항목 반영 필요.

## 7. 단계적 구축 순서
- **Phase 1** — 수강생 카카오 로그인 + `profiles`/`student_profiles` + `/mypage`·`/mypage/edit` + **찜(좋아요)** 기능 + 예약을 로그인계정과 연결
- **Phase 2** — 로그인 유저 리뷰 작성(완료예약 검증) + **리뷰 사진 업로드**, 닉네임 표시
- **Phase 3** — 프로 페이지 **좋아요수·누적레슨수·평점 지표** 노출 + 수강생 레슨 이력 화면
- **Phase 4** — 프로 셀프 로그인 + `/pro/apply`·`/pro/dashboard` (프로가 직접 관리)

각 Phase 끝나면 빌드·배포·검증. Phase 1 시작 전 카카오/Supabase Auth 설정(운영자 1회)이 선행.
