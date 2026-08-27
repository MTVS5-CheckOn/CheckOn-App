import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BASE = "http://localhost:8080/api/v1";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => { vi.unstubAllEnvs(); });

async function gateway() {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE);
  vi.stubEnv("NEXT_PUBLIC_API_RESPONSE_MODE", "wrapped");
  vi.resetModules();
  return (await import("@/features/student/quiz/api")).httpQuizGateway;
}

const VALID_RESULT = {
  attemptId: "a1", assignmentId: "w1", status: "SCORED",
  itemCount: 1, correctCount: 1, accuracyRate: 1, totalActiveElapsedSeconds: 30,
  items: [{ itemId: "i1", ordinal: 1, stem: "문항", options: [{ no: 1, text: "보기" }], selectedNo: 1, correctNo: 1, correct: true, explanation: "해설", activeElapsedSeconds: 30 }],
};

describe("🔴 zod 런타임 검증 — 계약과 다르면 거기서 터진다", () => {
  it("계약과 같은 응답은 통과한다", async () => {
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () => HttpResponse.json({ data: VALID_RESULT })));
    await expect((await gateway()).getResult("a1")).resolves.toMatchObject({ correctCount: 1, itemCount: 1 });
  });

  it("🔴 correctCount 가 빠지면 조용히 undefined 로 흐르지 않고 502 로 터진다", async () => {
    const { correctCount: _dropped, ...missing } = VALID_RESULT;
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () => HttpResponse.json({ data: missing })));
    await expect((await gateway()).getResult("a1")).rejects.toMatchObject({ status: 502, code: "INVALID_API_RESPONSE" });
  });

  it("🔴 타입이 다르면(accuracyRate 가 문자열) 502 로 터진다", async () => {
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () => HttpResponse.json({ data: { ...VALID_RESULT, accuracyRate: "1" } })));
    await expect((await gateway()).getResult("a1")).rejects.toMatchObject({ status: 502, code: "INVALID_API_RESPONSE" });
  });

  it("필수 필드가 통째로 없으면(빈 객체) 502 로 터진다", async () => {
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () => HttpResponse.json({ data: {} })));
    await expect((await gateway()).getResult("a1")).rejects.toMatchObject({ status: 502, code: "INVALID_API_RESPONSE" });
  });

  it("🔴 백엔드가 필드를 추가해도 통과한다 (.strict() 를 쓰지 않는 이유)", async () => {
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () =>
      HttpResponse.json({ data: { ...VALID_RESULT, brandNewFieldFromBackend: "안녕" } })));
    await expect((await gateway()).getResult("a1")).resolves.toMatchObject({ correctCount: 1 });
  });

  it("envelope 위반은 INVALID_API_RESPONSE 가 아니라 INVALID_API_ENVELOPE 다", async () => {
    server.use(http.get(`${BASE}/member/students/me/attempts/a1/result`, () => HttpResponse.json(VALID_RESULT)));
    await expect((await gateway()).getResult("a1")).rejects.toMatchObject({ status: 502, code: "INVALID_API_ENVELOPE" });
  });
});
