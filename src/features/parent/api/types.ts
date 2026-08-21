import type { ConsultationContext } from "@/features/parent/consultations/types";
export type { ParentAnalysisResponse, ParentHomeResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/model/types";
export type ChildRegistrationRequest = { studentId: string };
export type ChildRegistrationResponse = { id: string; studentId: string; name: string; grade: string; active: boolean };
export type InviteRegistrationRequest = { code: string };
export type InviteRegistrationResponse = { id: string; name: string; academy: string };
export type CreateConsultationRequest = {
  studentId: string;
  content: string;
  responseMethod: "app";
  context?: ConsultationContext;
};
