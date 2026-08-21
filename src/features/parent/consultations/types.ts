export type ConsultationStatus = "submitted" | "reviewing" | "answered" | "closed" | "cancelled";
export type ConsultationContext = {
  type: "record" | "analysis" | "report";
  id: string;
  label: string;
  detail?: string;
};

export type ParentConsultation = {
  id: string;
  studentId: string;
  childName: string;
  teacherName: string;
  content: string;
  responseMethod: "app";
  context?: ConsultationContext;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  teacherAnswer?: string;
  answeredAt?: string;
};

export type ConsultationDraft = {
  studentId: string;
  content: string;
  responseMethod: "app";
  context?: ConsultationContext;
};

export function consultationStatusLabel(status: ConsultationStatus) {
  return {
    submitted: "확인 대기",
    reviewing: "선생님 확인 중",
    answered: "답변 완료",
    closed: "상담 완료",
    cancelled: "요청 취소",
  }[status];
}
