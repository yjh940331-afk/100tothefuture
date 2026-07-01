# 확장성 메모: 10만 MAU를 고려한 현재 판단

이 문서는 100 to the Future가 골프 레슨 교육사업 브로커로 커질 때, 지금 기술 선택을 유지해도 되는지와 어떤 지점을 먼저 개선해야 하는지 남기는 운영 판단서다.

## 결론

지금은 **Cloudflare Workers + Supabase 유지**가 맞다.

MAU 10만 자체는 이 스택에서 불가능한 숫자가 아니다. 다만 MAU보다 중요한 것은 피크 트래픽, 동시 요청, DB 쿼리 패턴, 알림 발송량이다. 따라서 지금 대규모 아키텍처로 갈아엎기보다, 나중에 갈아엎지 않도록 **확장 가능한 MVP**로 계속 다듬는다.

## 왜 Supabase를 유지하는가

이 서비스는 관계형 데이터가 많다.

- 고객
- 프로
- 견적 요청
- 프로별 견적
- 예약
- 후기
- 결제/정산
- 알림 로그
- 앱 푸시 토큰

이 구조는 NoSQL보다 Postgres가 잘 맞는다. Supabase는 Postgres 기반이라 조인, 인덱스, 트랜잭션, RLS를 그대로 쓸 수 있고, 앱 출시 시 Auth, Storage, Realtime, 자동 API를 붙이기 쉽다.

초기 사업 검증 단계에서는 Supabase가 빠르다. 나중에 규모가 커져도 Postgres 기반이므로 AWS RDS, Neon, 자체 Postgres, read replica, 검색 전용 엔진으로 이전할 여지가 있다.

## 10만 MAU 전에 먼저 볼 병목

### 1. DB 쿼리와 필터링

현재 일부 프로 목록은 데이터를 가져온 뒤 앱 레이어에서 필터링한다. 프로 수가 수천 명 이상이 되면 DB에서 필터링, 정렬, 페이지네이션을 해야 한다.

우선순위:

- `/pros` 목록에 limit/offset 또는 cursor pagination 적용
- 지역, 전문 분야, 가격, 활성 상태, 추천 여부에 인덱스 추가
- 프로 평점/후기 수는 실시간 집계보다 materialized view 또는 캐시 고려

### 2. 관리자 화면

운영 데이터가 쌓이면 전체 예약/후기/요청을 한 번에 가져오면 느려진다.

우선순위:

- `/admin` 예약, 견적 요청, 후기 목록 페이지네이션
- 날짜 범위 필터
- 상태 필터
- 고객 연락처/이름 검색
- 프로별 필터

### 3. 알림과 문자 발송

현재 알림은 API 흐름 안에서 같이 실행된다. 트래픽이 늘면 고객 응답 속도와 외부 SMS 장애가 서로 영향을 준다.

우선순위:

- 예약/견적 요청 생성은 DB 저장까지만 빠르게 처리
- SMS, 알림톡, 앱 푸시는 큐로 분리
- Cloudflare Queues 또는 별도 워커로 재시도/실패 처리
- `notification_logs` 기준으로 발송 상태 추적

### 4. 고객/프로 앱 계정

앱 출시 전에는 계정 모델을 잡아야 한다.

우선순위:

- Supabase Auth 또는 별도 Auth 도입
- 고객, 프로, 운영자 role 분리
- `profiles`, `instructor_accounts`, `customer_accounts` 같은 계정 연결 테이블 추가
- RLS 정책으로 본인 예약/요청/견적만 접근 가능하게 설계

### 5. 검색

초기 검색은 Postgres 인덱스로 충분하다. 다만 자연어 검색, 추천, 거리 기반 정렬이 커지면 별도 구조가 필요하다.

우선순위:

- 지역/카테고리/가격/가능 시간은 Postgres 인덱스
- 키워드 검색은 PostgreSQL full text 또는 PGroonga 검토
- 추천 랭킹은 별도 score 컬럼 또는 배치 계산
- 대규모 검색은 Meilisearch, Typesense, OpenSearch 등 검토

### 6. 관측과 비용 관리

트래픽이 늘기 전부터 기본 지표를 봐야 한다.

우선순위:

- Cloudflare Workers errors, CPU time, request volume 확인
- Supabase CPU, DB connections, slow queries 확인
- `pg_stat_statements`로 느린 쿼리 추적
- 알림 실패율, 예약 전환율, 견적 요청 전환율 저장

### 7. 보안

서비스 role key는 서버에서만 써야 한다. 채팅, 문서, 프론트엔드, 모바일 앱에 노출되면 즉시 교체한다.

우선순위:

- 노출된 service role key 재발급
- 관리자 비밀번호 단일 구조를 다중 관리자 계정으로 교체
- 관리자 작업 감사 로그 추가
- Turnstile 또는 rate limit으로 견적 요청 스팸 방지

## 지금 당장 하지 않을 것

- DB를 다른 서비스로 성급히 이전
- 마이크로서비스 분리
- Kubernetes 도입
- 검색 엔진 선도입
- 모든 기능을 앱 기준으로 과설계

지금은 브로커 사업 검증이 먼저다. 단, 새 기능을 만들 때는 페이지네이션, 인덱스, RLS, 큐 분리 가능성을 염두에 둔다.

## 단계별 기준

### 출시 전

- Supabase SQL 적용
- 노출된 service role key 교체
- `/request`, `/admin` 실제 저장 확인
- 최소한의 백업/복구 방식 확인

### 월 견적 요청 1,000건 전후

- 관리자 목록 페이지네이션
- 요청 상태/날짜 검색
- 알림 실패 로그 확인
- 스팸 방지 추가

### 월 견적 요청 10,000건 전후

- 알림 큐 분리
- 관리자 검색 최적화
- 느린 쿼리 분석
- DB compute 업그레이드 검토

### 앱 출시 전

- Supabase Auth 또는 별도 Auth 결정
- 고객/프로 계정 모델 추가
- RLS 정책 재설계
- 앱 푸시 토큰 저장/발송 흐름 완성

### MAU 100,000 전후

- DB compute tier와 connection/pooler 한도 점검
- 캐시 전략 도입
- 검색/추천 별도 최적화 검토
- 알림/결제/정산 비동기 처리 안정화
- 운영자 권한/감사 로그 강화

## 참고

- Supabase Compute and Disk: https://supabase.com/docs/guides/platform/compute-and-disk
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase connection pooler: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
