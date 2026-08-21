import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("http://localhost:8080/api/v1/sample", () => HttpResponse.json({ data: { id: "sample-1" }, meta: { requestId: "request-1" } })),
  http.get("http://localhost:8080/api/v1/failure", () => HttpResponse.json({ error: { code: "SAMPLE_ERROR", message: "실패 응답" } }, { status: 422 })),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("apiRequest", () => {
  it("공통 envelope의 data를 반환한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api");
    vi.resetModules();
    const { apiRequest } = await import("@/lib/api/client");
    await expect(apiRequest<{ id: string }>("/v1/sample")).resolves.toEqual({ id: "sample-1" });
  });

  it("오류 코드와 상태를 ApiError로 보존한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api");
    vi.resetModules();
    const { apiRequest } = await import("@/lib/api/client");
    await expect(apiRequest("/v1/failure")).rejects.toMatchObject({ status: 422, code: "SAMPLE_ERROR", message: "실패 응답" });
  });
});
