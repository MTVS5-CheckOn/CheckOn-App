import { env } from "@/config/env";
import { useStudentQuestionStore } from "@/features/student/questions/question.store";
import type { StudentQuestion } from "@/features/student/questions/types";
import { apiRequest } from "@/lib/api/client";

export type CreateQuestionInput = Pick<StudentQuestion, "worksheetId" | "worksheetTitle" | "questionNumber" | "content">;
export interface QuestionGateway { list(): Promise<StudentQuestion[]>; get(id: string): Promise<StudentQuestion | null>; create(input: CreateQuestionInput): Promise<StudentQuestion>; addFollowUp(id: string, content: string): Promise<void>; }
const wait = () => new Promise((resolve) => setTimeout(resolve, 150));
const mockQuestionGateway: QuestionGateway = {
  async list() { await wait(); return useStudentQuestionStore.getState().questions; },
  async get(id) { await wait(); return useStudentQuestionStore.getState().questions.find((item) => item.id === id) ?? null; },
  async create(input) { await wait(); const id = useStudentQuestionStore.getState().addQuestion(input); return useStudentQuestionStore.getState().questions.find((item) => item.id === id)!; },
  async addFollowUp(id, content) { await wait(); useStudentQuestionStore.getState().addFollowUp(id, content); },
};
const httpQuestionGateway: QuestionGateway = {
  list: () => apiRequest("/v1/students/me/questions"), get: (id) => apiRequest(`/v1/students/me/questions/${id}`),
  create: (input) => apiRequest("/v1/students/me/questions", { method: "POST", body: input }),
  addFollowUp: (id, content) => apiRequest(`/v1/students/me/questions/${id}/follow-ups`, { method: "POST", body: { content } }),
};
export const questionGateway = env.dataSource === "api" ? httpQuestionGateway : mockQuestionGateway;
