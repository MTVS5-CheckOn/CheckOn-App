import type { StudentAccountStatus } from "@/features/student/auth/student-auth.store";

/** 🔴 `academy` 는 계약(TeacherSummary)에 없다. `subject` 는 nullable 이고 현재 항상 null 이다. */
export type StudentTeacher = { id: string; name: string; subject: string | null };
export type StudentProfileResponse = { studentId: string; name: string; grade: string; status: StudentAccountStatus; teachers: StudentTeacher[]; notificationsEnabled: boolean };
export type InviteVerificationResponse = { code: string; teacher: StudentTeacher };
export type InviteRegistrationResponse = { teacher: StudentTeacher };
