import { z } from "zod";
import { cursorPageSchema, teacherSummarySchema } from "@/lib/api/schemas";

/** 🔴 0 과 결측을 구분하기 위해 값과 함께 항상 내려간다. NOT_AVAILABLE 이면 값이 null 이다. */
export const valueStatusSchema = z.enum(["AVAILABLE", "INSUFFICIENT", "NO_DATA", "NOT_PRODUCED"]);
export const areaTagSchema = z.enum(["language", "media", "literature", "reading", "speech_writing"]);
export const typeTagSchema = z.enum(["fact", "infer", "critic", "concept", "apply"]);
export const activationStatusSchema = z.enum(["PENDING_PARENT_LINK", "ACTIVE", "DEACTIVATED"]);

export const childSchema = z.object({
  studentId: z.string(),
  studentPublicId: z.string(),
  name: z.string(),
  grade: z.number().nullable().optional(),
  activationStatus: activationStatusSchema,
  linkedAt: z.string().optional(),
  teachers: z.array(teacherSummarySchema).optional(),
});

export const learningRecordSummarySchema = z.object({
  recordId: z.string(),
  assignmentId: z.string().nullable().optional(),
  attemptId: z.string().nullable().optional(),
  title: z.string(),
  occurredAt: z.string(),
  month: z.string().optional(),
  areaTag: areaTagSchema.nullable().optional(),
  itemCount: z.number(),
  correctCount: z.number(),
  /** 🔴 0~1 이다. ×100 은 표시 계층에서 한 번만. */
  accuracyRate: z.number(),
  totalActiveElapsedSeconds: z.number().optional(),
  teacher: teacherSummarySchema.optional(),
});

export const attemptItemResultSchema = z.object({
  itemId: z.string(),
  itemNo: z.number().optional(),
  stem: z.string().optional(),
  selectedNo: z.number().nullable().optional(),
  correctNo: z.number().nullable().optional(),
  correct: z.boolean().nullable().optional(),
  explanation: z.string().nullable().optional(),
  activeElapsedSeconds: z.number().optional(),
  areaTag: areaTagSchema.nullable().optional(),
  typeTag: typeTagSchema.nullable().optional(),
});

export const learningRecordDetailSchema = learningRecordSummarySchema.extend({
  items: z.array(attemptItemResultSchema),
  weakness: z.object({
    status: valueStatusSchema,
    areaTag: areaTagSchema.nullable().optional(),
    typeTag: typeTagSchema.nullable().optional(),
    description: z.string().nullable().optional(),
  }),
  // 🔴 실제 집계 결과만 온다. 값이 없으면 빈 배열이고 지어내지 않는다.
  trend: z.array(z.object({
    month: z.string(),
    accuracyRate: z.number().nullable(),
    status: valueStatusSchema,
  })).optional(),
});

const improvementSchema = z.object({
  status: z.enum(["AVAILABLE", "NO_PREVIOUS_PERIOD", "INSUFFICIENT_SAMPLE", "NO_DATA"]),
  previousAccuracyRate: z.number().nullable().optional(),
  /** 퍼센트포인트. 43%→51% 는 8.0. */
  accuracyDeltaPp: z.number().nullable().optional(),
  minimumSampleSize: z.number().optional(),
});

export const weaknessCellSchema = z.object({
  areaTag: areaTagSchema,
  typeTag: typeTagSchema,
  status: valueStatusSchema,
  scoredCount: z.number().optional(),
  correctCount: z.number().optional(),
  accuracyRate: z.number().nullable().optional(),
  improvement: improvementSchema.optional(),
});

export const reportSummarySchema = z.object({
  reportId: z.string(),
  reportMonth: z.string(),
  revision: z.number().optional(),
  status: z.literal("PUBLISHED"),
  publishedAt: z.string(),
  teacher: teacherSummarySchema,
  /** 🔴 PDF 는 아직 연결되지 않았다. false 가 계약상 정상이다. */
  hasPdf: z.boolean().optional(),
});

export const reportDetailSchema = reportSummarySchema.extend({
  snapshotVersion: z.string().optional(),
  sections: z.array(z.object({
    kind: z.string(),
    title: z.string().optional(),
    status: valueStatusSchema,
    body: z.string().nullable().optional(),
    data: z.record(z.string(), z.unknown()).nullable().optional(),
    evidenceRefs: z.array(z.string()).optional(),
    // status 가 NOT_PRODUCED 일 때의 사유. 전국 백분위는 항상 여기에 해당한다.
    unproducedReason: z.string().nullable().optional(),
  })),
});

export const reportFileAccessSchema = z.object({
  /** 🔴 수명이 짧은 signed URL. 캐시하지 않는다. */
  url: z.string(),
  expiresAt: z.string(),
  contentType: z.literal("application/pdf"),
  checksum: z.string().optional(),
  sizeBytes: z.number().optional(),
  pageCount: z.number().nullable().optional(),
});

export const parentAnalysisSchema = z.object({
  month: z.string(),
  calculationVersion: z.string().optional(),
  calculatedAt: z.string().optional(),
  overall: z.object({
    status: valueStatusSchema,
    accuracyRate: z.number().nullable().optional(),
    scoredCount: z.number().nullable().optional(),
    averageActiveSeconds: z.number().nullable().optional(),
  }),
  accuracyTrend: z.array(z.object({
    month: z.string(),
    accuracyRate: z.number().nullable().optional(),
    status: valueStatusSchema,
  })).optional(),
  areaScores: z.array(z.object({
    areaTag: areaTagSchema,
    accuracyRate: z.number().nullable().optional(),
    scoredCount: z.number().optional(),
    status: valueStatusSchema,
  })).optional(),
  weaknessRanking: z.array(weaknessCellSchema),
  primaryWeakness: weaknessCellSchema.nullable().optional(),
});

export const parentHomeSchema = z.object({
  child: childSchema,
  metrics: z.array(z.object({
    key: z.enum(["MONTHLY_ACCURACY", "SOLVED_COUNT", "AVERAGE_DURATION_SEC", "WEAKNESS_DELTA_PP"]),
    status: valueStatusSchema,
    value: z.number().nullable().optional(),
    unit: z.enum(["RATIO", "COUNT", "SECONDS", "PERCENTAGE_POINT"]).nullable().optional(),
  })),
  latestReport: reportSummarySchema.nullable().optional(),
  recentRecords: z.array(learningRecordSummarySchema).optional(),
});

export const consultationSchema = z.object({
  consultationId: z.string(),
  studentId: z.string(),
  teacherId: z.string(),
  childName: z.string().optional(),
  teacherName: z.string().optional(),
  status: z.enum(["SUBMITTED", "REVIEWING", "ANSWERED", "CLOSED", "CANCELLED"]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  answeredAt: z.string().nullable().optional(),
  aiAssistance: z.enum(["NOT_REQUESTED", "PENDING", "READY", "TEMPLATE_ONLY", "REJECTED_INSUFFICIENT", "UNAVAILABLE"]).optional(),
});

export const consultationDetailSchema = consultationSchema.extend({
  content: z.string(),
  /** 🔴 강사가 승인·발행한 메시지만. 답변 전에는 빈 배열이 정상이다. */
  messages: z.array(z.object({
    messageId: z.string(),
    authorRole: z.enum(["PARENT", "TEACHER"]),
    content: z.string(),
    publishedAt: z.string(),
  })),
});

export const notificationSchema = z.object({
  notificationId: z.string(),
  type: z.enum(["REPORT_PUBLISHED", "CONSULTATION_ANSWERED", "QUESTION_ANSWERED", "LEARNING_SUBMITTED", "CHILD_LINKED"]),
  title: z.string(),
  body: z.string().nullable().optional(),
  createdAt: z.string(),
  read: z.boolean(),
  target: z.object({
    studentId: z.string().nullable().optional(),
    resourceId: z.string().nullable().optional(),
  }).nullable().optional(),
});

export const parentProfileSchema = z.object({
  parentId: z.string(),
  name: z.string(),
  email: z.string().optional(),
  children: z.array(childSchema),
  teachers: z.array(teacherSummarySchema),
  notificationsEnabled: z.boolean(),
});

export const childVerificationSchema = z.object({
  registrable: z.boolean(),
  /** 🔴 부분 마스킹된 이름만 반환한다 (예 `김*수`). */
  name: z.string().nullable().optional(),
  grade: z.number().nullable().optional(),
  reason: z.enum(["ALREADY_LINKED", "NOT_FOUND"]).nullable().optional(),
});

export const childRegistrationResultSchema = z.object({ child: childSchema });
export const inviteVerificationSchema = z.object({
  valid: z.boolean(),
  teacher: teacherSummarySchema,
  expiresAt: z.string().optional(),
});

export const parentRecordPageSchema = cursorPageSchema(learningRecordSummarySchema);
export const parentReportPageSchema = cursorPageSchema(reportSummarySchema);
export const parentConsultationPageSchema = cursorPageSchema(consultationSchema);
export const parentNotificationPageSchema = cursorPageSchema(notificationSchema);
