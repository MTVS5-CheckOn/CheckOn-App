import { env } from "@/config/env";
import { parentHomeData } from "@/features/parent/home/model";
import { parentAnalysis, parentNotifications, parentProfile, parentRecords, parentReports } from "@/features/parent/shared/mock-data";
import type {
  ChildRegistrationRequest,
  ChildRegistrationResponse,
  ChildVerificationResult,
  CreateConsultationRequest,
  InviteRegistrationRequest,
  InviteRegistrationResponse,
  ParentAnalysisResponse,
  ParentHomeResponse,
  ParentNotification,
  ParentProfileResponse,
  ParentRecord,
  ParentReport,
} from "@/features/parent/api/types";
import { useParentConsultationStore } from "@/features/parent/consultations/consultation.store";
import type { ParentConsultation } from "@/features/parent/consultations/types";
import { useParentStore } from "@/features/parent/shared/parent.store";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createIdempotencyKey, idempotencyHeaders } from "@/lib/api/idempotency";
import { pageQuery, type CursorPage } from "@/lib/api/types";
import { parseApiResponse } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import {
  childRegistrationResultSchema,
  childVerificationSchema,
  consultationDetailSchema,
  inviteVerificationSchema,
  learningRecordDetailSchema,
  parentAnalysisSchema,
  parentConsultationPageSchema,
  parentHomeSchema,
  parentNotificationPageSchema,
  parentProfileSchema,
  parentRecordPageSchema,
  parentReportPageSchema,
  reportDetailSchema,
} from "@/features/parent/api/schemas";
import {
  toChild,
  toParentAnalysis,
  toParentConsultation,
  toParentConsultationDetail,
  toParentHome,
  toParentNotification,
  toParentProfile,
  toParentRecord,
  toParentRecordDetail,
  toParentReport,
} from "@/features/parent/api/adapters";

export type ListQuery = { cursor?: string | null; limit?: number };

export interface ParentGateway {
  getHome(studentId: string): Promise<ParentHomeResponse>;
  listRecords(studentId: string, query?: ListQuery): Promise<CursorPage<ParentRecord>>;
  getRecord(studentId: string, recordId: string): Promise<ParentRecord | null>;
  getAnalysis(studentId: string): Promise<ParentAnalysisResponse>;
  listReports(studentId: string, query?: ListQuery): Promise<CursorPage<ParentReport>>;
  getReport(studentId: string, reportId: string): Promise<ParentReport | null>;
  getProfile(): Promise<ParentProfileResponse>;
  updateNotificationPreference(enabled: boolean): Promise<void>;
  listNotifications(query?: ListQuery): Promise<CursorPage<ParentNotification>>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  listConsultations(studentId: string, query?: ListQuery): Promise<CursorPage<ParentConsultation>>;
  getConsultation(studentId: string, consultationId: string): Promise<ParentConsultation | null>;
  createConsultation(input: CreateConsultationRequest): Promise<ParentConsultation>;
  verifyChild(studentPublicId: string): Promise<ChildVerificationResult>;
  registerChild(input: ChildRegistrationRequest): Promise<ChildRegistrationResponse>;
  registerInvite(input: InviteRegistrationRequest): Promise<InviteRegistrationResponse>;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** mock 도 HTTP 와 같은 cursor page 모양으로 답한다 — 화면에 분기를 만들지 않기 위해서다. */
function mockPage<T>(items: T[]): CursorPage<T> {
  return { items, nextCursor: null, hasNext: false };
}

const mockParentGateway: ParentGateway = {
  async getHome() { await wait(); return { ...parentHomeData, recent: parentRecords.slice(0, 2) }; },
  async listRecords() { await wait(); return mockPage(parentRecords); },
  async getRecord(_studentId, recordId) { await wait(); return parentRecords.find((item) => item.id === recordId) ?? null; },
  async getAnalysis() { await wait(); return parentAnalysis; },
  async listReports() { await wait(); return mockPage(parentReports); },
  async getReport(_studentId, reportId) { await wait(); return parentReports.find((item) => item.id === reportId) ?? null; },
  async getProfile() { await wait(); return parentProfile; },
  async updateNotificationPreference(enabled) { await wait(); useParentStore.getState().setNotifications(enabled); },
  async listNotifications() { await wait(); return mockPage(parentNotifications); },
  async markNotificationRead() { await wait(); },
  async markAllNotificationsRead() { await wait(); },
  async listConsultations(studentId) {
    await wait();
    return mockPage(useParentConsultationStore.getState().consultations.filter((item) => item.studentId === studentId));
  },
  async getConsultation(studentId, consultationId) {
    await wait();
    return useParentConsultationStore.getState().consultations.find((item) => item.studentId === studentId && item.id === consultationId) ?? null;
  },
  async createConsultation(input) {
    await wait(300);
    const parent = useParentStore.getState();
    const childName = parent.children.find((item) => item.studentId === input.studentId)?.name ?? "자녀";
    const teacherName = parent.teachers.find((item) => item.id === input.teacherId)?.name ?? "담당 선생님";
    return useParentConsultationStore.getState().addConsultation(input, childName, teacherName);
  },
  async verifyChild(studentPublicId) {
    await wait(300);
    if (studentPublicId === "STU-TAKEN") return { registrable: false, name: null, grade: null, reason: "ALREADY_LINKED" };
    if (studentPublicId !== "STU-B52D") return { registrable: false, name: null, grade: null, reason: "NOT_FOUND" };
    return { registrable: true, name: "김*준", grade: 1, reason: null };
  },
  async registerChild({ studentPublicId }) { await wait(300); return { id: "student-2", studentId: studentPublicId, name: "김서준", grade: "고1", active: true }; },
  async registerInvite({ code }) {
    await wait(300);
    // 🔴 계약 코드로 던진다. INVITE_INVALID·INVITE_ALREADY_USED 는 계약에 없는 이름이었다.
    if (code === "TEACH-OLD") throw new ApiError("사용 기간이 만료된 초대 코드입니다.", 410, "INVITE_EXPIRED");
    if (code === "TEACH-DUP") throw new ApiError("이미 등록된 강사의 초대 코드입니다.", 409, "INVITE_ALREADY_CLAIMED");
    if (code !== "TEACH-KOR") throw new ApiError("유효하지 않은 초대 코드입니다.", 404, "RESOURCE_NOT_FOUND");
    return { id: "teacher-2", name: "최하늘 선생님", subject: null };
  },
};

export const httpParentGateway: ParentGateway = {
  getHome: async (studentId) =>
    toParentHome(parseApiResponse(parentHomeSchema, await apiRequest(endpoints.parent.home(studentId)), "parent.home")),

  listRecords: async (studentId, query) => {
    const page = parseApiResponse(
      parentRecordPageSchema,
      await apiRequest(`${endpoints.parent.learningRecords(studentId)}${pageQuery(query)}`),
      "parent.records",
    );
    return { ...page, items: page.items.map(toParentRecord) };
  },

  getRecord: async (studentId, recordId) =>
    toParentRecordDetail(parseApiResponse(
      learningRecordDetailSchema,
      await apiRequest(endpoints.parent.learningRecord(studentId, recordId)),
      "parent.record",
    )),

  getAnalysis: async (studentId) =>
    toParentAnalysis(parseApiResponse(parentAnalysisSchema, await apiRequest(endpoints.parent.analysis(studentId)), "parent.analysis")),

  listReports: async (studentId, query) => {
    const page = parseApiResponse(
      parentReportPageSchema,
      await apiRequest(`${endpoints.parent.reports(studentId)}${pageQuery(query)}`),
      "parent.reports",
    );
    return { ...page, items: page.items.map(toParentReport) };
  },

  getReport: async (studentId, reportId) =>
    toParentReport(parseApiResponse(reportDetailSchema, await apiRequest(endpoints.parent.report(studentId, reportId)), "parent.report")),

  getProfile: async () =>
    toParentProfile(parseApiResponse(parentProfileSchema, await apiRequest(endpoints.parent.profile()), "parent.profile")),

  updateNotificationPreference: (enabled) =>
    apiRequest(endpoints.parent.notificationPreference(), { method: "PATCH", body: { enabled } }),

  listNotifications: async (query) => {
    const page = parseApiResponse(
      parentNotificationPageSchema,
      await apiRequest(`${endpoints.parent.notifications()}${pageQuery(query)}`),
      "parent.notifications",
    );
    return { ...page, items: page.items.map(toParentNotification) };
  },

  markNotificationRead: (notificationId) => apiRequest(endpoints.parent.notificationRead(notificationId), { method: "POST" }),
  markAllNotificationsRead: () => apiRequest(endpoints.parent.notificationsReadAll(), { method: "POST" }),

  listConsultations: async (studentId, query) => {
    const page = parseApiResponse(
      parentConsultationPageSchema,
      await apiRequest(`${endpoints.parent.consultations(studentId)}${pageQuery(query)}`),
      "parent.consultations",
    );
    return { ...page, items: page.items.map(toParentConsultation) };
  },

  getConsultation: async (studentId, consultationId) =>
    toParentConsultationDetail(parseApiResponse(
      consultationDetailSchema,
      await apiRequest(endpoints.parent.consultation(studentId, consultationId)),
      "parent.consultation",
    )),

  createConsultation: async (input) =>
    toParentConsultationDetail(parseApiResponse(
      consultationDetailSchema,
      await apiRequest(endpoints.parent.createConsultation(), {
        method: "POST",
        // 🔴 teacherId 가 필수다. responseMethod 는 계약에 없어 보내지 않는다.
        body: { studentId: input.studentId, teacherId: input.teacherId, content: input.content, context: input.context },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "parent.createConsultation",
    )),

  // 🔴 POST + body 다. GET + query string 이 아니다.
  verifyChild: async (studentPublicId) => {
    const dto = parseApiResponse(
      childVerificationSchema,
      await apiRequest(endpoints.parent.childVerification(), {
        method: "POST",
        body: { studentPublicId },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "parent.verifyChild",
    );
    // 🔴 이름은 부분 마스킹되어 온다 (예 `김*수`). 원본을 알 수 없으므로 그대로 보여준다.
    return { registrable: dto.registrable, name: dto.name ?? null, grade: dto.grade ?? null, reason: dto.reason ?? null };
  },

  registerChild: async (input) =>
    toChild(parseApiResponse(
      childRegistrationResultSchema,
      await apiRequest(endpoints.parent.children(), {
        method: "POST",
        body: { studentPublicId: input.studentPublicId },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "parent.registerChild",
    ).child),

  registerInvite: async (input) => {
    const result = parseApiResponse(
      inviteVerificationSchema,
      await apiRequest(endpoints.parent.invitations(), {
        method: "POST",
        body: { code: input.code },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "parent.registerInvite",
    );
    return { id: result.teacher.teacherId, name: result.teacher.displayName, subject: result.teacher.subject ?? null };
  },
};

export const parentGateway = env.dataSource === "api" ? httpParentGateway : mockParentGateway;
