import type { StudentAccountStatus } from "@/features/student/auth/student-auth.store";

export type StudentTeacher = { id: string; name: string; academy: string; subject: string };
export type StudentProfileResponse = { studentId: string; name: string; grade: string; status: StudentAccountStatus; teachers: StudentTeacher[]; notificationsEnabled: boolean };
export type InviteVerificationResponse = { code: string; teacher: StudentTeacher };
export type InviteRegistrationResponse = { teacher: StudentTeacher };
