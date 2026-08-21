export type RecordArea = "화법과작문" | "언어·매체" | "독서" | "문학";

export type RecordQuestion = {
  id: string;
  number: number;
  stem: string;
  answer: number;
  correctAnswer: number;
  elapsedSeconds: number;
  explanation: string;
};

export type LearningRecord = {
  id: string;
  worksheetId: string;
  title: string;
  date: string;
  month: string;
  area: RecordArea;
  questionCount: number;
  correctCount: number;
  elapsedSeconds: number;
  weakness: string;
  weaknessDescription: string;
  trend: { label: string; accuracy: number }[];
  questions: RecordQuestion[];
};
