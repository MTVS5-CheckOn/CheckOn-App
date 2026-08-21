import { env } from "@/config/env";
import { quizQuestionFixtures } from "@/features/student/quiz/mock-data";
import type { QuizQuestion } from "@/features/student/quiz/types";
import { worksheetFixtures } from "@/features/student/worksheets/mock-data";
import type { Worksheet } from "@/features/student/worksheets/types";
import { apiRequest } from "@/lib/api/client";

export type QuizPayload = { worksheet: Worksheet; questions: QuizQuestion[] };
export type QuizSubmission = { worksheetId: string; answers: Record<string, number>; elapsedSecondsByQuestion: Record<string, number> };

export interface QuizGateway {
  get(worksheetId: string): Promise<QuizPayload | null>;
  submit(input: QuizSubmission): Promise<void>;
}

const mockQuizGateway: QuizGateway = {
  async get(worksheetId) { await new Promise((resolve) => setTimeout(resolve, 150)); const worksheet = worksheetFixtures.find((item) => item.id === worksheetId); return worksheet ? { worksheet, questions: quizQuestionFixtures.slice(0, Math.min(worksheet.questionCount, quizQuestionFixtures.length)) } : null; },
  async submit() { await new Promise((resolve) => setTimeout(resolve, 250)); },
};

const httpQuizGateway: QuizGateway = {
  get: (worksheetId) => apiRequest(`/v1/students/me/worksheets/${worksheetId}/quiz`),
  submit: (input) => apiRequest(`/v1/students/me/worksheets/${input.worksheetId}/submissions`, { method: "POST", body: input }),
};

export const quizGateway = env.dataSource === "api" ? httpQuizGateway : mockQuizGateway;
