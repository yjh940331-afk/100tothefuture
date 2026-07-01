# 100 to the Future 운영 메모

서비스 방향은 **골프 중계/콘텐츠 허브 + 검증 프로 레슨 예약**입니다.

## 이번에 추가된 기능

- `/live`: 골프 중계 허브. 대회 일정, 공식 중계 링크, 하이라이트 큐레이션, 레슨 연결 흐름을 담는 화면.
- `/admin`: 프로 등록/수정 UI, 예약 상태 필터, 예약 상세 메모, 후기 답변 저장.
- `/api/admin/instructors`: 관리자 전용 프로 생성/수정 API.
- 예약 생성/상태 변경 알림 훅: `ADMIN_NOTIFICATION_WEBHOOK_URL`이 있으면 JSON webhook으로 운영 알림 전송.
- 사이트 URL 환경변수: `NEXT_PUBLIC_SITE_URL`로 sitemap, robots, metadata 기준 URL을 교체.

## 운영 환경변수

```env
NEXT_PUBLIC_SITE_URL=https://100tothefuture.yjh940331.workers.dev
ADMIN_NOTIFICATION_WEBHOOK_URL=
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

