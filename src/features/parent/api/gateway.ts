import { env } from "@/config/env";
import { parentHomeData } from "@/features/parent/home/model";
import { parentAnalysis, parentNotifications, parentProfile, parentRecords, parentReports } from "@/features/parent/shared/mock-data";
import type { ChildRegistrationRequest, ChildRegistrationResponse, CreateConsultationRequest, InviteRegistrationRequest, InviteRegistrationResponse, ParentAnalysisResponse, ParentHomeResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/api/types";
import { useParentConsultationStore } from "@/features/parent/consultations/consultation.store";
import type { ParentConsultation } from "@/features/parent/consultations/types";
import { useParentStore } from "@/features/parent/shared/parent.store";
import { apiRequest } from "@/lib/api/client";
import type { ParentAnalysisDto, ParentHomeDto, ParentNotificationDto, ParentProfileDto, ParentRecordDto, ParentReportDto } from "@/features/parent/api/dto";
import { toParentAnalysis, toParentHome, toParentNotification, toParentProfile, toParentRecord, toParentReport } from "@/features/parent/api/adapters";

export interface ParentGateway {
  getHome(studentId: string): Promise<ParentHomeResponse>;
  listRecords(studentId: string): Promise<ParentRecord[]>;
  getRecord(studentId: string, recordId: string): Promise<ParentRecord | null>;
  getAnalysis(studentId: string): Promise<ParentAnalysisResponse>;
  listReports(studentId: string): Promise<ParentReport[]>;
  getReport(studentId: string, reportId: string): Promise<ParentReport | null>;
  getProfile(): Promise<ParentProfileResponse>;
  updateNotificationPreference(enabled: boolean): Promise<void>;
  listNotifications(): Promise<ParentNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  listConsultations(studentId: string): Promise<ParentConsultation[]>;
  getConsultation(studentId: string, consultationId: string): Promise<ParentConsultation | null>;
  createConsultation(input: CreateConsultationRequest): Promise<ParentConsultation>;
  cancelConsultation(studentId: string, consultationId: string): Promise<void>;
  verifyChild(studentId: string): Promise<ChildRegistrationResponse>;
  registerChild(input: ChildRegistrationRequest): Promise<ChildRegistrationResponse>;
  registerInvite(input: InviteRegistrationRequest): Promise<InviteRegistrationResponse>;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const mockParentGateway: ParentGateway = {
  async getHome() { await wait(); return { ...parentHomeData, recent: parentRecords.slice(0, 2) }; },
  async listRecords() { await wait(); return parentRecords; },
  async getRecord(_studentId, recordId) { await wait(); return parentRecords.find((item) => item.id === recordId) ?? null; },
  async getAnalysis() { await wait(); return parentAnalysis; },
  async listReports() { await wait(); return parentReports; },
  async getReport(_studentId, reportId) { await wait(); return parentReports.find((item) => item.id === reportId) ?? null; },
  async getProfile() { await wait(); return parentProfile; },
  async updateNotificationPreference(enabled) { await wait(); useParentStore.getState().setNotifications(enabled); },
  async listNotifications() { await wait(); return parentNotifications; },
  async markNotificationRead() { await wait(); },
  async markAllNotificationsRead() { await wait(); },
  async listConsultations(studentId) { await wait(); return useParentConsultationStore.getState().consultations.filter((item) => item.studentId === studentId); },
  async getConsultation(studentId, consultationId) { await wait(); return useParentConsultationStore.getState().consultations.find((item) => item.studentId === studentId && item.id === consultationId) ?? null; },
  async createConsultation(input) {
    await wait(300);
    const parent = useParentStore.getState();
    const childName = parent.children.find((item) => item.studentId === input.studentId)?.name ?? "자녀";
    const teacherName = parent.teachers[0]?.name ?? "담당 선생님";
    return useParentConsultationStore.getState().addConsultation(input, childName, teacherName);
  },
  async cancelConsultation(_studentId, consultationId) { await wait(); useParentConsultationStore.getState().cancelConsultation(consultationId); },
  async verifyChild(studentId) { await wait(300); if (studentId === "STU-TAKEN") throw Object.assign(new Error("이미 다른 학부모 계정에 등록된 학생입니다."), { code: "CHILD_ALREADY_LINKED" }); if (studentId !== "STU-B52D") throw Object.assign(new Error("학생 정보를 찾을 수 없습니다."), { code: "STUDENT_NOT_FOUND" }); return { id: "student-2", studentId, name: "김서준", grade: "고1", active: false }; },
  async registerChild({ studentId }) { await wait(300); return { id: "student-2", studentId, name: "김서준", grade: "고1", active: true }; },
  async registerInvite({ code }) { await wait(300); if (code === "TEACH-OLD") throw Object.assign(new Error("사용 기간이 만료된 초대 코드입니다."), { code: "INVITE_EXPIRED" }); if (code === "TEACH-DUP") throw Object.assign(new Error("이미 등록된 강사의 초대 코드입니다."), { code: "INVITE_ALREADY_USED" }); if (code !== "TEACH-KOR") throw Object.assign(new Error("유효하지 않은 초대 코드입니다."), { code: "INVITE_INVALID" }); return { id: "teacher-2", name: "최하늘 선생님", academy: "한빛국어학원" }; },
};

export const httpParentGateway: ParentGateway = {
  getHome: async (studentId) => toParentHome(await apiRequest<ParentHomeDto>(`/v1/parents/me/children/${studentId}/home`)),
  listRecords: async (studentId) => (await apiRequest<ParentRecordDto[]>(`/v1/parents/me/children/${studentId}/learning-records`)).map(toParentRecord),
  getRecord: async (studentId, recordId) => { const dto = await apiRequest<ParentRecordDto | null>(`/v1/parents/me/children/${studentId}/learning-records/${recordId}`); return dto ? toParentRecord(dto) : null; },
  getAnalysis: async (studentId) => toParentAnalysis(await apiRequest<ParentAnalysisDto>(`/v1/parents/me/children/${studentId}/analysis`)),
  listReports: async (studentId) => (await apiRequest<ParentReportDto[]>(`/v1/parents/me/children/${studentId}/reports`)).map(toParentReport),
  getReport: async (studentId, reportId) => { const dto = await apiRequest<ParentReportDto | null>(`/v1/parents/me/children/${studentId}/reports/${reportId}`); return dto ? toParentReport(dto) : null; },
  getProfile: async () => toParentProfile(await apiRequest<ParentProfileDto>("/v1/parents/me/profile")),
  updateNotificationPreference: (enabled) => apiRequest("/v1/parents/me/profile/notifications", { method: "PATCH", body: { enabled } }),
  listNotifications: async () => (await apiRequest<ParentNotificationDto[]>("/v1/parents/me/notifications")).map(toParentNotification),
  markNotificationRead: (notificationId) => apiRequest(`/v1/parents/me/notifications/${notificationId}/read`, { method: "POST" }),
  markAllNotificationsRead: () => apiRequest("/v1/parents/me/notifications/read-all", { method: "POST" }),
  listConsultations: (studentId) => apiRequest(`/v1/parents/me/children/${studentId}/consultations`),
  getConsultation: (studentId, consultationId) => apiRequest(`/v1/parents/me/children/${studentId}/consultations/${consultationId}`),
  createConsultation: (input) => apiRequest("/v1/parents/me/consultations", { method: "POST", body: input }),
  cancelConsultation: (studentId, consultationId) => apiRequest(`/v1/parents/me/children/${studentId}/consultations/${consultationId}/cancellation`, { method: "POST" }),
  verifyChild: (studentId) => apiRequest(`/v1/parents/me/children/verification?studentId=${encodeURIComponent(studentId)}`),
  registerChild: (input) => apiRequest("/v1/parents/me/children", { method: "POST", body: input }),
  registerInvite: (input) => apiRequest("/v1/parents/me/invitations", { method: "POST", body: input }),
};

export const parentGateway = env.dataSource === "api" ? httpParentGateway : mockParentGateway;
