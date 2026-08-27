import { z } from "zod";
import { cursorPageSchema, teacherSummarySchema } from "@/lib/api/schemas";
import { areaTagSchema, learningRecordDetailSchema, learningRecordSummarySchema, typeTagSchema, valueStatusSchema } from "@/features/parent/api/schemas";

export { learningRecordDetailSchema, learningRecordSummarySchema };

export const worksheetSummarySchema = z.object({
  assignmentId: z.string(),
  title: z.string(),
  areaTag: areaTagSchema.nullish(),
  itemCount: z.number(),
  estimatedMinutes: z.number().nullish(),
  status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED"]),
  publishedAt: z.string().nullish(),
  teacher: teacherSummarySchema,
  latestAttemptId: z.string().nullish(),
  /** 🔴 COMPLETED 일 때만. 0~1. */
  accuracyRate: z.number().nullish(),
});

export const worksheetDetailSchema = worksheetSummarySchema.extend({
  description: z.string().nullish(),
});

export const studentHomeSchema = z.object({
  studentName: z.string(),
  /** 진행 중 attempt 가 있는 학습지. 없으면 null. */
  continuing: worksheetSummarySchema.nullish(),
  todayWorksheets: z.array(worksheetSummarySchema),
  weakness: z.object({
    status: valueStatusSchema,
    areaTag: areaTagSchema.nullish(),
    typeTag: typeTagSchema.nullish(),
    accuracyRate: z.number().nullish(),
  }).nullish(),
});

export const studentProfileSchema = z.object({
  studentId: z.string(),
  studentPublicId: z.string(),
  name: z.string(),
  grade: z.number(),
  activationStatus: z.enum(["PENDING_PARENT_LINK", "ACTIVE", "DEACTIVATED"]),
  parentLinked: z.boolean().nullish(),
  teachers: z.array(teacherSummarySchema),
  notificationsEnabled: z.boolean(),
});

export const studentQuestionSchema = z.object({
  questionId: z.string(),
  assignmentId: z.string().nullish(),
  itemId: z.string().nullish(),
  itemOrdinal: z.number().nullish(),
  worksheetTitle: z.string().nullish(),
  title: z.string(),
  /** 🔴 강사가 답해야 ANSWERED 가 된다. WAITING 은 정상 상태다. */
  status: z.enum(["WAITING", "ANSWERED", "FOLLOW_UP"]),
  createdAt: z.string(),
  answeredAt: z.string().nullish(),
  teacher: teacherSummarySchema.nullish(),
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
  expiresAt: z.string().nullish(),
});

export const worksheetPageSchema = cursorPageSchema(worksheetSummarySchema);
export const studentRecordPageSchema = cursorPageSchema(learningRecordSummarySchema);
export const studentQuestionPageSchema = cursorPageSchema(studentQuestionSchema);
