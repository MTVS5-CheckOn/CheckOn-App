import { z } from "zod";

/**
 * 🔴 규칙: 계약의 `required` 에 없는 필드는 `.nullish()` 로 받는다.
 *
 * 백엔드는 "값 없음"을 키 생략이 아니라 **`null`** 로 보낸다(실측:
 * `GET .../analysis` 가 `calculatedAt: null` 을 반환한다 — 계약에는 nullable
 * 표기가 없는데도 그렇다). `.optional()` 만 쓰면 undefined 만 허용해서
 * **정상 200 응답이 502 INVALID_API_RESPONSE 로 터진다.**
 * required 필드는 그대로 엄격하게 둔다 — 거기서는 결측이 진짜 계약 위반이다.
 */

/** 목록 공통 — cursor pagination (member-api.yaml `CursorPage`). */
export function cursorPageSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  });
}

export const memberRoleSchema = z.enum(["STUDENT", "PARENT"]);
export const studentActivationStatusSchema = z.enum(["PENDING_PARENT_LINK", "ACTIVE", "DEACTIVATED"]);

/**
 * 🔴 TeacherSummary 에 `academyName` 이 **없다.** 백엔드 teacher_profiles 에 원본이 없다.
 * `subject` 는 계약상 nullable 이고 현재 항상 null 이다. 지어내지 않는다.
 */
export const teacherSummarySchema = z.object({
  teacherId: z.string(),
  displayName: z.string(),
  subject: z.string().nullish(),
});

export const memberAuthResultSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.string(),
  account: z.object({
    id: z.string(),
    role: memberRoleSchema,
    email: z.string().nullish(),
    // 학생·학부모는 항상 null 이다.
    teacherProfileId: z.string().nullish(),
  }),
});

export const memberSessionSchema = z.object({
  accountId: z.string(),
  role: memberRoleSchema,
  name: z.string(),
  studentProfileId: z.string().nullish(),
  parentProfileId: z.string().nullish(),
  activationStatus: studentActivationStatusSchema.nullish(),
  studentPublicId: z.string().nullish(),
  teachers: z.array(teacherSummarySchema).nullish(),
  notificationsEnabled: z.boolean().nullish(),
});

export const signUpResultSchema = z.object({
  accountId: z.string(),
  role: memberRoleSchema,
  studentPublicId: z.string().nullish(),
  activationStatus: studentActivationStatusSchema.nullish(),
});

export const studentActivationSchema = z.object({
  status: studentActivationStatusSchema,
  studentPublicId: z.string().nullish(),
  activatedAt: z.string().nullish(),
});

export type MemberAuthResult = z.infer<typeof memberAuthResultSchema>;
export type MemberSession = z.infer<typeof memberSessionSchema>;
export type SignUpResult = z.infer<typeof signUpResultSchema>;
export type StudentActivation = z.infer<typeof studentActivationSchema>;
export type TeacherSummary = z.infer<typeof teacherSummarySchema>;
