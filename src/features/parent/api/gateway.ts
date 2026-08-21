import { env } from "@/config/env";
import { parentHomeData } from "@/features/parent/home/model";
import { accuracyTrend, areaScores, parentRecords, parentReports } from "@/features/parent/shared/mock-data";
import type { ChildRegistrationRequest, ChildRegistrationResponse, InviteRegistrationRequest, InviteRegistrationResponse, ParentAnalysisResponse, ParentHomeResponse, ParentReport } from "@/features/parent/api/types";
import type { ParentRecord } from "@/features/parent/shared/mock-data";
import { apiRequest } from "@/lib/api/client";

export interface ParentGateway {
  getHome(studentId: string): Promise<ParentHomeResponse>;
  listRecords(studentId: string): Promise<ParentRecord[]>;
  getRecord(studentId: string, recordId: string): Promise<ParentRecord | null>;
  getAnalysis(studentId: string): Promise<ParentAnalysisResponse>;
  listReports(studentId: string): Promise<ParentReport[]>;
  getReport(studentId: string, reportId: string): Promise<ParentReport | null>;
  verifyChild(studentId: string): Promise<ChildRegistrationResponse>;
  registerChild(input: ChildRegistrationRequest): Promise<ChildRegistrationResponse>;
  registerInvite(input: InviteRegistrationRequest): Promise<InviteRegistrationResponse>;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const mockParentGateway: ParentGateway = {
  async getHome() { await wait(); return { ...parentHomeData, recent: parentRecords.slice(0, 2) }; },
  async listRecords() { await wait(); return parentRecords; },
  async getRecord(_studentId, recordId) { await wait(); return parentRecords.find((item) => item.id === recordId) ?? null; },
  async getAnalysis() { await wait(); return { percentile: 71, accuracy: 68, changeFromPreviousMonth: 5, sampleAsOf: "2026.08.31", areaScores, accuracyTrend }; },
  async listReports() { await wait(); return parentReports; },
  async getReport(_studentId, reportId) { await wait(); return parentReports.find((item) => item.id === reportId) ?? null; },
  async verifyChild(studentId) { await wait(300); if (studentId === "STU-TAKEN") throw Object.assign(new Error("이미 다른 학부모 계정에 등록된 학생입니다."), { code: "CHILD_ALREADY_LINKED" }); if (studentId !== "STU-B52D") throw Object.assign(new Error("학생 정보를 찾을 수 없습니다."), { code: "STUDENT_NOT_FOUND" }); return { id: "student-2", studentId, name: "김서준", grade: "고1", active: false }; },
  async registerChild({ studentId }) { await wait(300); return { id: "student-2", studentId, name: "김서준", grade: "고1", active: true }; },
  async registerInvite({ code }) { await wait(300); if (code === "TEACH-OLD") throw Object.assign(new Error("사용 기간이 만료된 초대 코드입니다."), { code: "INVITE_EXPIRED" }); if (code === "TEACH-DUP") throw Object.assign(new Error("이미 등록된 강사의 초대 코드입니다."), { code: "INVITE_ALREADY_USED" }); if (code !== "TEACH-KOR") throw Object.assign(new Error("유효하지 않은 초대 코드입니다."), { code: "INVITE_INVALID" }); return { id: "teacher-2", name: "최하늘 선생님", academy: "한빛국어학원" }; },
};

const httpParentGateway: ParentGateway = {
  getHome: (studentId) => apiRequest(`/v1/parents/me/children/${studentId}/home`),
  listRecords: (studentId) => apiRequest(`/v1/parents/me/children/${studentId}/learning-records`),
  getRecord: (studentId, recordId) => apiRequest(`/v1/parents/me/children/${studentId}/learning-records/${recordId}`),
  getAnalysis: (studentId) => apiRequest(`/v1/parents/me/children/${studentId}/analysis`),
  listReports: (studentId) => apiRequest(`/v1/parents/me/children/${studentId}/reports`),
  getReport: (studentId, reportId) => apiRequest(`/v1/parents/me/children/${studentId}/reports/${reportId}`),
  verifyChild: (studentId) => apiRequest(`/v1/parents/me/children/verification?studentId=${encodeURIComponent(studentId)}`),
  registerChild: (input) => apiRequest("/v1/parents/me/children", { method: "POST", body: input }),
  registerInvite: (input) => apiRequest("/v1/parents/me/invitations", { method: "POST", body: input }),
};

export const parentGateway = env.dataSource === "api" ? httpParentGateway : mockParentGateway;
