/**
 * API 경로 단일 출처.
 *
 * 🔴 이 파일 밖에서 API 경로 문자열을 만들지 않는다.
 *
 * 왜 한 곳에 모으는가 — 백엔드 보안 체인이 경로 접두로 갈린다.
 * `MemberSecurityConfiguration`(@Order(0)) 은 `/api/v1/member/**` 만 매칭하고,
 * 거기서 벗어난 `/api/v1/**` 는 `AccountSecurityConfiguration`(@Order(2)) 의
 * `hasRole("TEACHER")` 로 떨어진다. 즉 `member` 조각을 한 번이라도 빠뜨리면
 * 학생·학부모 요청이 404 가 아니라 **403** 을 받는다 — 원인을 찾기 어려운 실패다.
 *
 * base URL 은 계약의 `servers.url` 과 같은 `/api/v1` 이다(member-api.yaml:29-31).
 * 따라서 아래 경로는 전부 `/api/v1` 다음에 붙는 조각이다.
 */

/** 🔴 member 경계. 학생·학부모 API 는 전부 이 접두를 지나야 한다. */
const MEMBER = "/member";

/**
 * 🔴 member 가 만들지 않는 기존 계정 API (member-api.yaml:20-24).
 * 학부모 로그인·refresh·logout 이 여기 속한다. `member` 접두를 붙이면 안 된다.
 */
const LEGACY_AUTH = "/auth";

const STUDENT = `${MEMBER}/students/me`;
const PARENT = `${MEMBER}/parents/me`;

const encode = encodeURIComponent;

export const endpoints = {
  /** 기존 계정 API — member 접두 없음 */
  legacyAuth: {
    /** 학부모 로그인 (이메일 + 비밀번호). 학생은 쓰지 않는다. */
    login: () => `${LEGACY_AUTH}/login`,
    /** 🔴 refresh·logout 은 member 가 만들지 않는다. 학생 로그인 쿠키의 Path 가 /api/v1/auth 다. */
    refresh: () => `${LEGACY_AUTH}/refresh`,
    logout: () => `${LEGACY_AUTH}/logout`,
  },

  memberAuth: {
    studentSignUp: () => `${MEMBER}/auth/students/sign-up`,
    parentSignUp: () => `${MEMBER}/auth/parents/sign-up`,
    /** 학생 로그인 (공개 학생 ID + 비밀번호) */
    studentLogin: () => `${MEMBER}/auth/students/login`,
    /** 앱 bootstrap — 현재 계정·프로필·활성화 상태 */
    session: () => `${MEMBER}/auth/session`,
    studentActivationStatus: () => `${MEMBER}/auth/students/activation-status`,
  },

  student: {
    home: () => `${STUDENT}/home`,
    worksheets: () => `${STUDENT}/worksheets`,
    worksheet: (assignmentId: string) => `${STUDENT}/worksheets/${encode(assignmentId)}`,
    attempts: (assignmentId: string) => `${STUDENT}/worksheets/${encode(assignmentId)}/attempts`,
    attempt: (attemptId: string) => `${STUDENT}/attempts/${encode(attemptId)}`,
    attemptProgress: (attemptId: string) => `${STUDENT}/attempts/${encode(attemptId)}/progress`,
    attemptSubmission: (attemptId: string) => `${STUDENT}/attempts/${encode(attemptId)}/submission`,
    attemptResult: (attemptId: string) => `${STUDENT}/attempts/${encode(attemptId)}/result`,
    learningRecords: () => `${STUDENT}/learning-records`,
    learningRecord: (recordId: string) => `${STUDENT}/learning-records/${encode(recordId)}`,
    questions: () => `${STUDENT}/questions`,
    question: (questionId: string) => `${STUDENT}/questions/${encode(questionId)}`,
    /** 🔴 계약은 `messages` 다. `follow-ups` 는 프론트가 지어낸 이름이었다. */
    questionMessages: (questionId: string) => `${STUDENT}/questions/${encode(questionId)}/messages`,
    profile: () => `${STUDENT}/profile`,
    /** 🔴 계약은 `notification-preference` 다. `notifications` 가 아니다. */
    notificationPreference: () => `${STUDENT}/profile/notification-preference`,
    /** 🔴 POST + body. GET + query string 이 아니다. */
    invitationVerification: () => `${STUDENT}/invitations/verification`,
    invitations: () => `${STUDENT}/invitations`,
  },

  parent: {
    children: () => `${PARENT}/children`,
    /** 🔴 POST + body(studentPublicId). GET + query string 이 아니다. */
    childVerification: () => `${PARENT}/children/verification`,
    home: (studentId: string) => `${PARENT}/children/${encode(studentId)}/home`,
    learningRecords: (studentId: string) => `${PARENT}/children/${encode(studentId)}/learning-records`,
    learningRecord: (studentId: string, recordId: string) =>
      `${PARENT}/children/${encode(studentId)}/learning-records/${encode(recordId)}`,
    /** 🔴 `month`(YYYY-MM)는 계약상 **필수 query 파라미터**다. 빠지면 400 INVALID_REQUEST 다. */
    analysis: (studentId: string, month: string) =>
      `${PARENT}/children/${encode(studentId)}/analysis?month=${encode(month)}`,
    /** 🔴 여기도 `month` 가 필수다. */
    analysisWeakness: (studentId: string, areaTag: string, typeTag: string, month: string) =>
      `${PARENT}/children/${encode(studentId)}/analysis/weaknesses/${encode(areaTag)}/${encode(typeTag)}?month=${encode(month)}`,
    reports: (studentId: string) => `${PARENT}/children/${encode(studentId)}/reports`,
    report: (studentId: string, reportId: string) =>
      `${PARENT}/children/${encode(studentId)}/reports/${encode(reportId)}`,
    reportFileAccess: (studentId: string, reportId: string) =>
      `${PARENT}/children/${encode(studentId)}/reports/${encode(reportId)}/file-access`,
    consultations: (studentId: string) => `${PARENT}/children/${encode(studentId)}/consultations`,
    consultation: (studentId: string, consultationId: string) =>
      `${PARENT}/children/${encode(studentId)}/consultations/${encode(consultationId)}`,
    /**
     * 🔴 계약에는 있으나 **백엔드 미구현**이다.
     * ParentConsultationController.java:78 — `TODO(MB-09): 취소 가능 시점이 확정되기 전에는
     * cancellation endpoint 를 열지 않는다.`
     * 화면은 만들되 이 경로를 호출하지 않는다. 호출부는 `consultationCancellationSupported` 로 막는다.
     */
    consultationCancellation: (studentId: string, consultationId: string) =>
      `${PARENT}/children/${encode(studentId)}/consultations/${encode(consultationId)}/cancellation`,
    createConsultation: () => `${PARENT}/consultations`,
    notifications: () => `${PARENT}/notifications`,
    notificationRead: (notificationId: string) => `${PARENT}/notifications/${encode(notificationId)}/read`,
    notificationsReadAll: () => `${PARENT}/notifications/read-all`,
    profile: () => `${PARENT}/profile`,
    /** 🔴 계약은 `notification-preference` 다. */
    notificationPreference: () => `${PARENT}/profile/notification-preference`,
    /** 🔴 POST + body(code). */
    invitationVerification: () => `${PARENT}/invitations/verification`,
    invitations: () => `${PARENT}/invitations`,
  },
} as const;

/**
 * 🔴 상담 취소는 백엔드가 열지 않았다 (MB-09 정책 미확정).
 * 화면은 비활성 상태로 그리고 요청을 보내지 않는다.
 */
export const consultationCancellationSupported = false;

/** member 경계를 지나야 하는 경로인지. 테스트가 이 규칙을 강제한다. */
export function isMemberPath(path: string) {
  return path.startsWith(`${MEMBER}/`);
}

export function isLegacyAuthPath(path: string) {
  return path === `${LEGACY_AUTH}/login` || path === `${LEGACY_AUTH}/refresh` || path === `${LEGACY_AUTH}/logout`;
}
