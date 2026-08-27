import { z } from "zod";

const optionSchema = z.object({ no: z.number(), text: z.string() });

/** 🔴 correctAnswer·explanation·correct 를 넣지 않는다. 계약에 없다. */
export const quizQuestionSchema = z.object({
  itemId: z.string(),
  ordinal: z.number(),
  stem: z.string(),
  passage: z.string().nullish(),
  areaTag: z.string().nullish(),
  typeTag: z.string().nullish(),
  options: z.array(optionSchema),
});

export const attemptInProgressSchema = z.object({
  attemptId: z.string(),
  assignmentId: z.string(),
  status: z.literal("IN_PROGRESS"),
  version: z.number(),
  snapshotHash: z.string().nullish(),
  startedAt: z.string().nullish(),
  currentItemId: z.string().nullish(),
  totalActiveElapsedSeconds: z.number(),
  answers: z.record(z.string(), z.number()),
  activeElapsedSecondsByItem: z.record(z.string(), z.number()),
  items: z.array(quizQuestionSchema),
});

export const attemptItemResultSchema = quizQuestionSchema.extend({
  selectedNo: z.number().nullable(),
  correctNo: z.number(),
  correct: z.boolean(),
  explanation: z.string(),
  activeElapsedSeconds: z.number().default(0),
});

export const attemptResultSchema = z.object({
  attemptId: z.string(),
  assignmentId: z.string(),
  status: z.literal("SCORED"),
  submittedAt: z.string().nullish(),
  scoredAt: z.string().nullish(),
  itemCount: z.number(),
  /** 🔴 이 필드를 빼면 결과 화면이 서버 채점을 못 읽는다. contract test 가 지킨다. */
  correctCount: z.number(),
  accuracyRate: z.number(),
  totalActiveElapsedSeconds: z.number().default(0),
  learningRecordId: z.string().nullish(),
  items: z.array(attemptItemResultSchema),
});

export const attemptProgressResultSchema = z.object({
  attemptId: z.string(),
  version: z.number(),
  totalActiveElapsedSeconds: z.number(),
  savedAt: z.string().nullish(),
  duplicated: z.boolean().nullish(),
});

export const attemptSubmittedSchema = z.object({
  attemptId: z.string(),
  assignmentId: z.string(),
  status: z.literal("SUBMITTED"),
  version: z.number(),
  submittedAt: z.string(),
});

/** attempt 조회는 status 로 진행 중·채점 완료가 갈린다. */
export const attemptSchema = z.union([attemptInProgressSchema, attemptResultSchema]);
