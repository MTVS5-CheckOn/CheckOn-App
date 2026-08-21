export type StudentQuestionStatus = "waiting" | "answered";

export type StudentQuestion = {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  questionNumber: number;
  title: string;
  content: string;
  createdAt: string;
  status: StudentQuestionStatus;
  teacherAnswer?: string;
  answeredAt?: string;
  followUps: { id: string; content: string; createdAt: string }[];
};
