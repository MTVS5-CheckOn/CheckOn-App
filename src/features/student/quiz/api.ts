import { env } from "@/config/env";
import { quizQuestionFixtures, scoreMockAttempt } from "@/features/student/quiz/mock-data";
import {
  attemptInProgressSchema,
  attemptProgressResultSchema,
  attemptResultSchema,
  attemptSchema,
  attemptSubmittedSchema,
} from "@/features/student/quiz/schemas";
import {
  MAX_ELAPSED_DELTA_SECONDS,
  type AttemptInProgress,
  type AttemptProgressRequest,
  type AttemptProgressResult,
  type AttemptResult,
  type AttemptSubmitRequest,
  type AttemptSubmitted,
} from "@/features/student/quiz/types";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { idempotencyHeaders } from "@/lib/api/idempotency";
import { ApiError } from "@/lib/api/errors";
import { parseApiResponse } from "@/lib/api/validate";

export interface QuizGateway {
  /** 🔴 재개는 200, 신규는 201. 둘 다 성공이다. */
  startAttempt(assignmentId: string, idempotencyKey: string): Promise<AttemptInProgress>;
  /** status 로 진행 중 / 채점 완료가 갈린다. */
  getAttempt(attemptId: string): Promise<AttemptInProgress | AttemptResult>;
  saveProgress(attemptId: string, request: AttemptProgressRequest): Promise<AttemptProgressResult>;
  submit(attemptId: string, request: AttemptSubmitRequest, idempotencyKey: string): Promise<AttemptSubmitted>;
  /** 미제출 attempt 는 404 다. */
  getResult(attemptId: string): Promise<AttemptResult>;
}

/**
 * 🔴 항목당 상한 600초로 자른다 — 초과분을 조용히 버리지 않고 **남은 delta 를 돌려준다.**
 * 호출부가 그것을 다음 요청으로 넘긴다. 서버는 601 이상을 400 으로 거절한다.
 */
export function clampElapsedDelta(delta: Record<string, number>): {
  clamped: Record<string, number>;
  carryOver: Record<string, number>;
} {
  const clamped: Record<string, number> = {};
  const carryOver: Record<string, number> = {};
  for (const [itemId, seconds] of Object.entries(delta)) {
    // 음수는 계약 위반이라 0 으로 본다.
    const safe = Math.max(0, Math.trunc(seconds));
    clamped[itemId] = Math.min(safe, MAX_ELAPSED_DELTA_SECONDS);
    const remainder = safe - clamped[itemId];
    if (remainder > 0) carryOver[itemId] = remainder;
  }
  return { clamped, carryOver };
}

const httpQuizGateway: QuizGateway = {
  startAttempt: async (assignmentId, idempotencyKey) =>
    parseApiResponse(
      attemptInProgressSchema,
      await apiRequest(endpoints.student.attempts(assignmentId), {
        method: "POST",
        headers: idempotencyHeaders(idempotencyKey),
      }),
      "quiz.startAttempt",
    ),

  getAttempt: async (attemptId) =>
    parseApiResponse(attemptSchema, await apiRequest(endpoints.student.attempt(attemptId)), "quiz.getAttempt"),

  saveProgress: async (attemptId, request) => {
    const { clamped } = clampElapsedDelta(request.activeElapsedSecondsDelta ?? {});
    return parseApiResponse(
      attemptProgressResultSchema,
      await apiRequest(endpoints.student.attemptProgress(attemptId), {
        method: "PATCH",
        body: { ...request, activeElapsedSecondsDelta: clamped },
      }),
      "quiz.saveProgress",
    );
  },

  submit: async (attemptId, request, idempotencyKey) => {
    const { clamped } = clampElapsedDelta(request.activeElapsedSecondsDelta ?? {});
    return parseApiResponse(
      attemptSubmittedSchema,
      await apiRequest(endpoints.student.attemptSubmission(attemptId), {
        method: "POST",
        body: { ...request, activeElapsedSecondsDelta: clamped },
        // 🔴 계약상 필수. 재시도에도 같은 키여야 서버가 두 번 채점하지 않는다.
        headers: idempotencyHeaders(idempotencyKey),
      }),
      "quiz.submit",
    );
  },

  getResult: async (attemptId) =>
    parseApiResponse(attemptResultSchema, await apiRequest(endpoints.student.attemptResult(attemptId)), "quiz.getResult"),
};

// ── mock ───────────────────────────────────────────────────────────────────
// 🔴 mock 도 HTTP 와 **같은 인터페이스**를 구현한다. 화면에 env.dataSource 분기를 두지 않기 위해서다.

type MockAttempt = {
  attemptId: string;
  assignmentId: string;
  version: number;
  answers: Record<string, number>;
  elapsedByItem: Record<string, number>;
  currentItemId: string | null;
  submitted: boolean;
  seenSequences: Set<number>;
};

const mockAttempts = new Map<string, MockAttempt>();
const mockAttemptByAssignment = new Map<string, string>();
const mockSubmitKeys = new Map<string, string>();

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function questionsFor(assignmentId: string) {
  // assignmentId 별 문항 수를 고정적으로 정한다(무작위를 쓰지 않는다).
  const count = 5 + (assignmentId.length % 6);
  return quizQuestionFixtures.slice(0, Math.min(count, quizQuestionFixtures.length));
}

function toInProgress(attempt: MockAttempt): AttemptInProgress {
  const items = questionsFor(attempt.assignmentId);
  return {
    attemptId: attempt.attemptId,
    assignmentId: attempt.assignmentId,
    status: "IN_PROGRESS",
    version: attempt.version,
    currentItemId: attempt.currentItemId,
    totalActiveElapsedSeconds: Object.values(attempt.elapsedByItem).reduce((sum, value) => sum + value, 0),
    answers: { ...attempt.answers },
    activeElapsedSecondsByItem: { ...attempt.elapsedByItem },
    items,
  };
}

function toResult(attempt: MockAttempt): AttemptResult {
  const items = scoreMockAttempt(questionsFor(attempt.assignmentId), attempt.answers, attempt.elapsedByItem);
  const correctCount = items.filter((item) => item.correct).length;
  return {
    attemptId: attempt.attemptId,
    assignmentId: attempt.assignmentId,
    status: "SCORED",
    itemCount: items.length,
    correctCount,
    accuracyRate: items.length ? correctCount / items.length : 0,
    totalActiveElapsedSeconds: Object.values(attempt.elapsedByItem).reduce((sum, value) => sum + value, 0),
    learningRecordId: `record-${attempt.attemptId}`,
    items,
  };
}

const mockQuizGateway: QuizGateway = {
  async startAttempt(assignmentId) {
    await wait();
    // 🔴 재개 지원. 같은 학습지에 진행 중 attempt 가 있으면 그것을 돌려준다.
    const existingId = mockAttemptByAssignment.get(assignmentId);
    const existing = existingId ? mockAttempts.get(existingId) : undefined;
    if (existing && !existing.submitted) return toInProgress(existing);
    const attempt: MockAttempt = {
      attemptId: `attempt-${assignmentId}`,
      assignmentId,
      version: 1,
      answers: {},
      elapsedByItem: {},
      currentItemId: null,
      submitted: false,
      seenSequences: new Set(),
    };
    mockAttempts.set(attempt.attemptId, attempt);
    mockAttemptByAssignment.set(assignmentId, attempt.attemptId);
    return toInProgress(attempt);
  },

  async getAttempt(attemptId) {
    await wait();
    const attempt = mockAttempts.get(attemptId);
    if (!attempt) throw new ApiError("attempt 를 찾을 수 없습니다.", 404, "RESOURCE_NOT_FOUND");
    return attempt.submitted ? toResult(attempt) : toInProgress(attempt);
  },

  async saveProgress(attemptId, request) {
    await wait(80);
    const attempt = mockAttempts.get(attemptId);
    if (!attempt) throw new ApiError("attempt 를 찾을 수 없습니다.", 404, "RESOURCE_NOT_FOUND");
    if (attempt.submitted) throw new ApiError("이미 제출된 attempt 입니다.", 409, "ATTEMPT_ALREADY_SUBMITTED");
    // 같은 clientSequence 재전송은 멱등이다.
    if (attempt.seenSequences.has(request.clientSequence)) {
      return {
        attemptId, version: attempt.version, duplicated: true,
        totalActiveElapsedSeconds: Object.values(attempt.elapsedByItem).reduce((sum, value) => sum + value, 0),
      };
    }
    if (request.baseVersion !== attempt.version) {
      throw new ApiError("다른 곳에서 먼저 저장되었습니다.", 409, "REVISION_CONFLICT");
    }
    attempt.seenSequences.add(request.clientSequence);
    Object.assign(attempt.answers, request.answers ?? {});
    const { clamped } = clampElapsedDelta(request.activeElapsedSecondsDelta ?? {});
    for (const [itemId, seconds] of Object.entries(clamped)) {
      attempt.elapsedByItem[itemId] = (attempt.elapsedByItem[itemId] ?? 0) + seconds;
    }
    if (request.currentItemId !== undefined) attempt.currentItemId = request.currentItemId;
    attempt.version += 1;
    return {
      attemptId, version: attempt.version, duplicated: false,
      totalActiveElapsedSeconds: Object.values(attempt.elapsedByItem).reduce((sum, value) => sum + value, 0),
    };
  },

  async submit(attemptId, request, idempotencyKey) {
    await wait(250);
    const attempt = mockAttempts.get(attemptId);
    if (!attempt) throw new ApiError("attempt 를 찾을 수 없습니다.", 404, "RESOURCE_NOT_FOUND");
    const seenKey = mockSubmitKeys.get(attemptId);
    // 🔴 같은 Idempotency-Key 재전송은 두 번 채점하지 않는다.
    if (attempt.submitted && seenKey !== idempotencyKey) {
      throw new ApiError("이미 제출된 attempt 입니다.", 409, "ATTEMPT_ALREADY_SUBMITTED");
    }
    if (!attempt.submitted) {
      Object.assign(attempt.answers, request.answers ?? {});
      const { clamped } = clampElapsedDelta(request.activeElapsedSecondsDelta ?? {});
      for (const [itemId, seconds] of Object.entries(clamped)) {
        attempt.elapsedByItem[itemId] = (attempt.elapsedByItem[itemId] ?? 0) + seconds;
      }
      attempt.submitted = true;
      attempt.version += 1;
      mockSubmitKeys.set(attemptId, idempotencyKey);
    }
    return {
      attemptId, assignmentId: attempt.assignmentId, status: "SUBMITTED",
      version: attempt.version, submittedAt: new Date().toISOString(),
    };
  },

  async getResult(attemptId) {
    await wait();
    const attempt = mockAttempts.get(attemptId);
    // 🔴 미제출 attempt 는 404 다. 로컬에서 채점해 채워 넣지 않는다.
    if (!attempt || !attempt.submitted) throw new ApiError("채점 결과가 없습니다.", 404, "RESOURCE_NOT_FOUND");
    return toResult(attempt);
  },
};

/** 테스트 전용 — mock attempt 상태를 비운다. */
export function resetMockQuizState() {
  mockAttempts.clear();
  mockAttemptByAssignment.clear();
  mockSubmitKeys.clear();
}

export const quizGateway = env.dataSource === "api" ? httpQuizGateway : mockQuizGateway;
export { httpQuizGateway, mockQuizGateway };
