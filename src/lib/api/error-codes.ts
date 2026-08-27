/**
 * 백엔드가 실제로 내려보내는 오류 코드 전량.
 *
 * 정본: CheckOn-backend `com.checkon.member.common.error.MemberErrorCode`
 * (계약 member-api.yaml 의 오류 응답과 같은 집합이어야 하고, 백엔드 MemberCodeRuleTest G13 이 강제한다).
 *
 * 🔴 여기 없는 코드로 화면을 분기하면 그 분기는 영원히 실행되지 않는다.
 */
export const MEMBER_ERROR_CODES = [
  "INVALID_REQUEST",
  "AUTHENTICATION_REQUIRED",
  "INVALID_CREDENTIALS",
  "ACCOUNT_NOT_ACTIVE",
  "ROLE_FORBIDDEN",
  "STUDENT_ACTIVATION_REQUIRED",
  "RESOURCE_NOT_FOUND",
  "EMAIL_ALREADY_EXISTS",
  "IDEMPOTENCY_CONFLICT",
  "REVISION_CONFLICT",
  "CHILD_ALREADY_LINKED",
  "ATTEMPT_ALREADY_SUBMITTED",
  "INVITE_ALREADY_CLAIMED",
  "INVITE_EXPIRED",
  "SUBMISSION_INCOMPLETE",
  "RELATIONSHIP_REQUIRED",
  "WORKSHEET_NOT_GRADABLE",
  "RATE_LIMITED",
  "INTERNAL",
  "DEPENDENCY_UNAVAILABLE",
  "DEPENDENCY_TIMEOUT",
] as const;

export type MemberErrorCode = (typeof MEMBER_ERROR_CODES)[number];

const CODE_SET = new Set<string>(MEMBER_ERROR_CODES);

export function isMemberErrorCode(code: string | undefined): code is MemberErrorCode {
  return code !== undefined && CODE_SET.has(code);
}

/**
 * readiness 문서가 「합의가 필요한 오류 코드」로 적어둔 이름 → 계약의 실제 코드.
 *
 * 🔴 왼쪽 이름들은 계약에 **없다.** 프론트가 지어낸 것이라 그대로 두면 분기가 죽는다.
 * mock gateway 가 옛 이름을 던지던 자리도 이 표를 통해 계약 코드로 맞춘다.
 */
export const RETIRED_ERROR_CODE_ALIASES: Record<string, MemberErrorCode> = {
  STUDENT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INVITE_INVALID: "RESOURCE_NOT_FOUND",
  INVITE_ALREADY_USED: "INVITE_ALREADY_CLAIMED",
  REPORT_NOT_READY: "RESOURCE_NOT_FOUND",
  PDF_NOT_FOUND: "RESOURCE_NOT_FOUND",
};

/** 화면이 받은 code 를 계약 코드로 정규화한다. 모르는 값은 그대로 흘려보낸다(중립 표시). */
export function normalizeErrorCode(code: string | undefined): string | undefined {
  if (code === undefined) return undefined;
  return RETIRED_ERROR_CODE_ALIASES[code] ?? code;
}
