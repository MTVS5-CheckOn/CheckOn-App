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
  /**
   * 🔴 계약은 `name` 을 required 로 선언하는데(member-api.yaml:2097) 실제 응답에 `null` 이 온다.
   * 시연 시드에서 자녀 4명 중 2명이 그렇다. 스키마를 required 로 두면
   * **학부모 내 정보 화면 전체가 502 로 죽는다** — 한 행 때문에 화면을 잃는다.
   * 그래서 null 을 받아들이되, 값을 지어내지 않고 화면에서 그 자리를 렌더링하지 않는다.
   * 🔴 계약과 실제가 다른 지점이다. 백엔드가 name 을 채우거나 계약을 nullable 로
   *    바꾸거나 둘 중 하나로 정해야 한다 (readiness 「판단 필요」에 등재).
   */
  name: z.string().nullable(),
  grade: z.number().nullish(),
  activationStatus: activationStatusSchema,
  linkedAt: z.string().nullish(),
  teachers: z.array(teacherSummarySchema).nullish(),
});

export const learningRecordSummarySchema = z.object({
  recordId: z.string(),
  assignmentId: z.string().nullish(),
  attemptId: z.string().nullish(),
  title: z.string(),
  occurredAt: z.string(),
  month: z.string().nullish(),
  areaTag: areaTagSchema.nullish(),
  itemCount: z.number(),
  correctCount: z.number(),
  /** 🔴 0~1 이다. ×100 은 표시 계층에서 한 번만. */
  accuracyRate: z.number(),
  totalActiveElapsedSeconds: z.number().nullish(),
  teacher: teacherSummarySchema.nullish(),
});

export const attemptItemResultSchema = z.object({
  itemId: z.string(),
  itemNo: z.number().nullish(),
  stem: z.string().nullish(),
  selectedNo: z.number().nullish(),
  correctNo: z.number().nullish(),
  correct: z.boolean().nullish(),
  explanation: z.string().nullish(),
  activeElapsedSeconds: z.number().nullish(),
  areaTag: areaTagSchema.nullish(),
  typeTag: typeTagSchema.nullish(),
});

export const learningRecordDetailSchema = learningRecordSummarySchema.extend({
  items: z.array(attemptItemResultSchema),
  weakness: z.object({
    status: valueStatusSchema,
    areaTag: areaTagSchema.nullish(),
    typeTag: typeTagSchema.nullish(),
    description: z.string().nullish(),
  }),
  // 🔴 실제 집계 결과만 온다. 값이 없으면 빈 배열이고 지어내지 않는다.
  trend: z.array(z.object({
    month: z.string(),
    accuracyRate: z.number().nullable(),
    status: valueStatusSchema,
  })).nullish(),
});

const improvementSchema = z.object({
  status: z.enum(["AVAILABLE", "NO_PREVIOUS_PERIOD", "INSUFFICIENT_SAMPLE", "NO_DATA"]),
  previousAccuracyRate: z.number().nullish(),
  /** 퍼센트포인트. 43%→51% 는 8.0. */
  accuracyDeltaPp: z.number().nullish(),
  minimumSampleSize: z.number().nullish(),
});

export const weaknessCellSchema = z.object({
  areaTag: areaTagSchema,
  typeTag: typeTagSchema,
  status: valueStatusSchema,
  scoredCount: z.number().nullish(),
  correctCount: z.number().nullish(),
  accuracyRate: z.number().nullish(),
  improvement: improvementSchema.nullish(),
});

export const reportSummarySchema = z.object({
  reportId: z.string(),
  reportMonth: z.string(),
  revision: z.number().nullish(),
  status: z.literal("PUBLISHED"),
  publishedAt: z.string(),
  teacher: teacherSummarySchema,
  /** 🔴 PDF 는 아직 연결되지 않았다. false 가 계약상 정상이다. */
  hasPdf: z.boolean().nullish(),
});

export const reportDetailSchema = reportSummarySchema.extend({
  snapshotVersion: z.string().nullish(),
  sections: z.array(z.object({
    kind: z.string(),
    title: z.string().nullish(),
    status: valueStatusSchema,
    body: z.string().nullish(),
    data: z.record(z.string(), z.unknown()).nullish(),
    evidenceRefs: z.array(z.string()).nullish(),
    // status 가 NOT_PRODUCED 일 때의 사유. 전국 백분위는 항상 여기에 해당한다.
    unproducedReason: z.string().nullish(),
  })),
});

export const reportFileAccessSchema = z.object({
  /** 🔴 수명이 짧은 signed URL. 캐시하지 않는다. */
  url: z.string(),
  expiresAt: z.string(),
  contentType: z.literal("application/pdf"),
  checksum: z.string().nullish(),
  sizeBytes: z.number().nullish(),
  pageCount: z.number().nullish(),
});

export const parentAnalysisSchema = z.object({
  month: z.string(),
  calculationVersion: z.string().nullish(),
  calculatedAt: z.string().nullish(),
  overall: z.object({
    status: valueStatusSchema,
    accuracyRate: z.number().nullish(),
    scoredCount: z.number().nullish(),
    averageActiveSeconds: z.number().nullish(),
  }),
  accuracyTrend: z.array(z.object({
    month: z.string(),
    accuracyRate: z.number().nullish(),
    status: valueStatusSchema,
  })).nullish(),
  areaScores: z.array(z.object({
    areaTag: areaTagSchema,
    accuracyRate: z.number().nullish(),
    scoredCount: z.number().nullish(),
    status: valueStatusSchema,
  })).nullish(),
  weaknessRanking: z.array(weaknessCellSchema),
  primaryWeakness: weaknessCellSchema.nullish(),
});

export const parentHomeSchema = z.object({
  child: childSchema,
  metrics: z.array(z.object({
    key: z.enum(["MONTHLY_ACCURACY", "SOLVED_COUNT", "AVERAGE_DURATION_SEC", "WEAKNESS_DELTA_PP"]),
    status: valueStatusSchema,
    value: z.number().nullish(),
    unit: z.enum(["RATIO", "COUNT", "SECONDS", "PERCENTAGE_POINT"]).nullish(),
  })),
  latestReport: reportSummarySchema.nullish(),
  recentRecords: z.array(learningRecordSummarySchema).nullish(),
});

export const consultationSchema = z.object({
  consultationId: z.string(),
  studentId: z.string(),
  teacherId: z.string(),
  childName: z.string().nullish(),
  teacherName: z.string().nullish(),
  status: z.enum(["SUBMITTED", "REVIEWING", "ANSWERED", "CLOSED", "CANCELLED"]),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
  answeredAt: z.string().nullish(),
  aiAssistance: z.enum(["NOT_REQUESTED", "PENDING", "READY", "TEMPLATE_ONLY", "REJECTED_INSUFFICIENT", "UNAVAILABLE"]).nullish(),
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
  body: z.string().nullish(),
  createdAt: z.string(),
  read: z.boolean(),
  target: z.object({
    studentId: z.string().nullish(),
    resourceId: z.string().nullish(),
  }).nullish(),
});

export const parentProfileSchema = z.object({
  parentId: z.string(),
  name: z.string(),
  email: z.string().nullish(),
  children: z.array(childSchema),
  teachers: z.array(teacherSummarySchema),
  notificationsEnabled: z.boolean(),
});

export const childVerificationSchema = z.object({
  registrable: z.boolean(),
  /** 🔴 부분 마스킹된 이름만 반환한다 (예 `김*수`). */
  name: z.string().nullish(),
  grade: z.number().nullish(),
  reason: z.enum(["ALREADY_LINKED", "NOT_FOUND"]).nullish(),
});

export const childRegistrationResultSchema = z.object({ child: childSchema });
export const inviteVerificationSchema = z.object({
  valid: z.boolean(),
  teacher: teacherSummarySchema,
  expiresAt: z.string().nullish(),
});

export const parentRecordPageSchema = cursorPageSchema(learningRecordSummarySchema);
export const parentReportPageSchema = cursorPageSchema(reportSummarySchema);
export const parentConsultationPageSchema = cursorPageSchema(consultationSchema);
export const parentNotificationPageSchema = cursorPageSchema(notificationSchema);
