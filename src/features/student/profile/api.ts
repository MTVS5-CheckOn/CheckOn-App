import { env } from "@/config/env";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useStudentProfileStore } from "@/features/student/profile/profile.store";
import type { InviteRegistrationResponse, InviteVerificationResponse, StudentProfileResponse } from "@/features/student/profile/types";
import { apiRequest } from "@/lib/api/client";

export interface StudentProfileGateway {
  getProfile(): Promise<StudentProfileResponse>;
  updateNotifications(enabled: boolean): Promise<void>;
  verifyInvite(code: string): Promise<InviteVerificationResponse>;
  registerInvite(code: string): Promise<InviteRegistrationResponse>;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const INVITE_TEACHER = { id: "teacher-2", name: "이서현 선생님", academy: "체크온 국어학원", subject: "독서·언어 담당" };
async function verifyMockInvite(code: string): Promise<InviteVerificationResponse> { await wait(); const normalized = code.trim().toUpperCase(); if (normalized === "EXPIRED-2026") throw Object.assign(new Error("사용 기간이 지난 초대 코드입니다."), { code: "INVITE_EXPIRED" }); if (normalized !== "CHECKON-2026" && normalized !== "INVITE-2026") throw Object.assign(new Error("유효하지 않은 초대 코드입니다."), { code: "INVITE_INVALID" }); return { code: normalized, teacher: INVITE_TEACHER }; }
const mockStudentProfileGateway: StudentProfileGateway = {
  async getProfile() { await wait(); const auth = useStudentAuthStore.getState(); const profile = useStudentProfileStore.getState(); return { studentId: auth.studentId, name: auth.name, grade: auth.grade, status: auth.status, teachers: profile.teachers, notificationsEnabled: profile.notificationsEnabled }; },
  async updateNotifications(enabled) { await wait(); useStudentProfileStore.getState().setNotifications(enabled); },
  verifyInvite: verifyMockInvite,
  async registerInvite(code) { const verified = await verifyMockInvite(code); useStudentProfileStore.getState().addTeacher(verified.teacher); return { teacher: verified.teacher }; },
};
const httpStudentProfileGateway: StudentProfileGateway = {
  getProfile: () => apiRequest("/v1/students/me/profile"),
  updateNotifications: (enabled) => apiRequest("/v1/students/me/profile/notifications", { method: "PATCH", body: { enabled } }),
  verifyInvite: (code) => apiRequest(`/v1/students/me/invitations/verification?code=${encodeURIComponent(code)}`),
  registerInvite: (code) => apiRequest("/v1/students/me/invitations", { method: "POST", body: { code } }),
};
export const studentProfileGateway = env.dataSource === "api" ? httpStudentProfileGateway : mockStudentProfileGateway;
