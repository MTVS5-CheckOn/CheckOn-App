import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { runQuizGatewayContract } from "@/lib/api/gateway-contract";
import { mockQuizGateway, resetMockQuizState } from "@/features/student/quiz/api";
import { quizQuestionFixtures, scoreMockAttempt } from "@/features/student/quiz/mock-data";

const BASE = "http://localhost:8080/api/v1";

// ── 서버를 흉내 내는 MSW 상태 ───────────────────────────────────────────────
type ServerAttempt = { assignmentId: string; version: number; answers: Record<string, number>; submitted: boolean; sequences: Set<number>; submitKey: string | null };
const attempts = new Map<string, ServerAttempt>();
const byAssignment = new Map<string, string>();
const items = quizQuestionFixtures.slice(0, 5);

const server = setupServer(
  http.post(`${BASE}/member/students/me/worksheets/:assignmentId/attempts`, ({ params }) => {
    const assignmentId = String(params.assignmentId);
    const existingId = byAssignment.get(assignmentId);
    const existing = existingId ? attempts.get(existingId) : undefined;
    if (existing && !existing.submitted) {
      // 🔴 재개는 200 이다.
      return HttpResponse.json({ data: inProgress(existingId!, existing) }, { status: 200 });
    }
    const attemptId = `attempt-${assignmentId}`;
    const attempt: ServerAttempt = { assignmentId, version: 1, answers: {}, submitted: false, sequences: new Set(), submitKey: null };
    attempts.set(attemptId, attempt);
    byAssignment.set(assignmentId, attemptId);
    // 🔴 신규는 201 이다. 둘 다 성공으로 처리되어야 한다.
    return HttpResponse.json({ data: inProgress(attemptId, attempt) }, { status: 201 });
  }),

  http.get(`${BASE}/member/students/me/attempts/:attemptId`, ({ params }) => {
    const attemptId = String(params.attemptId);
    const attempt = attempts.get(attemptId);
    if (!attempt) return HttpResponse.json({ error: { code: "RESOURCE_NOT_FOUND" } }, { status: 404 });
    return HttpResponse.json({ data: attempt.submitted ? result(attemptId, attempt) : inProgress(attemptId, attempt) });
  }),

  http.patch(`${BASE}/member/students/me/attempts/:attemptId/progress`, async ({ params, request }) => {
    const attemptId = String(params.attemptId);
    const attempt = attempts.get(attemptId);
    if (!attempt) return HttpResponse.json({ error: { code: "RESOURCE_NOT_FOUND" } }, { status: 404 });
    const body = (await request.json()) as { clientSequence: number; baseVersion: number; answers?: Record<string, number> };
    if (attempt.sequences.has(body.clientSequence)) {
      return HttpResponse.json({ data: { attemptId, version: attempt.version, totalActiveElapsedSeconds: 0, duplicated: true } });
    }
    attempt.sequences.add(body.clientSequence);
    Object.assign(attempt.answers, body.answers ?? {});
    attempt.version += 1;
    return HttpResponse.json({ data: { attemptId, version: attempt.version, totalActiveElapsedSeconds: 0, duplicated: false } });
  }),

  http.post(`${BASE}/member/students/me/attempts/:attemptId/submission`, async ({ params, request }) => {
    const attemptId = String(params.attemptId);
    const attempt = attempts.get(attemptId);
    if (!attempt) return HttpResponse.json({ error: { code: "RESOURCE_NOT_FOUND" } }, { status: 404 });
    const key = request.headers.get("idempotency-key");
    if (attempt.submitted && attempt.submitKey !== key) {
      return HttpResponse.json({ error: { code: "ATTEMPT_ALREADY_SUBMITTED" } }, { status: 409 });
    }
    if (!attempt.submitted) {
      const body = (await request.json()) as { answers?: Record<string, number> };
      Object.assign(attempt.answers, body.answers ?? {});
      attempt.submitted = true;
      attempt.version += 1;
      attempt.submitKey = key;
    }
    return HttpResponse.json({ data: { attemptId, assignmentId: attempt.assignmentId, status: "SUBMITTED", version: attempt.version, submittedAt: "2026-08-28T00:00:00Z" } });
  }),

  http.get(`${BASE}/member/students/me/attempts/:attemptId/result`, ({ params }) => {
    const attemptId = String(params.attemptId);
    const attempt = attempts.get(attemptId);
    // 🔴 미제출 attempt 는 404 다.
    if (!attempt || !attempt.submitted) return HttpResponse.json({ error: { code: "RESOURCE_NOT_FOUND" } }, { status: 404 });
    return HttpResponse.json({ data: result(attemptId, attempt) });
  }),
);

/** 🔴 계약대로 정답·해설을 넣지 않는다. 서버가 감추는 값을 테스트가 흘리면 의미가 없다. */
function inProgress(attemptId: string, attempt: ServerAttempt) {
  return {
    attemptId, assignmentId: attempt.assignmentId, status: "IN_PROGRESS", version: attempt.version,
    totalActiveElapsedSeconds: 0, answers: attempt.answers, activeElapsedSecondsByItem: {}, items,
  };
}

function result(attemptId: string, attempt: ServerAttempt) {
  const scored = scoreMockAttempt(items, attempt.answers, {});
  const correctCount = scored.filter((item) => item.correct).length;
  return {
    attemptId, assignmentId: attempt.assignmentId, status: "SCORED",
    itemCount: scored.length, correctCount, accuracyRate: correctCount / scored.length,
    totalActiveElapsedSeconds: 0, items: scored,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  attempts.clear();
  byAssignment.clear();
  resetMockQuizState();
});

async function httpGateway() {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE);
  vi.stubEnv("NEXT_PUBLIC_API_RESPONSE_MODE", "wrapped");
  vi.resetModules();
  const module = await import("@/features/student/quiz/api");
  return module.httpQuizGateway;
}

// 🔴 같은 suite 를 mock 과 HTTP 양쪽에서 돌린다.
describe("QuizGateway 계약 — mock", () => {
  runQuizGatewayContract("mock", () => mockQuizGateway, { network: false });
});

describe("QuizGateway 계약 — HTTP (MSW)", () => {
  let gateway: Awaited<ReturnType<typeof httpGateway>>;
  beforeEach(async () => { gateway = await httpGateway(); });
  runQuizGatewayContract("http", () => gateway, { network: true });
});

describe("🔴 미제출 응답 누출 방지", () => {
  it("MSW 가 흉내 내는 서버 응답에도 정답 키가 없다", () => {
    const attempt: ServerAttempt = { assignmentId: "a", version: 1, answers: {}, submitted: false, sequences: new Set(), submitKey: null };
    const payload = inProgress("x", attempt);
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("correctNo");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("correctAnswer");
  });
});
