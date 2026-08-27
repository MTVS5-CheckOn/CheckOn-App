# Check-On App API 연결 준비 명세

## 실행 모드

`.env.local`에서 데이터 소스만 바꾼다.

```env
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_TIMEOUT_MS=10000
NEXT_PUBLIC_API_RESPONSE_MODE=wrapped
```

- `mock`: 프론트 단독 개발·시연 모드. 백엔드 없이 계속 돌아야 한다.
- `api`: gateway가 HTTP 구현을 사용하는 연동 모드.
- 🔴 base URL은 계약의 `servers.url`과 같은 `/api/v1`이다. `/api`로 끝내면 모든 요청이 한 조각씩 어긋난다.
- 🔴 `auto`를 쓰지 않는다. `auto`는 `meta` 유무와 키 개수로 추측해서 `{data}`만 오는 응답과 `data`라는 필드를 가진 payload를 구분하지 못한다. 백엔드 성공 body는 항상 `{ "data": ... }`다.

### 인증 (계약으로 확정 — member-api.yaml)

- 전역 보안 스킴은 **`bearerAuth` (HTTP Bearer JWT)** 하나다 (`member-api.yaml:39-40`, `:1482-1487`).
- 로그인 응답 `data`는 `{ accessToken, accessTokenExpiresAt, account { id, role, email, teacherProfileId } }` (`:1730-1747`). `teacherProfileId`는 학생·학부모면 항상 `null`이다.
- refresh 토큰은 HttpOnly **`CHECKON_REFRESH`** 쿠키이고 Path가 `/api/v1/auth`다.
- 🔴 **`checkon_session` 쿠키는 계약에도 백엔드에도 없다.** 이전 문서의 서술은 틀렸다.
  그 쿠키를 미들웨어에서 읽어도 Path 때문에 Next 라우트(`/student/*`·`/parent/*`)로 애초에 전송되지 않는다.
  그래서 `proxy.ts`의 쿠키 판정을 제거하고 인증 판정을 클라이언트로 옮겼다.
- access token은 **메모리에만** 둔다 (`src/lib/api/token-store.ts`). localStorage·sessionStorage·쿠키에 저장하지 않는다.
- 401을 받으면 single-flight refresh 1회 → 원 요청 1회 재시도가 상한이다 (`src/lib/api/refresh.ts`).

### 로그인 경로는 role로 갈린다 (MB-01 CONFIRMED)

| 역할 | Method | 경로 | 입력 |
| --- | --- | --- | --- |
| 학생 | POST | `/api/v1/member/auth/students/login` | 공개 학생 ID(`STU-B52D9K`) + 비밀번호 |
| 학부모 | POST | `/api/v1/auth/login` ← 🔴 **member 경로가 아니다** | 이메일 + 비밀번호 |
| refresh / logout | POST | `/api/v1/auth/refresh` · `/api/v1/auth/logout` | member는 만들지 않는다 |

## 계층 규칙

```text
page → feature component → query/mutation hook → gateway interface
                                              ├─ mock gateway
                                              └─ HTTP gateway → apiRequest
```

- React 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- 서버 데이터는 TanStack Query, 화면 전용 상태와 진행 중 세션은 Zustand에 둔다.
- API DTO와 화면 domain 타입은 `api/dto.ts`와 `api/adapters.ts`로 분리한다. 계약 변경은 adapter에서 흡수한다.
- 🔴 **경로 문자열을 손으로 쓰지 않는다.** `src/lib/api/endpoints.ts` 한 곳에서만 만든다.
  `src/lib/api/endpoints.test.ts`가 모든 builder가 `member` 경계를 지나는지 강제한다.
- gateway는 응답을 zod로 검증한 뒤 domain으로 옮긴다. 계약과 다르면 `INVALID_API_RESPONSE`(502)로 **거기서 터진다.**
  🔴 스키마에 `.strict()`를 쓰지 않는다 — 백엔드가 필드를 추가하면 앱 전체가 502가 된다.
- API 오류는 `ApiError`의 `status`, `code`, `details`로 표준화한다.
- 모든 조회 화면은 loading, empty, error, retry 상태를 가져야 한다.

## 🔴 경로 접두 — 이게 제일 크다

이전 판의 표는 전부 `/v1/parents/...`·`/v1/students/...`였는데 **계약과 다르다.**
실제 계약은 `/api/v1/member/parents/...`·`/api/v1/member/students/...`로 **`member` 조각이 있다.**

그대로 두면 백엔드 `MemberSecurityConfiguration`(`@Order(0)`, `/api/v1/member/**`만 매칭)에서 벗어나
`AccountSecurityConfiguration`(`@Order(2)`)의 `/api/v1/**` → `hasRole("TEACHER")`로 떨어져
**학부모·학생이 전부 403**을 받는다.

아래 경로는 전부 base URL `/api/v1` 다음에 붙는 조각이다.

## 학부모 endpoint (계약 기준)

| 기능 | Method | 경로 |
| --- | --- | --- |
| 자녀 목록 | GET | `/member/parents/me/children` |
| 자녀 등록 | POST | `/member/parents/me/children` |
| 자녀 사전 확인 | **POST** | `/member/parents/me/children/verification` 🔴 GET+query가 아니다. body `{studentPublicId}` |
| 홈 | GET | `/member/parents/me/children/{studentId}/home` |
| 학습기록 목록 | GET | `/member/parents/me/children/{studentId}/learning-records` |
| 학습기록 상세 | GET | `/member/parents/me/children/{studentId}/learning-records/{recordId}` |
| 고급 분석 | GET | `/member/parents/me/children/{studentId}/analysis` |
| 약점 상세 | GET | `/member/parents/me/children/{studentId}/analysis/weaknesses/{areaTag}/{typeTag}` |
| 보고서 목록 | GET | `/member/parents/me/children/{studentId}/reports` |
| 보고서 상세 | GET | `/member/parents/me/children/{studentId}/reports/{reportId}` |
| 보고서 PDF 접근권 | POST | `/member/parents/me/children/{studentId}/reports/{reportId}/file-access` |
| 보고서 파일 다운로드 | GET | `/member/files/reports/{token}` (서명 URL, 인증 헤더 없음) |
| 상담 요청 | POST | `/member/parents/me/consultations` 🔴 `teacherId` 필수 |
| 상담 목록 | GET | `/member/parents/me/children/{studentId}/consultations` |
| 상담 상세 | GET | `/member/parents/me/children/{studentId}/consultations/{consultationId}` |
| 상담 취소 | POST | `/member/parents/me/children/{studentId}/consultations/{consultationId}/cancellation` 🔴 **백엔드 미구현(MB-09)** — 호출하지 않는다 |
| 알림 목록 | GET | `/member/parents/me/notifications` |
| 알림 읽음 | POST | `/member/parents/me/notifications/{notificationId}/read` |
| 전체 알림 읽음 | POST | `/member/parents/me/notifications/read-all` |
| 내 정보 | GET | `/member/parents/me/profile` |
| 알림 수신 설정 | PATCH | `/member/parents/me/profile/notification-preference` 🔴 `notifications`가 아니다 |
| 초대 코드 확인 | POST | `/member/parents/me/invitations/verification` |
| 초대 코드 등록 | POST | `/member/parents/me/invitations` |

## 학생 endpoint (계약 기준)

| 기능 | Method | 경로 |
| --- | --- | --- |
| 홈 | GET | `/member/students/me/home` |
| 학습지 목록 | GET | `/member/students/me/worksheets` |
| 학습지 상세 | GET | `/member/students/me/worksheets/{assignmentId}` |
| attempt 시작·재개 | POST | `/member/students/me/worksheets/{assignmentId}/attempts` (신규 201 · 재개 200) |
| attempt 조회 | GET | `/member/students/me/attempts/{attemptId}` |
| 진행 저장 | PATCH | `/member/students/me/attempts/{attemptId}/progress` |
| 답안 제출 | POST | `/member/students/me/attempts/{attemptId}/submission` (`Idempotency-Key` 필수) |
| 채점 결과 | GET | `/member/students/me/attempts/{attemptId}/result` (미제출이면 404) |
| 학습기록 목록 | GET | `/member/students/me/learning-records` |
| 학습기록 상세 | GET | `/member/students/me/learning-records/{recordId}` |
| 질문 목록 | GET | `/member/students/me/questions` |
| 질문 작성 | POST | `/member/students/me/questions` |
| 질문 상세 | GET | `/member/students/me/questions/{questionId}` |
| 추가 질문 | POST | `/member/students/me/questions/{questionId}/messages` 🔴 `follow-ups`가 아니다 |
| 내 정보 | GET | `/member/students/me/profile` |
| 알림 수신 설정 | PATCH | `/member/students/me/profile/notification-preference` |
| 초대 코드 확인 | **POST** | `/member/students/me/invitations/verification` 🔴 GET+query가 아니다 |
| 초대 코드 등록 | POST | `/member/students/me/invitations` |
| 활성화 상태 확인 | GET | `/member/auth/students/activation-status` |
| 세션 부트스트랩 | GET | `/member/auth/session` |

## 🔴 이전 판이 쓰던, 계약에 없는 엔드포인트

| 이전 판 | 계약 |
| --- | --- |
| `GET /v1/students/me/worksheets/{id}/quiz` | **없음.** `POST .../attempts` + `GET /attempts/{id}` |
| `POST /v1/students/me/worksheets/{id}/submissions` | **없음.** `POST /attempts/{attemptId}/submission` |
| `POST .../questions/{id}/follow-ups` | `.../questions/{id}/messages` |
| `PATCH .../profile/notifications` | `.../profile/notification-preference` |
| `GET .../invitations/verification?code=` | `POST .../invitations/verification` + body |
| `GET .../children/verification?studentId=` | `POST .../children/verification` + body `{studentPublicId}` |
| `POST /v1/auth/{role}/signup` | `/member/auth/students/sign-up` · `/member/auth/parents/sign-up` |
| `GET /v1/auth/student/activation-status` | `/member/auth/students/activation-status` |

## 오류 코드 (계약으로 확정)

정본은 백엔드 `com.checkon.member.common.error.MemberErrorCode` 21개이고, 프론트 사본은
`src/lib/api/error-codes.ts`다. HTTP 상태와 문구가 달라져도 컴포넌트는 `code`를 기준으로 상태 화면을 선택한다.

```
INVALID_REQUEST · AUTHENTICATION_REQUIRED · INVALID_CREDENTIALS · ACCOUNT_NOT_ACTIVE
ROLE_FORBIDDEN · STUDENT_ACTIVATION_REQUIRED · RESOURCE_NOT_FOUND · EMAIL_ALREADY_EXISTS
IDEMPOTENCY_CONFLICT · REVISION_CONFLICT · CHILD_ALREADY_LINKED · ATTEMPT_ALREADY_SUBMITTED
INVITE_ALREADY_CLAIMED · INVITE_EXPIRED · SUBMISSION_INCOMPLETE · RELATIONSHIP_REQUIRED
WORKSHEET_NOT_GRADABLE · RATE_LIMITED · INTERNAL · DEPENDENCY_UNAVAILABLE · DEPENDENCY_TIMEOUT
```

### 🔴 이전 판의 「합의가 필요한 오류 코드」 7개 중 5개는 계약에 없다

계약에 없는 코드로 분기하면 그 분기는 **영원히 실행되지 않는다.**
`RETIRED_ERROR_CODE_ALIASES`가 받은 코드를 계약 코드로 정규화한다.

| 이전 판 | 계약에 있나 | 실제 코드 |
| --- | --- | --- |
| `CHILD_ALREADY_LINKED` | ✅ 있다 | 그대로 (409) |
| `INVITE_EXPIRED` | ✅ 있다 | 그대로 (410) |
| `STUDENT_NOT_FOUND` | ❌ 없다 | `RESOURCE_NOT_FOUND` |
| `INVITE_INVALID` | ❌ 없다 | `RESOURCE_NOT_FOUND` |
| `INVITE_ALREADY_USED` | ❌ 없다 | `INVITE_ALREADY_CLAIMED` |
| `REPORT_NOT_READY` | ❌ 없다 | `RESOURCE_NOT_FOUND` |
| `PDF_NOT_FOUND` | ❌ 없다 | `RESOURCE_NOT_FOUND` |

## 🔴 계약에 원천이 없어 미표시 (2026-08-27)

화면이 백엔드가 약속한 적 없는 데이터로 설계돼 있었다. 아래 값은 **계약에 원천이 없어 화면에서 감췄다.**

감추는 방식 — 🔴 **지우지 않고 감춘다.**
- 타입·adapter 에서 필드를 **삭제하지 않았다.** 백엔드가 낼지 정해지면 되살려야 한다.
- 🔴 **빈 칸을 만들지 않았다.** 「─」·「0」·「정보 없음」을 채우면 그게 곧 지어낸 값이다. 값이 없으면 그 항목 자체를 렌더링하지 않는다.
- 항목이 전부 빠져 섹션이 비면 **섹션째 감췄다.** 제목만 남은 빈 카드를 두지 않는다.
- 🔴 **계산해서 만들지 않았다.** `itemIds` 로 오답 수를 셀 수 있어도 세지 않는다 — 서버가 나중에 같은 값을 내면 두 값이 갈린다.
- 감춘 자리마다 주석으로 왜 감췄는지 + 계약 어디에 없는지 적었다.

| 화면 | 필드 | 판정 필요 |
| --- | --- | --- |
| 분석 | `baselineAccuracy` · `comparisonMonth` · `reviewQuestionCount` · `repeatedMistakeCount` · `weeklySummary` · `difficultyDistribution` · `misconceptionSummary` | 백엔드가 낼 것인가, 화면에서 영구히 뺄 것인가 |
| 약점 상세 | `description` · `studyFrequency` · `averageTime` · `misconception` · `linkedWeaknesses` · `nextAction` — 「왜 이 영역이 약점인가요?」·「함께 막힌 유형」·「다음 학습 제안」 세 섹션 통째 | 〃 (`WeaknessCell` 에 전부 없다) |
| 보고서 | `studyPeriod` · `teacherComment` · `summary.*`(정답률·약점개선도·우선보완·비교월·채점문항·반복실수) | 〃 |
| 학습기록 상세 | `reviewCount` · `repeatedMistakeCount` · `insight` · `skillResults` · `wrongTypeSummary` · `overtimeQuestionSummary` · `baselineAccuracy` | 〃 |
| 내 정보 | `maskedPhone` | 〃 (`ParentProfile` 에 전화번호 필드 자체가 없다) |

### 🔴 `summary.*` 는 `sections[].data` 로도 만들 수 없다

```yaml
# member-api.yaml:2276-2279  ReportDetail.sections[].data
data: { type: object, nullable: true, description: 차트용 원시 값 }
```

**자유형 object 라 계약이 안쪽 키를 하나도 약속하지 않는다.** 게다가 W1 발행 배치가
그 값(`content` 컬럼)을 **항상 `null` 로** 넣는다. 계약상으로도 실제로도 원천이 아니다.

### ✅ `studentName` 은 예외 — 감추지 않는다

보고서 화면은 `studentId` 로 라우팅되니 이미 어느 자녀인지 안다.
자녀 목록·홈에서 이미 가진 이름을 **화면 상태에서 쓴다. API 를 새로 부르지 않는다.**

### 🔴 계약과 실제 응답이 다른 지점 (판정 필요)

실제 백엔드(dev `1dfdc69`) 시연 시드로 확인했다. 어느 쪽도 임의로 고치지 않았다.

| 지점 | 계약 | 실제 | 프론트 처리 |
| --- | --- | --- | --- |
| `Child.name` | `required` | 자녀 4명 중 2명이 `null` | null 허용. 이름 줄을 렌더링하지 않는다. **required 로 두면 내 정보 화면 전체가 502 로 죽는다** |
| `LearningRecordDetail.items` · `weakness` | 둘 다 `required` | `itemIds`(id 배열) · `weaknessStatus`(문자열)로 온다 | 양쪽 다 받아들이고, 문항별 결과·약점 섹션은 값이 올 때만 그린다 |
| `ParentAnalysis.calculatedAt` | `nullable` 표기 없음 | `null` 로 온다 | `required` 에 없는 필드는 전부 `.nullish()` 로 받는다 |
| `POST .../consultations/{id}/cancellation` | 경로 있음 | **미매핑.** 401 + `{"code":"UNAUTHORIZED"}` (member 봉투 아님) | `consultationCancellationSupported=false` 로 **호출하지 않는다.** MB-09 확정 시 백엔드와 함께 처리 — 지금 우회하지 않는다 |

## 🔴 비어 있는 게 정상인 화면

아래 넷은 버그가 아니라 계약이 허용하는 정상 상태다. 빈 상태 화면을 그리는 것이 산출물이다.

| 상태 | 왜 | 화면 |
| --- | --- | --- |
| 보고서 목록이 빈 배열 | 강사가 발행해야 채워진다 | 「발행된 월별 보고서가 없어요」 |
| 상담 `messages: []` | 강사가 답해야 온다. `SUBMITTED`/`WAITING`이 정상 | 「선생님이 요청을 확인하고 있어요」 |
| `hasPdf: false` | PDF가 아직 연결되지 않았다 | 「PDF 파일이 아직 준비되지 않았어요」 + 상세로 복귀 |
| 전국 백분위 | 🔴 **계약에 필드 자체가 없다** | 표시하지 않는다. 지어내지 않는다 |

## 백엔드 연결 시 체크리스트

1. OpenAPI 기준 DTO와 gateway 반환 타입 대조
2. 로그인·토큰 갱신·로그아웃 쿠키 계약 연결
3. Mock gateway를 유지한 채 HTTP gateway 계약 테스트 작성
4. `NEXT_PUBLIC_DATA_SOURCE=api`로 전환
5. 로딩·빈 상태·도메인 오류·401·403·404·5xx 확인
6. 캐시 무효화와 재요청 범위 검증
7. 실제 PDF Content-Type, 파일명, 다운로드 권한 검증
8. 학생/학부모 권한으로 상대 앱 endpoint 접근 차단 검증

## 자동 검증

- `pnpm typecheck`: DTO·domain·컴포넌트 타입 계약
- `pnpm lint`: Next.js 및 React 정적 검사
- `pnpm test`: Vitest + MSW API 계약·adapter·날짜 테스트
- `pnpm test:e2e`: Playwright 학생 학습 진입·학부모 상담 진입 핵심 흐름
