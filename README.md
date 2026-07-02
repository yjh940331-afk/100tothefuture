# 100 to the Future ⛳

**100타 탈출을 원하는 골퍼와 검증된 레슨프로를 연결하는 레슨 중개 플랫폼**

> "100타 탈출, 혼자 고민하지 말고 검증된 프로와 시작하세요."

- 프론트/백엔드: **Next.js 15 (App Router, TypeScript)**
- 데이터베이스/인증/스토리지: **Supabase (PostgreSQL)**
- 배포: **Cloudflare Workers** (`@opennextjs/cloudflare`, Wrangler)
- 도메인: `www.100tothefuture.com`

---

## ✅ 지금까지 구현된 것 (P0)

| 화면 | 경로 | 내용 |
|---|---|---|
| 메인 랜딩 | `/` | 히어로, 추천 프로, 신뢰 장치, 진행 흐름, CTA |
| 레슨프로 목록 | `/pros` | 지역·전문분야·장소·시간·가격 필터 + 정렬 |
| 레슨프로 상세 | `/pros/[slug]` | 갤러리, 약력, 검증 배지, 자격, 커리큘럼, 가능 시간, 후기, 후기 작성 |
| 상담·예약 요청 | `/pros/[slug]/booking` | 이름/연락처/희망일정/상품/고민 + 개인정보·제3자 제공 동의 |
| 관리자 | `/admin` | 예약 상태 관리, 리뷰 승인/숨김, 프로 등록·수정, 프로 사진 업로드 (비밀번호 로그인) |
| 약관/정책 | `/terms` `/privacy` `/policy/reviews` | 표준 예시 (실제 정보로 수정 필요) |

- 후기: **예약 완료 수강생 대상** 작성 → **관리자 승인 후 노출**, 이름 자동 마스킹(김\*\*)
- 검증 배지: 관리자가 증빙 확인 후 부여하는 구조 (검증 안 한 내용 표시 안 함)
- SEO: 프로별 메타태그, `sitemap.xml`, `robots.txt`, Open Graph

> **데모 모드**: Supabase 환경변수가 없으면 예시 데이터(`src/lib/seed-data.ts`)로 자동 동작합니다.
> 상단에 "데모 모드" 배너가 뜨고, 예약/리뷰는 저장되지 않습니다. Supabase를 연결하면 실데이터로 전환됩니다.

---

## 🚀 로컬 실행

Node 20 이상 필요 (`.nvmrc` = 20.17.0).

```bash
nvm use            # 또는 nvm install 20.17.0
npm install
cp .env.example .env.local   # (선택) Supabase 없이도 데모 모드로 실행됨
npm run dev        # http://localhost:3000
```

---

## 🗄️ Supabase 연결 (실데이터 전환)

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. **SQL Editor** 에서 순서대로 실행
   1. `supabase/schema.sql` (테이블 · RLS · 뷰)
   2. `supabase/seed.sql` (예시 프로 4명 — 실서비스 전 실제 데이터로 교체)
3. **Settings → API** 에서 키 확인 후 `.env.local` 에 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # service_role (관리자 작업용, 비공개)
ADMIN_PASSWORD=강력한_비밀번호
ADMIN_SESSION_SECRET=긴_랜덤_세션_서명_문자열
```

4. (프로필/갤러리 이미지 업로드용) 관리자 업로드 API가 Supabase Storage 공개 버킷을 사용합니다.
   기본 버킷명은 `pro-images` 이며, 필요하면 `SUPABASE_STORAGE_BUCKET` 환경변수로 바꿀 수 있습니다.
   `next.config.mjs` 의 `remotePatterns` 는 `*.supabase.co` 이미지를 허용합니다.

### 데이터 모델 요약
`instructors` · `instructor_certifications` · `lesson_packages` ·
`availability_rules` / `availability_exceptions` · `bookings` · `reviews` ·
`review_reports` · `consent_logs`

> 예약 가능 시간 = `availability_rules`(요일 규칙) + `availability_exceptions`(날짜 예외) + `bookings`(이미 잡힌 예약) 조합으로 계산합니다.

---

## 🔐 관리자 페이지

- 접속: `/admin`
- 로그인: `ADMIN_PASSWORD` 환경변수 값
- 기능: 예약 상태 변경(확정/완료/취소/거절/노쇼), 리뷰 승인·숨김, 프로 등록·수정, 프로필/갤러리 사진 업로드
- 로그인 쿠키는 `ADMIN_SESSION_SECRET`으로 서명된 세션 토큰이며, 반복 실패 시 일시 제한됩니다.
- 운영 규모가 커지면 Supabase Auth + role 기반으로 교체 권장.
- 사진 업로드는 JPG/PNG/WebP, 8MB 이하만 허용합니다. 업로드 후 `프로 저장`을 눌러야 사이트 데이터에 반영됩니다.

---

## ☁️ 배포 — Cloudflare Workers

```bash
npm run cf:build      # OpenNext로 Cloudflare Worker 빌드
npm run cf:preview    # 로컬 Worker preview
npm run cf:deploy     # 빌드 + Cloudflare 배포 (wrangler 로그인 필요)
```

**배포 전 준비:**
1. `wrangler login`
2. Cloudflare Workers 환경변수/secret 등록:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
3. `wrangler.jsonc` 의 `name`, `compatibility_date` 확인

### 도메인 연결 (가비아에서 구매한 `100tothefuture.com`)
1. Cloudflare Workers → **Custom domains** 에 `www.100tothefuture.com` 추가
2. 가비아 DNS 또는 네임서버를 Cloudflare로 이전 후:
   - `www` → Pages (CNAME)
   - `100tothefuture.com`(루트) → `www` 로 **301 리다이렉트** (Cloudflare Redirect Rule)
3. HTTPS/SSL: Cloudflare가 자동 발급 (Full 모드 권장)
4. 검색 등록: Google Search Console, 네이버 서치어드바이저 에 `sitemap.xml` 제출

---

## 📁 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                 메인 랜딩
│  ├─ pros/page.tsx            프로 목록(필터)
│  ├─ pros/[slug]/page.tsx     프로 상세
│  ├─ pros/[slug]/booking/     예약 요청
│  ├─ admin/page.tsx           관리자
│  ├─ (privacy|terms|policy)   약관/정책
│  ├─ api/                     bookings · reviews · admin
│  ├─ sitemap.ts · robots.ts   SEO
├─ components/                 Header, Footer, Card, Badge, Stars, Forms, Admin...
└─ lib/
   ├─ types.ts constants.ts    도메인 타입/옵션
   ├─ supabase.ts data.ts      DB 접근 + 시드 폴백
   ├─ seed-data.ts             데모 데이터
   └─ admin-auth.ts            관리자 인증
supabase/schema.sql · seed.sql  DB 스키마/시드
```

---

## 🗺️ 다음 단계

- **P1**: 로그인, 내 예약 내역, 찜하기, 카카오/SMS 알림, 프로 자가 시간 수정, 프로 답글 UI, 지역별 SEO 랜딩, 100타 진단 테스트
- **P2**: 결제·예약금, 정산, 채팅, 스윙 영상 피드백, 수강생 스코어 관리, AI 추천

---
🤖 초기 스캐폴딩 및 P0 구현: Claude Code
