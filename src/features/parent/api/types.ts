import type { ConsultationContext } from "@/features/parent/consultations/types";

export type { ParentAnalysisResponse, ParentHomeResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/model/types";

/** 🔴 계약은 공개 학생 ID(`studentPublicId`)를 받는다. */
export type ChildRegistrationRequest = { studentPublicId: string };
export type ChildRegistrationResponse = { id: string; studentId: string; name: string; grade: string; active: boolean };

/** 🔴 사전 확인은 안내일 뿐 등록을 보장하지 않는다. 이름은 부분 마스킹된다. */
export type ChildVerificationResult = {
  registrable: boolean;
  name: string | null;
  grade: number | null;
  reason: "ALREADY_LINKED" | "NOT_FOUND" | null;
};

export type InviteRegistrationRequest = { code: string };
/** 🔴 `academy` 는 계약에 없다. */
export type InviteRegistrationResponse = { id: string; name: string; subject: string | null };

export type CreateConsultationRequest = {
  studentId: string;
  /** 🔴 계약 required. 화면이 담당 강사를 골라야 한다. */
  teacherId: string;
  content: string;
  context?: ConsultationContext;
};
