import type { z } from "zod";
import type {
  childRegistrationResultSchema,
  childVerificationSchema,
  consultationDetailSchema,
  consultationSchema,
  inviteVerificationSchema,
  learningRecordDetailSchema,
  learningRecordSummarySchema,
  notificationSchema,
  parentAnalysisSchema,
  parentHomeSchema,
  parentProfileSchema,
  reportDetailSchema,
  reportFileAccessSchema,
  reportSummarySchema,
} from "@/features/parent/api/schemas";

/**
 * 🔴 DTO 는 **wire 모양**이다. 화면 domain 타입의 alias 가 아니다.
 * 계약 변경은 schemas.ts 와 adapters.ts 가 흡수한다.
 */
export type ParentHomeDto = z.infer<typeof parentHomeSchema>;
export type ParentRecordDto = z.infer<typeof learningRecordSummarySchema>;
export type ParentRecordDetailDto = z.infer<typeof learningRecordDetailSchema>;
export type ParentAnalysisDto = z.infer<typeof parentAnalysisSchema>;
export type ParentReportDto = z.infer<typeof reportSummarySchema>;
export type ParentReportDetailDto = z.infer<typeof reportDetailSchema>;
export type ReportFileAccessDto = z.infer<typeof reportFileAccessSchema>;
export type ParentProfileDto = z.infer<typeof parentProfileSchema>;
export type ParentNotificationDto = z.infer<typeof notificationSchema>;
export type ConsultationDto = z.infer<typeof consultationSchema>;
export type ConsultationDetailDto = z.infer<typeof consultationDetailSchema>;
export type ChildVerificationDto = z.infer<typeof childVerificationSchema>;
export type ChildRegistrationResultDto = z.infer<typeof childRegistrationResultSchema>;
export type InviteVerificationDto = z.infer<typeof inviteVerificationSchema>;
