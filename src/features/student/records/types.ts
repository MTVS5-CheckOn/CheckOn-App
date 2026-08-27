/** 🔴 계약 AreaTag 5종의 표시 이름. "언어·매체" 는 mock 픽스처가 쓰던 옛 묶음 이름이다. */
export type RecordArea = "화법과작문" | "언어" | "매체" | "언어·매체" | "독서" | "문학" | "기타";

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
