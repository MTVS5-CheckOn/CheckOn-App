import type { ParentAnalysisResponse, ParentHomeResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/model/types";

// 백엔드 계약 타입은 화면 도메인과 분리한다. API 명세 변경은 이 파일과 adapter에서 흡수한다.
export type ParentRecordDto = ParentRecord;
export type ParentHomeDto = Omit<ParentHomeResponse, "recent"> & { recent: ParentRecordDto[] };
export type ParentAnalysisDto = ParentAnalysisResponse;
export type ParentReportDto = ParentReport;
export type ParentProfileDto = ParentProfileResponse;
export type ParentNotificationDto = ParentNotification;
