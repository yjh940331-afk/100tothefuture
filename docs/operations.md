# 100 to the Future 운영 메모

서비스 방향은 **검증 프로 골프 레슨 예약 플랫폼**입니다.

## 이번에 추가된 기능

- `/bookings`: 사용자가 예약번호와 연락처로 본인 예약을 조회하고 취소하는 화면.
- `/admin`: 프로 등록/수정 UI, 예약 상태 필터, 예약 상세 메모, 후기 답변 저장.
- `/api/admin/instructors`: 관리자 전용 프로 생성/수정 API.
- 예약 생성/상태 변경 알림: webhook, SMS, 추후 앱 push로 확장 가능한 이벤트 구조.
- 사이트 URL 환경변수: `NEXT_PUBLIC_SITE_URL`로 sitemap, robots, metadata 기준 URL을 교체.

## 운영 환경변수

```env
NEXT_PUBLIC_SITE_URL=https://100tothefuture.yjh940331.workers.dev
ADMIN_NOTIFICATION_WEBHOOK_URL=
ADMIN_NOTIFICATION_PHONE=
SMS_NOTIFICATIONS_ENABLED=false
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=
```

실제 도메인을 연결하면 `NEXT_PUBLIC_SITE_URL`을 `https://www.도메인`으로 바꾸고 다시 배포하세요.

## 도메인 연결 순서

1. Cloudflare Workers의 `100tothefuture` Worker에서 Custom domain을 추가합니다.
2. 사용할 도메인 예: `www.100tothefuture.com`
3. Cloudflare DNS 또는 등록기관 DNS에서 해당 도메인이 Cloudflare로 향하게 설정합니다.
4. `NEXT_PUBLIC_SITE_URL` Cloudflare secret을 실제 도메인으로 교체합니다.
5. `npm run cf:deploy`로 다시 배포합니다.

## service role key 재발급

`SUPABASE_SERVICE_ROLE_KEY`가 채팅이나 문서에 노출된 적이 있으면 Supabase 대시보드에서 새 service role key를 재발급하고 Cloudflare secret을 교체하세요.

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run cf:deploy
```

새 키가 반영된 뒤 이전 키를 Supabase에서 폐기합니다.

## 문자/알림톡 자동화

현재 코드는 Solapi SMS 발송을 지원합니다. 아래 값이 모두 들어 있고 `SMS_NOTIFICATIONS_ENABLED=true`이면 예약 접수, 예약 상태 변경, 사용자 취소 시 고객에게 문자가 발송됩니다.

```bash
wrangler secret put SMS_NOTIFICATIONS_ENABLED
wrangler secret put SOLAPI_API_KEY
wrangler secret put SOLAPI_API_SECRET
wrangler secret put SOLAPI_SENDER
wrangler secret put ADMIN_NOTIFICATION_PHONE
npm run cf:deploy
```

운영 DB에는 `notification_logs`와 `app_push_tokens` 테이블을 추가해야 합니다. 기존 Supabase 프로젝트는 `supabase/schema.sql`의 알림 테이블/인덱스/RLS 부분을 SQL Editor에서 한 번 실행하세요.

앱 출시를 고려한 구조:

- 모든 알림 이벤트는 `notification_logs`에 채널별로 남습니다.
- 현재 채널은 `webhook`, `sms`입니다.
- 앱 로그인과 푸시 토큰이 생기면 `app_push_tokens`를 기준으로 `push` 채널을 추가하면 됩니다.
- 고객 식별은 초기에는 연락처 기준이고, 앱 계정 도입 후 `recipient_user_id`로 이전할 수 있습니다.
