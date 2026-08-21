"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentQuestion } from "@/features/student/questions/types";

const INITIAL_QUESTIONS: StudentQuestion[] = [
  { id: "question-1", worksheetId: "l1", worksheetTitle: "현대시 독해 집중훈련", questionNumber: 2, title: "2번 문항 색채 이미지 관련 질문", content: "2번 문항에서 색채 이미지가 표현상 특징으로 정답이 되는 이유가 궁금합니다. '청산', '벽계수' 모두 색을 나타내는 단어인데, 이런 게 색채 이미지 활용인가요?", createdAt: "2026.08.19 11:23", status: "waiting", followUps: [] },
  { id: "question-2", worksheetId: "l3", worksheetTitle: "화법과작문 실전 모의", questionNumber: 4, title: "4번 문항 반어적 표현 이해 질문", content: "반어적 표현이 사용된 부분을 어떻게 빠르게 찾을 수 있나요?", createdAt: "2026.08.15 15:10", status: "answered", teacherAnswer: "겉으로 드러난 말과 문맥에서 실제로 전달하려는 뜻이 반대인지 확인해 보세요. 앞뒤 상황과 화자의 태도를 함께 보면 더 정확하게 판단할 수 있습니다.", answeredAt: "2026.08.16 10:20", followUps: [] },
  { id: "question-3", worksheetId: "l2", worksheetTitle: "독서 비문학 빠른 독해", questionNumber: 3, title: "3번 문항 서술어 기능 질문", content: "서술어의 기능을 구분하는 기준이 궁금해요.", createdAt: "2026.08.12 09:44", status: "answered", teacherAnswer: "문장에서 주어의 동작·상태·성질 중 무엇을 설명하는지 먼저 확인해 보세요.", answeredAt: "2026.08.12 18:05", followUps: [] },
];

type NewQuestion = Pick<StudentQuestion, "worksheetId" | "worksheetTitle" | "questionNumber" | "content">;
type QuestionState = {
  questions: StudentQuestion[];
  addQuestion: (question: NewQuestion) => string;
  addFollowUp: (questionId: string, content: string) => void;
  reset: () => void;
};

const nowLabel = () => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(/\. /g, ".").replace(".", ".");

export const useStudentQuestionStore = create<QuestionState>()(persist((set) => ({
  questions: INITIAL_QUESTIONS,
  addQuestion: (question) => {
    const id = `question-${Date.now()}`;
    set((state) => ({ questions: [{ ...question, id, title: `${question.questionNumber}번 문항 질문`, createdAt: nowLabel(), status: "waiting", followUps: [] }, ...state.questions] }));
    return id;
  },
  addFollowUp: (questionId, content) => set((state) => ({ questions: state.questions.map((question) => question.id === questionId ? { ...question, followUps: [...question.followUps, { id: `follow-up-${Date.now()}`, content, createdAt: nowLabel() }], status: "waiting" } : question) })),
  reset: () => set({ questions: INITIAL_QUESTIONS }),
}), { name: "checkon-student-questions" }));
