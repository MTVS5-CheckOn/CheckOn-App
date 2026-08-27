# PR10 — 프론트 실제 API 연결 (`CheckOn-App`)

**실행 기계: 맥 (A = macOS) · 🔴 저장소가 다르다 — `CheckOn-App` (Next.js). 백엔드 저장소가 아니다.**
**브랜치: `feature/member/pr10-api-wiring`**
**선행: PR9 까지 백엔드 merge 완료. 백엔드가 아직이면 `member-api.yaml` 기반 MSW 스텁으로 진행하고, 그 사실을 완료 보고 맨 위에 적는다.**

---

> 🔴 **이 PR 만 다른 저장소에서 돈다.** 작업 대상은 `~/AI/checkon-app` (Next.js 프론트)다.
> 참조 문서는 **백엔드 저장소**에 있으니 절대 경로로 읽는다:
>
> ```
> ~/AI/CheckOn-backend/docs/member-backend/01_endpoint_branch_matrix.md   ← 분기표 (필독)
> ~/AI/CheckOn-backend/docs/member-backend/member-api.yaml                ← API 계약 정본
> ~/AI/CheckOn-backend/docs/member-backend/00_member_backend_design.md    ← 설계 §13 프론트 연결 작업표
> ```
>
> - **분기표**: 각 표의 「클라이언트」 열이 이 PR 의 핸들러 명세다. MSW 픽스처는 표의 행 수만큼 만든다.
> - 🔴 `03_backend_code_rules.md`(Java 규칙)와 `02_regression_guard.md`(백엔드 회귀)는 **이 PR 에 적용되지 않는다.** 프론트는 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` 가 게이트다.
> - 🔴 백엔드 저장소를 **한 파일도 건드리지 않는다.**


## 0. 왜 하나

프론트는 **API 모드로 켜면 로그인 화면 밖으로 나가지 못한다.** `src/proxy.ts:12` 가 `checkon_session` 쿠키를 찾는데 백엔드는 그 이름의 쿠키를 발급하지 않는다(`CHECKON_REFRESH`, Path `/api/v1/auth` — 설계 정본 §4-2). 나가더라도 요청에 토큰이 붙지 않는다. `registerAccessTokenReader`(`src/lib/api/session.ts:7`)는 **정의만 되고 호출처가 0곳**이라 `getAccessToken()` 은 항상 `null` 이다.

그리고 경로가 전부 틀렸다. 프론트 리터럴은 `/v1/students/...`·`/v1/parents/...` 인데 백엔드는 `/member/students/...`·`/member/parents/...` 다(`member-api.yaml:136` 이하). base URL 도 `.env.example:2` 가 `/api` 로 끝나 `/api/v1` 이 아니다.

마지막으로 **채점이 클라이언트에 있다.** `submit-confirmation.tsx:30` 이 `question.correctAnswer` 로 정답 수를 세고 `:36` 이 `52/61/68` 을 하드코딩한다. 서버가 채점하는 순간 이 코드는 거짓말을 시작한다.

이 PR 은 화면을 새로 만들지 않는다. **경계(gateway·client·proxy·store)만 바꾸고 mock 은 남긴다.**

## 작업 0 — 🔴 전수 (고치기 전에 현재 값을 잰다)

명령은 전부 `CheckOn-App` 저장소 루트에서 실행한다.

| # | 명령 | 기대 | 실측 |
|---|---|---|---|
| 1 | `git rev-parse --short HEAD && git status --short` | `7a7db5d` 이후. 🔴 **미커밋 변경 8개 + `docs/student-parent-backend-api-integration-design.md` 미추적**이 이미 있다 — 내 diff 와 섞이지 않게 먼저 stash 또는 별도 커밋 | |
| 2 | `pnpm typecheck; echo "exit=$?"` | `exit=0` | |
| 3 | `pnpm lint; echo "exit=$?"` | `exit=0` | |
| 4 | `pnpm test; echo "exit=$?"` | `exit=0`. 🔴 **실행된 테스트 파일 3개 / 테스트 수도 함께 적어라** (`client.test.ts`, `adapters.test.ts`, `date.test.ts`) | |
| 5 | `pnpm build; echo "exit=$?"` | `exit=0` | |
| 6 | `grep -rn '/v1/' src --include=*.ts --include=*.tsx \| wc -l` | `40` (gateway 리터럴 36 + `client.test.ts` 2 + auth 관련) | |
| 7 | `grep -rn "registerAccessTokenReader" src e2e` | **1건** (`src/lib/api/session.ts:7` 정의뿐). 🔴 2건 이상이면 전제가 이미 다르다 | |
| 8 | `grep -rn "PageResponse\|MutationStatus" src e2e` | 각 1건 — `src/lib/api/types.ts:4`·`:6` 정의뿐, 사용처 0 | |
| 9 | `grep -rn "from \"zod\"" src \| wc -l` | `2` (`student/auth/schema.ts:1`, `parent/consultations/new-consultation-form.tsx:7` — 폼 검증 전용. API 응답 검증엔 0건) | |
| 10 | `grep -rn "msw" src e2e vitest.setup.ts` | `src/lib/api/client.test.ts` 1파일뿐 | |
| 11 | `grep -n "checkon_session" src/proxy.ts` | `12:  const session = request.cookies.get("checkon_session");` | |
| 12 | `sed -n '29,40p' src/features/student/quiz/submit-confirmation.tsx` | `correctCount` 계산 · `trend` 에 `52/61/68` · `saveRecord(record)` 가 보인다 | |
| 13 | `sed -n '11,14p' src/features/student/quiz/api.ts` | `QuizGateway` 가 `get` / `submit` 2개뿐 | |
| 14 | `ls src/features/student/*/dto.ts src/features/student/*/adapters.ts 2>&1` | **No such file** — 학생 쪽엔 DTO/adapter 층이 없다 | |

🔴 **전제가 거짓이면 멈추지 말고 계속하되, 반증을 완료 보고 맨 위에 적어라.**
🔴 #2~#5 의 값은 **기준선**이다. 본 작업이 끝난 뒤 같은 4개가 전부 `exit=0` 이어야 한다.

## 본 작업

### 1. 환경 변수 — `.env.local` 신설 + `.env.example` 갱신

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_RESPONSE_MODE=wrapped
NEXT_PUBLIC_API_TIMEOUT_MS=10000
```

`.env.local` 은 커밋하지 않는다. `.env.example` 은 위 값으로 갱신하되 `NEXT_PUBLIC_DATA_SOURCE=mock` 을 기본으로 남긴다 — 아무 설정 없이 `pnpm dev` 가 돌아야 한다.

🔴 `auto` 를 쓰지 마라. `client.ts:22` 의 `auto` 분기는 `meta` 유무와 키 개수로 추측한다 — `{data}` 만 오는 응답과 `data` 라는 필드를 가진 payload 를 구분하지 못한다. 백엔드 성공 body 는 항상 `{ "data": ... }` 다(`member-api.yaml:9-10`).

### 2. 경로 접두 교체

리터럴이 있는 파일은 7개다. 전수 #6 의 40건을 아래 표대로 옮긴다.

| 파일 | 현재 | 바꿀 것 |
|---|---|---|
| `src/features/auth/api.ts:19` | `/v1/auth/login` | 🔴 **role 로 갈린다 (MB-01)** — 학생 `/member/auth/students/login` (body `{studentPublicId, password}`) · 학부모 `/auth/login` (body `{email, password}`). 응답 `data` 모양은 **같다** |
| `src/features/auth/api.ts:20` | `/v1/auth/${role}/signup` | `/member/auth/students/sign-up` · `/member/auth/parents/sign-up` (문자열 조립 금지 — role 별 분기) |
| `src/features/auth/api.ts:21` | `/v1/auth/logout` | `/auth/logout` |
| `src/features/auth/api.ts:22` | `/v1/auth/student/activation-status` | `/member/auth/students/activation-status` |
| `src/features/student/home/api.ts:8` | `/v1/students/me/home` | `/member/students/me/home` |
| `src/features/student/worksheets/api.ts:17-18` | `/v1/students/me/worksheets*` | `/member/students/me/worksheets*` |
| `src/features/student/records/api.ts:25-26` | `/v1/students/me/learning-records*` | `/member/students/me/learning-records*` |
| `src/features/student/questions/api.ts:16-18` | `/v1/students/me/questions*` | `/member/students/me/questions*`. 🔴 `follow-ups` → **`messages`** (`member-api.yaml:468`) |
| `src/features/student/profile/api.ts:24-27` | `/v1/students/me/profile*` | `/member/students/me/profile`. 🔴 `profile/notifications` → **`profile/notification-preference`** (`member-api.yaml:515`) |
| `src/features/parent/api/gateway.ts:63-80` | `/v1/parents/...` 18건 | `/member/parents/...`. 🔴 `:70` 도 `notification-preference`(`member-api.yaml:1048`) |

🔴 **`/member/auth/session`(`member-api.yaml:100`) 을 쓰는 gateway 가 아직 없다.** `AuthGateway` 에 `getSession()` 을 추가하고 `AppProviders` 부팅 시 1회 호출한다 — 아래 4에서 쓴다.

🔴 신규 엔드포인트 3개도 이 PR 에서 붙인다: `/member/parents/me/children/{studentId}/analysis/weaknesses/{areaTag}/{typeTag}`(:778), `/member/parents/me/children/{studentId}/reports/{reportId}/file-access`(:859), `/member/parents/me/invitations/verification`(:1064).

### 3. 🔴 `src/proxy.ts` — 쿠키 판정 제거

`:12-13` 의 `request.cookies.get("checkon_session")` 분기를 지운다. `PUBLIC_PATHS`(`:3-6`)와 `isPublicPath`(`:8`)는 그대로 두고, 인증 판정은 클라이언트로 옮긴다 — 보호 경로 진입 시 `AppProviders` 가 메모리 토큰 부재를 보고 `/member/auth/session` 을 시도하고, 401 이면 기존 `notifyUnauthorized()` 핸들러(`providers.tsx:13-16`)가 로그인으로 보낸다.

🔴 미들웨어에서 쿠키를 **읽지 마라.** `CHECKON_REFRESH` 는 Path `/api/v1/auth` 라 Next 라우트(`/student/*`·`/parent/*`)에 애초에 전송되지 않는다. 쿠키 이름만 바꿔서는 고쳐지지 않는다.

### 4. 🔴 메모리 전용 token store + `registerAccessTokenReader` 등록

새 파일 `src/lib/api/token-store.ts` — 모듈 스코프 변수 하나(`let accessToken: string | null`)와 `setAccessToken`/`readAccessToken`. 🔴 `localStorage`·`sessionStorage`·쿠키 금지. XSS 노출면을 만들지 않는다.

`src/app/providers.tsx` 의 `AppProviders` 안에서 `useEffect(() => registerAccessTokenReader(readAccessToken), [])` 로 등록한다 — 기존 `registerUnauthorizedHandler` 등록(`:13-16`) 바로 옆이다. 로그인 성공 시 `setAccessToken(response.accessToken)`, 로그아웃·refresh 실패 시 `setAccessToken(null)` + `queryClient.clear()`.

🔴 `AuthSession` 타입(`src/features/auth/api.ts:8`)이 `{userId, role, accountStatus}` 라 **토큰 필드가 아예 없다.** 실제 응답은 `{ accessToken, accessTokenExpiresAt, account: { id, role, email, teacherProfileId } }` 다(설계 정본 §4-2). `teacherProfileId` 는 학생·학부모면 `null` 로 온다 — nullable 로 받는다.

### 5. 🔴 single-flight refresh

`src/lib/api/refresh.ts` 신설. `client.ts:48-53` 의 401 처리(현재 `notifyUnauthorized()` 호출뿐)를 교체한다:

1. 401 수신 → 모듈 스코프 `let inflight: Promise<boolean> | null` 확인.
2. `inflight` 가 있으면 그것을 await. 없으면 `POST /auth/refresh`(`credentials: "include"`)를 1회 시작해 `inflight` 에 넣고 `finally` 에서 비운다.
3. 성공 → `setAccessToken(new)` → **원 요청을 최대 1회만** 재시도.
4. 실패 → `setAccessToken(null)` + `queryClient.clear()` + `notifyUnauthorized()`.

🔴 재시도는 **1회 상한**. 재시도한 요청이 또 401 이면 refresh 를 다시 부르지 않는다(무한 루프). 🔴 refresh 요청 자체는 이 인터셉터를 타지 않게 별도 fetch 로 보낸다.

### 6. 🔴 로컬 채점 제거

`src/features/student/quiz/submit-confirmation.tsx:29-40` 의 `finish()` 는 API 모드에서 **제출 mutation 호출 → `submit()` → 결과 화면 이동** 세 줄로 줄인다.

지울 것: `:30` `correctCount` 계산 · `:32-38` `record` 조립 전체 · `:36` 하드코딩 `trend`(`52`/`61`/`68`) · `:39` `saveRecord(record)` · `:11`·`:20` 의 `useLearningRecordStore` import 와 사용.

🔴 `useLearningRecordStore`(`src/features/student/records/learning-record.store.ts`) 자체는 **mock 모드가 쓰므로 삭제하지 않는다.** API 모드에서 `saveRecord` 가 호출되지 않는 것만 보장하고, mock gateway 쪽에서 계속 쓴다.

### 7. Quiz Gateway 확장

`src/features/student/quiz/api.ts:11-14` 의 `QuizGateway` 를 5개로:

| 메서드 | 엔드포인트 | yaml |
|---|---|---|
| `startAttempt(assignmentId)` | `POST /member/students/me/worksheets/{assignmentId}/attempts` | `:204` — 🔴 재개는 **200**, 신규는 **201**. 둘 다 성공으로 처리 |
| `getAttempt(attemptId)` | `GET /member/students/me/attempts/{attemptId}` | `:238` — `status` 로 `AttemptInProgress` / `AttemptResult` 분기 |
| `saveProgress(attemptId, req)` | `PATCH .../progress` | `:263` — `{baseVersion, clientSequence, answers?, activeElapsedSecondsDelta?}` |
| `submit(attemptId, req)` | `POST .../submission` | `:294` — `Idempotency-Key` **필수** |
| `getResult(attemptId)` | `GET .../result` | `:331` — 미제출 attempt 는 404 |

🔴 `AttemptInProgress`(`member-api.yaml:1424`)에는 `correctAnswer`·`explanation`·`correct` 가 **없다.** 현재 `QuizQuestion` 은 그 둘을 갖고 있다 — 풀이 화면 타입에서 제거하고 결과 화면용 `AttemptItemResult` 타입에만 둔다. 타입으로 갈라야 화면이 없는 값을 읽지 못한다.

🔴 `answers` 키가 `q1` 같은 문자열에서 **`itemId`(UUID)** 로 바뀐다. `src/stores/quiz-session.store.ts:8-9` 의 키도 같이 바꾸고 `persist` 이름(`:27` `checkon-quiz-session`)을 `-v2` 로 올려 옛 키가 섞이지 않게 한다.

🔴 `activeElapsedSecondsDelta` 는 항목당 **0~600** 이다(`member-api.yaml:1487`). 초과를 조용히 깎지 말고 600 으로 자르되 **왜 잘랐는지 주석**을 남기고 남은 delta 는 다음 요청으로 넘긴다.

### 8. 결과 화면 단일 출처

`src/features/student/quiz/quiz-results.tsx:19-26` 은 지금 세 곳에서 조립한다 — `useLearningRecordStore.submittedRecords`(`:19`), `useLearningRecordsQuery`(`:17`), `useQuizSessionStore`(`:18`). API 모드에서는 **`getResult(attemptId)` 하나만** 본다.

- `:22-23` 의 `resolvedAnswers`/`resolvedElapsed` 조립 제거 — 서버 `AttemptItemResult` 의 `selectedNo`·`correctNo`·`correct`·`explanation`·`activeElapsedSeconds` 를 그대로 쓴다.
- `:30-32` 의 `correctCount`/`incorrectCount` 재계산 제거 — 서버 `correctCount`·`itemCount`·`accuracyRate` 사용. 🔴 `accuracyRate` 는 **0~1** 이다(`member-api.yaml:14`). `×100` 은 표시 계층에서 한 번만.
- 🔴 화면에 `env.dataSource` 분기를 두지 마라. mock gateway 도 `getResult` 를 같은 모양으로 구현하면 화면은 분기가 필요 없고, 그래야 mock/HTTP 에 같은 contract test 를 돌릴 수 있다.

### 9. Idempotency-Key

`src/lib/api/idempotency.ts` 신설: `crypto.randomUUID()` 를 감싼 얇은 함수 + 주입 가능한 생성기(테스트용). 제출 mutation 은 `mutationFn` 안이 아니라 **mutation 시작 시점에 1회** 키를 만들어 `useRef` 에 잡아두고 재시도(사용자 재클릭·`retry`)에서 같은 값을 보낸다. 성공하면 ref 를 비운다.

🔴 `mutationFn` 안에서 만들면 재시도마다 새 키가 나가 서버가 **두 번 채점한다.** `submitMutation.isPending` 중 버튼 `disabled`(`submit-confirmation.tsx:48`)는 유지하되 그것만으로는 부족하다 — 키가 방어선이다.

필요한 곳: 제출(`:294` 필수), attempt 시작(`:204`), 자녀 등록(`:593`), 초대 등록(`:560`·`:1093`), 상담 생성(`:884`), file-access(`:859`).

### 10. Parent DTO 분리

`src/features/parent/api/dto.ts:1-9` 는 지금 전부 domain type alias 다(`export type ParentRecordDto = ParentRecord`). 실제 wire 모양으로 다시 쓴다. 확인된 불일치:

| 필드 | 프론트 | yaml |
|---|---|---|
| 상담 `status` | `"answered"` 소문자 (`consultation.store.ts:19`) | `SUBMITTED\|REVIEWING\|ANSWERED\|CLOSED\|CANCELLED` (`:1900`) |
| 상담 `context.type` | `"report"` 소문자 | `RECORD\|ANALYSIS\|REPORT` (`:1884`) |
| 상담 요청 | `{studentId, content, responseMethod:"app", context?}` (`parent/api/types.ts:7-12`) | `{studentId, teacherId, content, context?}` — 🔴 `teacherId` **필수**, `responseMethod` **없음** (`:1876`) |
| `createdAt` | `"2026.08.20 10:14"` 문자열 | RFC 3339 UTC instant (`:12`) |
| 강사 | `{id, name, academy}` (`parent/model/types.ts:114`) | `TeacherSummary {teacherId, displayName, subject}` (`:1278`) |
| PDF | `{url, pageImageBasePath, pageLabels}` (`parent/model/types.ts:105`) | `ReportFileAccess {url, expiresAt, contentType, checksum, sizeBytes, pageCount}` (`:1860`) |

adapter(`src/features/parent/api/adapters.ts`)가 이 변환을 전부 흡수한다. 🔴 대소문자 enum 변환은 adapter 안 **map 상수 하나**로 하고, 모르는 값은 `throw` 하지 말고 `"UNKNOWN"` 으로 떨어뜨린 뒤 화면이 중립 표시를 하게 한다 — 서버가 enum 을 추가했을 때 앱이 죽지 않아야 한다.

### 11. 🔴 `academyName` — 지어내지 않는다

`TeacherSummary`(`member-api.yaml:1278-1289`)에 `academyName` 이 **없다.** 백엔드 `teacher_profiles` 에 원본이 없기 때문이다(설계 정본 부록 A, `V4:54-74`). `subject` 도 현재 항상 `null` 이다.

프론트에서 `academy` 를 쓰는 6곳(`student/profile/types.ts:3`, `student/profile/profile.store.ts:6`, `parent/shared/parent.store.ts:7`, `parent/model/types.ts:114`, `parent/api/types.ts:6`, 각 화면)에서 **필드를 지운다.** 지우기 어려우면 `academy: null` 로 두고 화면에서 해당 줄을 렌더하지 않는다. 🔴 mock 값(`"한울국어학원"`)을 API 모드에서 흘려보내지 마라.

### 12. Zod 런타임 검증

`src/features/*/api/schemas.ts` 를 gateway 단위로 만든다. `apiRequest` 반환 직후 `schema.safeParse`, 실패하면 `new ApiError(..., 502, "INVALID_API_RESPONSE", parsed.error.issues)`. 검증은 gateway 안에서만 하고 화면은 파싱된 domain type 만 본다.

🔴 코드 문자열은 `INVALID_API_RESPONSE` 하나로 통일한다. `client.ts:19` 의 기존 `INVALID_API_ENVELOPE` 는 envelope 모양 위반 전용으로 남긴다 — 둘은 다른 실패다.
🔴 `.strict()` 를 쓰지 마라. 백엔드가 필드를 **추가**하면 앱 전체가 502 가 된다. 기본 strip 동작을 쓴다.

### 13. cursor pagination

`src/lib/api/types.ts:4` 의 `PageResponse<T>`(`page`/`size`/`totalElements`/`totalPages`, 사용처 0)를 삭제하고 `CursorPage<T> = { items: T[]; nextCursor: string | null; hasNext: boolean }` 로 교체한다(`member-api.yaml:1259` 와 동일). `limit` 최대 50, 초과는 서버가 **400 으로 거절**한다(`:1156-1161`) — 프론트에서 51 이상을 보내지 않는다.

`src/lib/api/query-keys.ts` 도 고친다. 지금은 `records(month?)`(`:5`)만 파라미터를 받고 나머지는 필터·정렬·cursor 를 키에 넣지 않아 서로 다른 페이지가 같은 캐시를 덮어쓴다. 목록 키에 `{cursor, limit, ...filters, sort}` 를 포함시키고 무한 목록은 `useInfiniteQuery` 로 옮긴다.

### 14. PDF 전용 Gateway

`src/features/parent/api/file-gateway.ts` 신설. JSON `apiRequest` 를 쓰지 않는다. `POST .../reports/{reportId}/file-access`(`Idempotency-Key` 포함) → `ReportFileAccess` → 그 `url` 을 별도 `fetch`. `src/features/parent/reports/parent-reports.tsx:74` 의 `report.pdf` 직접 참조를 이 호출로 바꾼다.

🔴 `url` 은 수명 짧은 signed URL 이다 — **캐시하지 마라.** `expiresAt` 이 지나면 재발급한다. 🔴 그 fetch 에 `Authorization` 헤더를 붙이지 않는다(signed URL 이 이미 권한이다).

### 15. 학생 DTO/adapter 층

`src/features/student/{home,worksheets,records,questions,profile,quiz}/` 각각에 `dto.ts` + `adapters.ts` 를 만든다(전수 #14 — 지금은 없다). 현재 이 gateway 들은 raw 응답을 domain 으로 **캐스팅만** 한다: `student/home/api.ts:8` 은 응답을 그대로 반환하고 `StudentHomeResponse`(`:5`)는 `typeof studentHomeData` — **mock 픽스처가 타입의 원본이다.**

학부모 쪽 `adapters.ts:4-9` 와 같은 형태로 DTO → Zod → adapter → domain. 🔴 `typeof mockData` 를 타입 원본으로 삼는 구조를 없애는 게 이 단계의 목적이다.

### 16. 🔴 mock Gateway 는 제거하지 않는다

7개 gateway 전부 `env.dataSource === "api" ? http : mock` 삼항을 유지한다. mock 도 확장 인터페이스(`startAttempt`/`getResult`/cursor page/`getSession`)를 **같은 모양으로** 구현한다.

`src/lib/api/gateway-contract.ts` 에 gateway 하나당 suite 함수(`runQuizGatewayContract(name, factory)` 형태)를 만들고, 테스트 파일에서 mock 과 HTTP(MSW) 양쪽에 **같은 함수를 두 번** 호출한다.

## 검사

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
echo "exit=$?"
```

🔴 **`pnpm test` 는 필터가 0건을 매치해도 종료 코드 0 을 낼 수 있다.** 출력의 `Test Files N passed` / `Tests M passed` 숫자를 함께 적어라. 전수 #4 의 3파일에서 몇 개로 늘었는지가 증거다. 파일 필터를 쓸 때는 `pnpm test -- --run <path>` 로 경로를 직접 준다.

### MSW contract 표 (gateway 마다 전부)

| 시나리오 | MSW 응답 | 기대 |
|---|---|---|
| 정상 | `200 {data:{...}}` | domain 값 반환, Zod 통과 |
| 빈 목록 | `200 {data:{items:[],nextCursor:null,hasNext:false}}` | 빈 배열, 오류 아님 |
| 스키마 위반 | `200 {data:{}}` (필수 필드 결측) | `INVALID_API_RESPONSE`, status 502 |
| envelope 위반 | `200 {...}` (`data` 없음) | `INVALID_API_ENVELOPE` |
| 400 / 429 | `{error:{code:"INVALID_REQUEST"}}` / `RATE_LIMITED` | code 보존, **재시도 없음** |
| 401 → refresh 성공 | 첫 401, refresh 200, 재요청 200 | 🔴 refresh **1회**, 원 요청 재시도 **1회** |
| 401 → refresh 401 | 둘 다 401 | 토큰 `null`, cache clear, `notifyUnauthorized` 1회 |
| 동시 401 ×5 | 5개 query 동시 실패 | 🔴 refresh 요청 **정확히 1회** |
| 403 `STUDENT_ACTIVATION_REQUIRED` | | 대기 화면 이동 |
| 404 | | `null` 반환 계약인 곳은 `null`, 그 외 ApiError |
| 409 `IDEMPOTENCY_CONFLICT` / `REVISION_CONFLICT` | | 전자는 재시도 금지, 후자는 attempt 재조회 후 병합 |
| 5xx | | `providers.tsx:19` 정책대로 1회 재시도 |
| timeout | MSW delay > 10s | `REQUEST_TIMEOUT`, status 408 |
| 제출 이중 클릭 | 같은 mutation 2회 | 🔴 `Idempotency-Key` 헤더 값이 **동일** |

같은 표를 mock gateway 에도 적용한다(네트워크 관련 행은 mock 에서 skip 하되 **skip 사유를 테스트에 적는다** — 조용히 빼지 마라).

### Playwright E2E (`e2e/`)

기존 `e2e/critical-flows.spec.ts` 2건은 mock 모드용이다 — 지우지 말고 `test.describe` 로 mock/api 를 나눈다. API 모드 시나리오는 MSW 대신 백엔드 스텁 또는 `page.route()` 로 고정한다.

1. **학생**: 가입 → `PENDING_PARENT_LINK` 대기 → 활성화 → 홈 → attempt 시작(재개 포함) → 답 선택 → autosave → 이탈 후 복귀 시 답 복원 → 제출 → 결과에 서버 `correctCount` 표시 → 학습기록 반영
2. **학부모**: 가입 → 자녀 등록 → 이미 연결된 학생 재시도 시 `CHILD_ALREADY_LINKED` → 초대 등록 → 분석 → 보고서 → PDF 열람(signed URL) → 상담 요청 → 강사 답변
3. **제출 이중 클릭**: 빠르게 2회 → `POST .../submission` 이 **1건**이거나, 2건이면 `Idempotency-Key` 동일
4. **refresh race**: 홈 진입 시 3개 query 동시 401 → refresh 네트워크 요청 **1건**
5. **proxy 회귀**: `NEXT_PUBLIC_DATA_SOURCE=api` 로 `/student/records` 직접 진입 → 🔴 로그인으로 튀지 **않는다**

## 🔴 고의 파괴 — 검사가 진짜 잡는지

각 항목 ① 파괴 → ② **적용 확인**(grep/diff 로 눈으로) → ③ **종료 코드**로 red 확인 → ④ `git checkout -- <path>` 원복 후 green 재확인.

| # | 파괴 | ② 적용 확인 | ③ 기대 red |
|---|---|---|---|
| 1 | `gateway-contract.ts` 의 suite 를 mock 쪽에서만 부르고 HTTP 등록 줄을 지운다 | `grep -c runQuizGatewayContract src/features/student/quiz/*.test.ts` → 1 | 🔴 **테스트 수가 줄지만 exit=0 이다.** 이 파괴는 `pnpm test` 출력의 `Tests M passed` 감소로만 잡힌다 — 그래서 실행 테스트 수 기록이 필수다. 수 비교 실패를 red 로 삼는다 |
| 2 | `AttemptResult` Zod 스키마에서 `correctCount` 를 뺀다 | `grep -n correctCount src/features/student/quiz/schemas.ts` → 0건 | 결과 화면 contract test 실패. `pnpm test; echo exit=$?` non-zero |
| 3 | `Idempotency-Key` 를 `mutationFn` 안에서 `crypto.randomUUID()` 로 매번 생성 | `git diff src/features/student/quiz/queries.ts` | "이중 클릭 시 헤더 동일" 테스트 실패 |
| 4 | `submit-confirmation.tsx` 에 로컬 `correctCount` 계산 + `saveRecord` 를 되살린다 | `grep -n "saveRecord\|correctAnswer" src/features/student/quiz/submit-confirmation.tsx` → 2건 이상 | 🔴 "API 모드에서 `learning-record.store` 가 쓰이지 않는다" 단언 실패. 이 테스트가 없으면 지금 만들어라 |
| 5 | refresh 의 `inflight` 공유를 제거(매 401 마다 새 Promise) | `grep -n inflight src/lib/api/refresh.ts` → 0건 | "동시 401 ×5 → refresh 1회" 실패 |
| 6 | `proxy.ts` 에 `checkon_session` 판정을 되살린다 | `grep -n checkon_session src/proxy.ts` → 1건 | E2E #5 실패 (`/student/records` 가 로그인으로 리다이렉트). `pnpm test:e2e; echo exit=$?` non-zero |
| 7 | `.env.local` 의 `NEXT_PUBLIC_API_RESPONSE_MODE` 를 `auto` 로 | `grep -n RESPONSE_MODE .env.local` | envelope contract test 실패 |
| 8 | Zod 스키마에 `.strict()` 를 붙이고 MSW 응답에 필드 하나 추가 | `grep -c "\.strict()" src/features/**/schemas.ts` | 🔴 정상 시나리오가 502 로 실패 — `.strict()` 를 쓰면 안 되는 이유가 테스트로 남는다 |

## 🔴 분기 커버리지 (필수)

`01_endpoint_branch_matrix.md` 에서 이 PR 이 만드는 엔드포인트의 표를 연다.

1. 표의 **행 하나 = 통합테스트 하나**. 행 수와 테스트 수가 같아야 한다.
2. 구현하다 표에 없는 분기가 나오면 🔴 **코드를 먼저 쓰지 말고 표를 고친 뒤** 구현한다.
3. §0 공통 규칙(인증·역할·검증·부재·충돌·상태전이·의존실패·데이터없음 8분류, 멱등 3분기, 목록 4분기)은 표에 다시 적혀 있지 않다. **그래도 테스트는 만든다.**
4. 🔴 `⑧ 데이터 없음`은 오류가 아니다. `200` + `status` 로 내려간다. 0 으로 채우지 마라.
5. 완료 보고에 **행 수 / 테스트 수 / 미구현 행(있으면 사유)** 을 적는다.

## 🔴 회귀 증명 (push 전)

`02_regression_guard.md` §4 의 `scripts/member-no-regression.sh` 를 돌린다.

- R1 기존 테스트 green · R2 개수 감소 없음 · **R3 기존 정책 diff 0** · R4 스키마 · R5 엔드포인트 · R6 금지 SQL · R7 무접촉 · R8 기존 패키지
- 🔴 하나라도 non-zero 면 **push 하지 않는다.** 승우님 테스트를 고쳐서 통과시키는 것은 금지다.
- 최신 `origin/dev` 를 **`git merge origin/dev`**(🔴 rebase 아님 — 팀 관행) 한 뒤 **다시** 돌린다.

## 🔴 무접촉 — 건드리면 안 되는 것

```
🔴 저장소 전체
  ~/BackEnd/CheckOn-backend/**          ← 이 PR 은 백엔드를 한 줄도 안 고친다
  checkon-kafka-adapter/**
  C:\PROJECT\CheckOn-AI\**

CheckOn-App 안에서
  src/app/**/page.tsx                   ← 라우팅·페이지 구조 변경 금지 (proxy.ts 는 예외)
  src/components/**                     ← UI 프리미티브
  src/app/globals.css · src/app/fonts/**
  next.config.ts · postcss.config.mjs · eslint.config.mjs · tsconfig.json
  package.json                          ← 🔴 의존성 추가 금지. zod·msw·zustand·react-query 전부 이미 있다
  pnpm-lock.yaml
  docs/**                               ← 체크리스트 문서는 별도 PR
  AGENTS.md · CLAUDE.md                 ← next dev 가 재생성하는 블록이 있다
  .env.local                            ← 만들되 커밋하지 않는다
```

전수 #1 의 **미커밋 8파일**(`parent/analysis`·`parent/api`·`parent/home`·`parent/model`·`parent/records`·`parent/reports`·`parent/shared`)은 내 작업 범위와 겹친다. 🔴 먼저 별도 커밋으로 분리하고 시작해라. 섞이면 `git status` 로 무접촉을 증명할 수 없다.

## 🔴 중단 규칙 — 어떤 조건에서 멈추고 보고하나

1. 전수 #2~#5 중 하나라도 기준선이 이미 non-zero → 즉시 중단. 내 변경이 깬 것과 구분할 수 없다.
2. 전수 #7 이 2건 이상(`registerAccessTokenReader` 호출처가 이미 있다) → 중단. 토큰 저장소 설계 전제가 다르다.
3. `POST /auth/refresh` 가 `CHECKON_REFRESH` 쿠키를 받지 못한다(cross-origin 에서 쿠키가 안 붙는다) → 중단. `credentials: "include"` 만으로는 안 되고 백엔드 CORS `allowCredentials` + 정확한 origin 이 필요하다. **프론트에서 우회하지 마라.**
4. `member-api.yaml` 과 실제 백엔드 응답이 다르다 → 중단하고 **양쪽을 전부** 보고. yaml 에 맞춰 프론트를 고치지도, 백엔드 응답에 맞춰 yaml 을 고치지도 마라.
5. 화면에 필요한 필드가 API 에 없다(`academyName` 처럼) → 🔴 mock 값으로 메우지 말고 중단·보고. **모르면 `null`.**
6. `package.json` 에 의존성을 추가해야 할 것 같다 → 중단. 이미 있는 것으로 안 되는 이유를 보고.
7. mock gateway 를 지워야 확장 인터페이스가 맞는다 → 중단. 인터페이스 설계가 틀린 것이다.
8. 상담 `teacherId` 처럼 **화면이 수집하지 않는 필수 입력**이 발견됐다 → 중단·보고. 임의 기본값(첫 강사 등)을 넣지 마라.

## 완료 보고 양식

```
## 반증 (전제가 틀렸다면 여기 먼저)
- 

## 전수 실측
| # | 명령 | 기대 | 실측 | 일치 |
...(14건)

## 만든 것
- 신규 파일 목록 (각 1줄)
- 수정 파일 목록 (각 1줄 + 왜)

## 검사 결과
- typecheck / lint / build : 각 종료 코드
- pnpm test      : 종료 코드 ? / Test Files ? / Tests ?  (기준선: Test Files 3 / Tests ?)
- pnpm test:e2e  : 종료 코드 ? / 시나리오 5건 개별 결과

## MSW contract 표 결과
| 시나리오 | mock | HTTP | 비고 |
(14행 × gateway. skip 은 사유 필수)

## 고의 파괴 결과
| # | 파괴 | 적용 확인 | 기대 red | 실제 종료코드 | 원복 후 green |
...(8건)

## 무접촉 확인
- git status --short 전문:
- git diff --stat 전문:
- 🔴 CheckOn-backend / kafka-adapter / CheckOn-AI 를 연 적 있는가: 없음/있음(무엇)

## API 실측 대조
- member-api.yaml 과 실제 응답이 다른 지점: (없으면 "없음")
- 백엔드 스텁으로 대체한 엔드포인트:

## 남은 것 / 미확정
- academy/academyName 처리 결과 (제거 / null 표시 / 미처리)
- 설계 정본 §17 미확정 항목 중 프론트가 임시 처리한 것
```

## 체크리스트

- [ ] 분기표 각 표의 「클라이언트」 열이 MSW 핸들러로 1:1 구현됐다
- [ ] 🔴 `~/AI/CheckOn-backend` 에 `git status --short` 로 변경 0건 (백엔드 무접촉)
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` 전부 exit 0, 실행된 테스트 수 > 0
- [ ] 전수 14건을 **고치기 전에** 실행했고 #2~#5 기준선을 기록했다
- [ ] `/v1/` 리터럴이 `src` 에서 0건이다 (`client.test.ts` 포함)
- [ ] 🔴 `registerAccessTokenReader` 가 `providers.tsx` 에서 호출된다
- [ ] 🔴 `localStorage`/`sessionStorage`/쿠키에 access token 을 쓰지 않는다
- [ ] 🔴 `proxy.ts` 에 `checkon_session` 문자열이 0회
- [ ] 🔴 `submit-confirmation.tsx` 에 `correctAnswer` 참조와 `saveRecord` 호출이 0회
- [ ] 하드코딩 `52`/`61`/`68` trend 가 0회
- [ ] 🔴 mock gateway 7개가 전부 남아 있고 확장 인터페이스를 구현한다
- [ ] 🔴 같은 contract suite 가 mock·HTTP 양쪽에서 돌고, **실행 테스트 수**로 증명했다
- [ ] `Idempotency-Key` 가 재시도 간 유지된다 (테스트로 단언)
- [ ] Zod 스키마에 `.strict()` 가 0회
- [ ] `PageResponse` 가 삭제되고 `CursorPage` 가 쓰인다
- [ ] queryKeys 목록 키에 cursor·필터·정렬이 들어간다
- [ ] `package.json` / `pnpm-lock.yaml` 무변경
- [ ] 고의 파괴 8건 전부 4단계, ②적용 확인 포함
- [ ] red 를 종료 코드로 확인했다
- [ ] 상한으로 자른 곳(`activeElapsedSecondsDelta` 600 등)에 **무엇을 왜 잘랐는지** 주석이 있다
- [ ] 모르는 값을 지어내지 않았다 (모르면 `null`)
