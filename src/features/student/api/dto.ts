import type { z } from "zod";
import type {
  inviteVerificationSchema,
  learningRecordDetailSchema,
  learningRecordSummarySchema,
  studentHomeSchema,
  studentProfileSchema,
  studentQuestionDetailSchema,
  studentQuestionSchema,
  worksheetDetailSchema,
  worksheetSummarySchema,
} from "@/features/student/api/schemas";

/**
 * 🔴 DTO 는 계약의 wire 모양이다.
 * 이전에는 `typeof studentHomeData`(= mock 픽스처)가 타입의 원본이었다 — 그러면
 * 픽스처를 고칠 때마다 "타입"이 따라 바뀌어 계약 위반을 잡을 수 없다.
 */
export type StudentHomeDto = z.infer<typeof studentHomeSchema>;
export type WorksheetDto = z.infer<typeof worksheetSummarySchema>;
export type WorksheetDetailDto = z.infer<typeof worksheetDetailSchema>;
export type StudentRecordDto = z.infer<typeof learningRecordSummarySchema>;
export type StudentRecordDetailDto = z.infer<typeof learningRecordDetailSchema>;
export type StudentProfileDto = z.infer<typeof studentProfileSchema>;
export type StudentQuestionDto = z.infer<typeof studentQuestionSchema>;
export type StudentQuestionDetailDto = z.infer<typeof studentQuestionDetailSchema>;
export type InviteVerificationDto = z.infer<typeof inviteVerificationSchema>;
