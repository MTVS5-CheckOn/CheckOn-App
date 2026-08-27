export type StudentQuestionStatus = "waiting" | "answered";

export type QuestionMessage = {
  id: string;
  authorRole: "student" | "teacher";
  content: string;
  publishedAt: string;
};

export type StudentQuestion = {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  questionNumber: number;
  title: string;
  content: string;
  createdAt: string;
  status: StudentQuestionStatus;
  answeredAt?: string;
  /**
   * 🔴 강사가 승인·발행한 메시지만 온다.
   * 답변 전에는 빈 배열이 **정상**이다 — 오류로 다루지 않는다.
   */
  messages: QuestionMessage[];
};
