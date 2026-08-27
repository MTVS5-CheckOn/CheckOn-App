import { z } from "zod";
import { cursorPageSchema, teacherSummarySchema } from "@/lib/api/schemas";
import { areaTagSchema, learningRecordDetailSchema, learningRecordSummarySchema, typeTagSchema, valueStatusSchema } from "@/features/parent/api/schemas";

export { learningRecordDetailSchema, learningRecordSummarySchema };

export const worksheetSummarySchema = z.object({
  assignmentId: z.string(),
  title: z.string(),
  areaTag: areaTagSchema.nullable().optional(),
  itemCount: z.number(),
  estimatedMinutes: z.number().nullable().optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED"]),
  publishedAt: z.string().optional(),
  teacher: teacherSummarySchema,
  latestAttemptId: z.string().nullable().optional(),
  /** 🔴 COMPLETED 일 때만. 0~1. */
  accuracyRate: z.number().nullable().optional(),
});

export const worksheetDetailSchema = worksheetSummarySchema.extend({
  description: z.string().nullable().optional(),
});

export const studentHomeSchema = z.object({
  studentName: z.string(),
  /** 진행 중 attempt 가 있는 학습지. 없으면 null. */
  continuing: worksheetSummarySchema.nullable().optional(),
  todayWorksheets: z.array(worksheetSummarySchema),
  weakness: z.object({
    status: valueStatusSchema,
    areaTag: areaTagSchema.nullable().optional(),
    typeTag: typeTagSchema.nullable().optional(),
    accuracyRate: z.number().nullable().optional(),
  }).nullable().optional(),
});

export const studentProfileSchema = z.object({
  studentId: z.string(),
  studentPublicId: z.string(),
  name: z.string(),
  grade: z.number(),
  activationStatus: z.enum(["PENDING_PARENT_LINK", "ACTIVE", "DEACTIVATED"]),
  parentLinked: z.boolean().optional(),
  teachers: z.array(teacherSummarySchema),
  notificationsEnabled: z.boolean(),
});

export const studentQuestionSchema = z.object({
  questionId: z.string(),
  assignmentId: z.string().optional(),
  itemId: z.string().nullable().optional(),
  itemOrdinal: z.number().nullable().optional(),
  worksheetTitle: z.string().optional(),
  title: z.string(),
  /** 🔴 강사가 답해야 ANSWERED 가 된다. WAITING 은 정상 상태다. */
  status: z.enum(["WAITING", "ANSWERED", "FOLLOW_UP"]),
  createdAt: z.string(),
  answeredAt: z.string().nullable().optional(),
  teacher: teacherSummarySchema.optional(),
});

export const studentQuestionDetailSchema = studentQuestionSchema.extend({
  content: z.string(),
  /** 🔴 강사가 답하기 전에는 빈 배열이 정상이다. */
  messages: z.array(z.object({
    messageId: z.string(),
    authorRole: z.enum(["STUDENT", "TEACHER"]),
    content: z.string(),
    publishedAt: z.string(),
  })),
});

export const inviteVerificationSchema = z.object({
  valid: z.boolean(),
  teacher: teacherSummarySchema,
  expiresAt: z.string().optional(),
});

export const worksheetPageSchema = cursorPageSchema(worksheetSummarySchema);
export const studentRecordPageSchema = cursorPageSchema(learningRecordSummarySchema);
export const studentQuestionPageSchema = cursorPageSchema(studentQuestionSchema);
