export type QuizQuestion = {
  id: string;
  area: string;
  skill: string;
  stem: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};
