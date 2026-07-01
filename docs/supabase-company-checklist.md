# 회사에서 할 Supabase 작업 체크리스트

이 문서는 회사 PC에서 Supabase 대시보드에 접속해 운영 DB를 최신 코드와 맞추는 절차다.

## 해야 하는 이유

현재 배포된 웹에는 `/request` 견적 요청 화면과 `/admin` 견적 요청 탭이 들어가 있다. 하지만 운영 Supabase DB에 새 테이블이 없으면 `/request` 제출 시 저장되지 않고 아래와 비슷한 오류가 난다.

```txt
Supabase SQL Editor에서 supabase/marketplace.sql을 먼저 실행해주세요.
```

따라서 회사에서 Supabase SQL Editor에 아래 SQL 파일들을 적용해야 한다.

## 0. 먼저 service role key 교체

이전에 service role key가 채팅에 노출된 적이 있으므로 운영 전에 반드시 교체한다.

1. Supabase Dashboard 접속
2. 해당 프로젝트 선택
3. Project Settings 또는 API Keys 메뉴 이동
4. `service_role` 관련 key를 새로 발급하거나 rotate
5. Cloudflare Worker secret `SUPABASE_SERVICE_ROLE_KEY`를 새 값으로 교체
6. Worker 재배포
7. 이전 key가 더 이상 동작하지 않는지 확인

Cloudflare에서 교체할 때:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run cf:deploy
```

주의: service role key는 절대 프론트엔드, 모바일 앱, GitHub, 문서, 채팅에 넣지 않는다.

## 1. SQL 적용 순서

Supabase Dashboard > SQL Editor에서 아래 순서대로 실행한다.

### 1-1. 견적 요청 테이블

파일:

```txt
supabase/marketplace.sql
```

이 파일이 만드는 것:

- `lesson_requests`: 고객 견적 요청
- `lesson_quotes`: 프로별 견적 제안
- 견적 요청 상태/지역/견적 조회 인덱스
- RLS 활성화

실행 후 `/request` 제출과 `/admin` 견적 요청 탭이 실제 DB를 사용한다.

### 1-2. 알림 로그/앱 푸시 테이블

파일:

```txt
supabase/notifications.sql
```

이 파일이 만드는 것:

- `notification_logs`: SMS, webhook, push 발송 로그
- `app_push_tokens`: 앱 출시 후 iOS/Android/web push token 저장
- 알림 조회 인덱스
- RLS 활성화

현재 SMS가 꺼져 있어도 이 테이블은 미리 만들어두는 것이 좋다. 알림 실패/스킵 기록과 앱 확장에 필요하다.

## 2. SQL 실행 후 확인 쿼리

SQL Editor에서 아래를 실행해 테이블이 생겼는지 확인한다.

```sql
select
  to_regclass('public.lesson_requests') as lesson_requests,
  to_regclass('public.lesson_quotes') as lesson_quotes,
  to_regclass('public.notification_logs') as notification_logs,
  to_regclass('public.app_push_tokens') as app_push_tokens;
```

모두 `public.table_name` 형태로 나오면 정상이다.

RLS가 켜졌는지 확인:

```sql
select
  relname,
  relrowsecurity
from pg_class
where relname in (
  'lesson_requests',
  'lesson_quotes',
  'notification_logs',
  'app_push_tokens'
)
order by relname;
```

`relrowsecurity`가 모두 `true`이면 정상이다.

## 3. 웹에서 실제 저장 테스트

1. 배포 URL 접속
2. `/request`로 이동
3. 테스트 요청 작성
   - 이름: `테스트`
   - 연락처: `010-0000-0000`
   - 목표: 아무거나 1개 이상
   - 개인정보 동의 체크
4. 제출 후 요청번호가 보이는지 확인
5. `/admin` 로그인
6. `견적 요청` 탭에 방금 요청이 보이는지 확인

테스트 데이터 삭제:

```sql
delete from lesson_quotes
where lesson_request_id in (
  select id from lesson_requests where customer_phone = '010-0000-0000'
);

delete from lesson_requests
where customer_phone = '010-0000-0000';
```

## 4. 실패할 때 보는 것

### `/request`에서 테이블이 없다는 오류

`supabase/marketplace.sql`이 아직 적용되지 않았거나, Supabase REST schema cache가 갱신되기 전일 수 있다.

조치:

1. SQL이 성공했는지 확인
2. 위 확인 쿼리 실행
3. 30초 정도 기다린 뒤 다시 제출
4. 계속 실패하면 Worker 재배포

### 알림 로그 관련 오류

`notification_logs`가 없으면 알림 로그 저장이 실패할 수 있다.

조치:

1. `supabase/notifications.sql` 실행
2. 확인 쿼리 실행
3. SMS를 쓸 예정이면 Cloudflare secret 설정

### 관리자에서 견적 요청이 안 보임

가능한 원인:

- DB에 `lesson_requests` 테이블 없음
- 요청 저장이 실패함
- 관리자 세션 만료
- `SUPABASE_SERVICE_ROLE_KEY`가 잘못됨

먼저 SQL Editor에서 확인:

```sql
select id, customer_name, customer_phone, status, created_at
from lesson_requests
order by created_at desc
limit 20;
```

DB에는 있는데 관리자에 안 보이면 service role key 또는 배포 환경변수를 확인한다.

## 5. 선택 설정: SMS/알림톡

현재 코드는 Solapi SMS 발송을 지원한다. 아래 값을 Cloudflare secret으로 넣고 재배포하면 예약/견적 요청 알림을 보낼 수 있다.

```bash
wrangler secret put SMS_NOTIFICATIONS_ENABLED
wrangler secret put SOLAPI_API_KEY
wrangler secret put SOLAPI_API_SECRET
wrangler secret put SOLAPI_SENDER
wrangler secret put ADMIN_NOTIFICATION_PHONE
npm run cf:deploy
```

초기에는 `SMS_NOTIFICATIONS_ENABLED=false`로 두고, 운영 테스트가 끝난 뒤 켜는 것을 권장한다.

## 6. 나중에 앱 출시 전 해야 할 일

앱을 만들 때는 지금의 연락처 기반 구조에서 계정 기반 구조로 확장한다.

- Supabase Auth 또는 별도 Auth 결정
- 고객/프로 계정 테이블 추가
- 예약, 견적 요청, 견적 제안에 `customer_user_id`, `instructor_user_id` 연결
- RLS 정책으로 본인 데이터만 접근 가능하게 변경
- `app_push_tokens`에 앱 푸시 토큰 저장
- 알림 발송을 큐 기반으로 분리

관련 판단은 `docs/scaling.md`에 정리되어 있다.
