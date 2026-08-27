export type ConsultationStatus = "submitted" | "reviewing" | "answered" | "closed" | "cancelled";
export type ConsultationContext = {
  type: "record" | "analysis" | "report";
  id: string;
  label: string;
  detail?: string;
};

export type ConsultationMessage = {
  id: string;
  authorRole: "parent" | "teacher";
  content: string;
  publishedAt: string;
};

export type ParentConsultation = {
  id: string;
  studentId: string;
  /** 🔴 계약상 필수다. 화면이 담당 강사를 골라야 한다. */
  teacherId: string;
  childName: string;
  teacherName: string;
  content: string;
  context?: ConsultationContext;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  /**
   * 🔴 강사가 승인·발행한 메시지만 온다.
   * 답변 전에는 빈 배열이 **정상**이다 — 오류로 다루지 않는다.
   */
  messages: ConsultationMessage[];
};

export type ConsultationDraft = {
  studentId: string;
  /** 🔴 계약 CreateConsultationRequest 의 required 필드. 임의 기본값을 넣지 않는다. */
  teacherId: string;
  content: string;
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
