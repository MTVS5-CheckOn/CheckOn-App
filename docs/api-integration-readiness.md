# Check-On App API 연결 준비 명세

## 실행 모드

`.env.local`에서 데이터 소스만 바꾼다.

```env
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT_MS=10000
NEXT_PUBLIC_API_RESPONSE_MODE=auto
```

- `mock`: 현재 프론트 단독 개발·시연 모드
- `api`: gateway가 HTTP 구현을 사용하고 `proxy.ts`가 세션 쿠키를 검사하는 연동 모드
- 인증 세션은 최종적으로 백엔드가 발급한 HttpOnly `checkon_session` 쿠키를 사용한다.
- Bearer 토큰 방식이 확정되면 `registerAccessTokenReader`에 메모리 토큰 reader만 연결한다. 토큰을 localStorage에 저장하지 않는다.

## 계층 규칙

```text
page → feature component → query/mutation hook → gateway interface
                                              ├─ mock gateway
                                              └─ HTTP gateway → apiRequest
```

- React 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- 서버 데이터는 TanStack Query, 화면 전용 상태와 진행 중 세션은 Zustand에 둔다.
- API DTO와 화면 domain 타입은 `api/dto.ts`와 `api/adapters.ts`로 분리한다. 계약 변경은 adapter에서 흡수한다.
- API 오류는 `ApiError`의 `status`, `code`, `details`로 표준화한다.
- 모든 조회 화면은 loading, empty, error, retry 상태를 가져야 한다.

## 현재 준비된 학부모 endpoint

| 기능 | Method | 예상 경로 |
| --- | --- | --- |
| 홈 | GET | `/v1/parents/me/children/{studentId}/home` |
| 학습기록 목록 | GET | `/v1/parents/me/children/{studentId}/learning-records` |
| 학습기록 상세 | GET | `/v1/parents/me/children/{studentId}/learning-records/{recordId}` |
| 고급 분석 | GET | `/v1/parents/me/children/{studentId}/analysis` |
| 보고서 목록 | GET | `/v1/parents/me/children/{studentId}/reports` |
| 보고서 상세 | GET | `/v1/parents/me/children/{studentId}/reports/{reportId}` |
| 자녀 조회 | GET | `/v1/parents/me/children/verification?studentId={studentId}` |
| 자녀 등록 | POST | `/v1/parents/me/children` |
| 강사 초대 코드 | POST | `/v1/parents/me/invitations` |
| 내 정보 | GET | `/v1/parents/me/profile` |
| 알림 수신 설정 | PATCH | `/v1/parents/me/profile/notifications` |
| 알림 목록 | GET | `/v1/parents/me/notifications` |
| 알림 읽음 | POST | `/v1/parents/me/notifications/{notificationId}/read` |
| 전체 알림 읽음 | POST | `/v1/parents/me/notifications/read-all` |
| 상담 목록·상세 | GET | `/v1/parents/me/children/{studentId}/consultations`, `/v1/parents/me/children/{studentId}/consultations/{consultationId}` |
| 상담 요청 | POST | `/v1/parents/me/consultations` |
| 상담 취소 | POST | `/v1/parents/me/children/{studentId}/consultations/{consultationId}/cancellation` |

## 현재 준비된 학생 endpoint

| 기능 | Method | 예상 경로 |
| --- | --- | --- |
| 학습지 목록 | GET | `/v1/students/me/worksheets` |
| 학습지 상세 | GET | `/v1/students/me/worksheets/{worksheetId}` |
| 학습기록 목록 | GET | `/v1/students/me/learning-records` |
| 학습기록 상세 | GET | `/v1/students/me/learning-records/{recordId}` |
| 문제 풀이 데이터 | GET | `/v1/students/me/worksheets/{worksheetId}/quiz` |
| 답안 제출 | POST | `/v1/students/me/worksheets/{worksheetId}/submissions` |
| 질문 목록·상세 | GET | `/v1/students/me/questions`, `/v1/students/me/questions/{questionId}` |
| 질문 작성 | POST | `/v1/students/me/questions` |
| 추가 질문 | POST | `/v1/students/me/questions/{questionId}/follow-ups` |
| 내 정보 | GET | `/v1/students/me/profile` |
| 알림 수신 설정 | PATCH | `/v1/students/me/profile/notifications` |
| 초대 코드 조회·등록 | GET, POST | `/v1/students/me/invitations/verification`, `/v1/students/me/invitations` |
| 활성화 상태 확인 | GET | `/v1/auth/student/activation-status` |

로그인·회원가입·로그아웃은 `features/auth` gateway를 통해 `/v1/auth/*` 계약으로 분리했다. 현재 Zustand에는 답안 임시 저장, 타이머 등 서버 응답이 아닌 클라이언트 세션 상태만 남긴다. 질문 Mock 저장소는 mock gateway 내부 구현으로만 사용하며 UI에서는 query/mutation을 통해 접근한다.

## 합의가 필요한 오류 코드

- `STUDENT_NOT_FOUND`: 학생 ID 불일치
- `CHILD_ALREADY_LINKED`: 다른 학부모에게 이미 등록됨
- `INVITE_INVALID`: 유효하지 않은 초대 코드
- `INVITE_EXPIRED`: 만료된 초대 코드
- `INVITE_ALREADY_USED`: 이미 등록된 강사
- `REPORT_NOT_READY`: 보고서 준비 중
- `PDF_NOT_FOUND`: PDF 파일을 찾을 수 없음

HTTP 상태와 문구가 달라져도 컴포넌트는 `code`를 기준으로 상태 화면을 선택한다.

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
