import { z } from "zod";

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
  subject: z.string().nullable().optional(),
});

export const memberAuthResultSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.string(),
  account: z.object({
    id: z.string(),
    role: memberRoleSchema,
    email: z.string().optional(),
    // 학생·학부모는 항상 null 이다.
    teacherProfileId: z.string().nullable().optional(),
  }),
});

export const memberSessionSchema = z.object({
  accountId: z.string(),
  role: memberRoleSchema,
  name: z.string(),
  studentProfileId: z.string().nullable().optional(),
  parentProfileId: z.string().nullable().optional(),
  activationStatus: studentActivationStatusSchema.nullable().optional(),
  studentPublicId: z.string().nullable().optional(),
  teachers: z.array(teacherSummarySchema).optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const signUpResultSchema = z.object({
  accountId: z.string(),
  role: memberRoleSchema,
  studentPublicId: z.string().nullable().optional(),
  activationStatus: studentActivationStatusSchema.nullable().optional(),
});

export const studentActivationSchema = z.object({
  status: studentActivationStatusSchema,
  studentPublicId: z.string().optional(),
  activatedAt: z.string().nullable().optional(),
});

export type MemberAuthResult = z.infer<typeof memberAuthResultSchema>;
export type MemberSession = z.infer<typeof memberSessionSchema>;
export type SignUpResult = z.infer<typeof signUpResultSchema>;
export type StudentActivation = z.infer<typeof studentActivationSchema>;
export type TeacherSummary = z.infer<typeof teacherSummarySchema>;
