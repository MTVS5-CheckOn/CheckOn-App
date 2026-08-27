import { env } from "@/config/env";
import { useStudentQuestionStore } from "@/features/student/questions/question.store";
import type { StudentQuestion } from "@/features/student/questions/types";
import { toStudentQuestion, toStudentQuestionDetail } from "@/features/student/api/adapters";
import { studentQuestionDetailSchema, studentQuestionPageSchema } from "@/features/student/api/schemas";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createIdempotencyKey, idempotencyHeaders } from "@/lib/api/idempotency";
import { pageQuery, type CursorPage } from "@/lib/api/types";
import { parseApiResponse } from "@/lib/api/validate";

/** 🔴 계약 CreateQuestionRequest 는 assignmentId·title·content 를 요구한다. */
export type CreateQuestionInput = {
  worksheetId: string;
  worksheetTitle: string;
  questionNumber: number;
  title: string;
  content: string;
  itemId?: string | null;
  attemptId?: string | null;
};

export type ListQuery = { cursor?: string | null; limit?: number };

export interface QuestionGateway {
  list(query?: ListQuery): Promise<CursorPage<StudentQuestion>>;
  get(questionId: string): Promise<StudentQuestion | null>;
  create(input: CreateQuestionInput): Promise<StudentQuestion>;
  /** 🔴 계약 경로는 `messages` 다. `follow-ups` 는 프론트가 지어낸 이름이었다. */
  addMessage(questionId: string, content: string): Promise<void>;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 150));

const mockQuestionGateway: QuestionGateway = {
  async list() { await wait(); return { items: useStudentQuestionStore.getState().questions, nextCursor: null, hasNext: false }; },
  async get(questionId) { await wait(); return useStudentQuestionStore.getState().questions.find((item) => item.id === questionId) ?? null; },
  async create(input) {
    await wait();
    const id = useStudentQuestionStore.getState().addQuestion(input);
    return useStudentQuestionStore.getState().questions.find((item) => item.id === id)!;
  },
  async addMessage(questionId, content) { await wait(); useStudentQuestionStore.getState().addMessage(questionId, content); },
};

const httpQuestionGateway: QuestionGateway = {
  list: async (query) => {
    const page = parseApiResponse(
      studentQuestionPageSchema,
      await apiRequest(`${endpoints.student.questions()}${pageQuery(query)}`),
      "student.questions",
    );
    return { ...page, items: page.items.map(toStudentQuestion) };
  },
  get: async (questionId) =>
    toStudentQuestionDetail(parseApiResponse(
      studentQuestionDetailSchema,
      await apiRequest(endpoints.student.question(questionId)),
      "student.question",
    )),
  create: async (input) =>
    toStudentQuestionDetail(parseApiResponse(
      studentQuestionDetailSchema,
      await apiRequest(endpoints.student.questions(), {
        method: "POST",
        body: { assignmentId: input.worksheetId, itemId: input.itemId ?? null, attemptId: input.attemptId ?? null, title: input.title, content: input.content },
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "student.createQuestion",
    )),
  addMessage: (questionId, content) =>
    apiRequest(endpoints.student.questionMessages(questionId), {
      method: "POST",
      body: { content },
      headers: idempotencyHeaders(createIdempotencyKey()),
    }),
};

export const questionGateway = env.dataSource === "api" ? httpQuestionGateway : mockQuestionGateway;
