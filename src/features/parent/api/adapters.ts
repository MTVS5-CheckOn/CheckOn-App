import type { ParentAnalysisDto, ParentHomeDto, ParentNotificationDto, ParentProfileDto, ParentRecordDto, ParentReportDto } from "@/features/parent/api/dto";
import type { ParentAnalysisResponse, ParentHomeResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/model/types";

export const toParentRecord = (dto: ParentRecordDto): ParentRecord => ({ ...dto, trend: dto.trend.map((item) => ({ ...item })), detail: { ...dto.detail } });
export const toParentHome = (dto: ParentHomeDto): ParentHomeResponse => ({ ...dto, student: { ...dto.student }, metrics: dto.metrics.map((item) => ({ ...item })), report: { ...dto.report }, recent: dto.recent.map(toParentRecord) });
export const toParentAnalysis = (dto: ParentAnalysisDto): ParentAnalysisResponse => ({ ...dto, areaScores: dto.areaScores.map((item) => ({ ...item })), accuracyTrend: dto.accuracyTrend.map((item) => ({ ...item })), primaryWeakness: { ...dto.primaryWeakness } });
export const toParentReport = (dto: ParentReportDto): ParentReport => ({ ...dto, summary: { ...dto.summary }, pdf: { ...dto.pdf, pageLabels: [...dto.pdf.pageLabels] } });
export const toParentProfile = (dto: ParentProfileDto): ParentProfileResponse => ({ ...dto, children: dto.children.map((item) => ({ ...item })), teachers: dto.teachers.map((item) => ({ ...item })) });
export const toParentNotification = (dto: ParentNotificationDto): ParentNotification => ({ ...dto });
