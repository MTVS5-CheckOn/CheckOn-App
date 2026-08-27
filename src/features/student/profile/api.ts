import { env } from "@/config/env";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useStudentProfileStore } from "@/features/student/profile/profile.store";
import type { InviteRegistrationResponse, InviteVerificationResponse, StudentProfileResponse } from "@/features/student/profile/types";
import { toStudentProfile } from "@/features/student/api/adapters";
import { inviteVerificationSchema, studentProfileSchema } from "@/features/student/api/schemas";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { createIdempotencyKey, idempotencyHeaders } from "@/lib/api/idempotency";
import { parseApiResponse } from "@/lib/api/validate";

export interface StudentProfileGateway {
  getProfile(): Promise<StudentProfileResponse>;
  updateNotifications(enabled: boolean): Promise<void>;
  verifyInvite(code: string): Promise<InviteVerificationResponse>;
  registerInvite(code: string): Promise<InviteRegistrationResponse>;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));
// 🔴 academy 는 계약에 없다. subject 도 현재 항상 null 이다.
const INVITE_TEACHER = { id: "teacher-2", name: "이서현 선생님", subject: null };

async function verifyMockInvite(code: string): Promise<InviteVerificationResponse> {
  await wait();
  const normalized = code.trim().toUpperCase();
  // 🔴 계약 코드로 던진다. INVITE_INVALID 는 계약에 없는 이름이었다.
  if (normalized === "EXPIRED-2026") throw new ApiError("사용 기간이 지난 초대 코드입니다.", 410, "INVITE_EXPIRED");
  if (normalized !== "CHECKON-2026" && normalized !== "INVITE-2026") throw new ApiError("유효하지 않은 초대 코드입니다.", 404, "RESOURCE_NOT_FOUND");
  return { code: normalized, teacher: INVITE_TEACHER };
}

const mockStudentProfileGateway: StudentProfileGateway = {
  async getProfile() {
    await wait();
    const auth = useStudentAuthStore.getState();
    const profile = useStudentProfileStore.getState();
    return { studentId: auth.studentId, name: auth.name, grade: auth.grade, status: auth.status, teachers: profile.teachers, notificationsEnabled: profile.notificationsEnabled };
  },
  async updateNotifications(enabled) { await wait(); useStudentProfileStore.getState().setNotifications(enabled); },
  verifyInvite: verifyMockInvite,
  async registerInvite(code) {
    const verified = await verifyMockInvite(code);
    useStudentProfileStore.getState().addTeacher(verified.teacher);
    return { teacher: verified.teacher };
  },
};

const httpStudentProfileGateway: StudentProfileGateway = {
  getProfile: async () =>
    toStudentProfile(parseApiResponse(studentProfileSchema, await apiRequest(endpoints.student.profile()), "student.profile")),

  updateNotifications: (enabled) =>
    apiRequest(endpoints.student.notificationPreference(), { method: "PATCH", body: { enabled } }),

  // 🔴 POST + body 다. GET + query string 이 아니다.
  verifyInvite: async (code) => {
    const result = parseApiResponse(
      inviteVerificationSchema,
      await apiRequest(endpoints.student.invitationVerification(), {
        method: "POST",
        body: { code },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "student.verifyInvite",
    );
    return { code, teacher: { id: result.teacher.teacherId, name: result.teacher.displayName, subject: result.teacher.subject ?? null } };
  },

  registerInvite: async (code) => {
    const result = parseApiResponse(
      inviteVerificationSchema,
      await apiRequest(endpoints.student.invitations(), {
        method: "POST",
        body: { code },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "student.registerInvite",
    );
    return { teacher: { id: result.teacher.teacherId, name: result.teacher.displayName, subject: result.teacher.subject ?? null } };
  },
};

export const studentProfileGateway = env.dataSource === "api" ? httpStudentProfileGateway : mockStudentProfileGateway;
