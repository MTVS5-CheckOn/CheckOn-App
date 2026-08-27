import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BASE = "http://localhost:8080/api/v1";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** 매 테스트마다 모듈 스코프 상태(토큰·single-flight)를 새로 만든다. */
async function freshClient() {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE);
  vi.stubEnv("NEXT_PUBLIC_API_RESPONSE_MODE", "wrapped");
  vi.resetModules();
  const [client, session, tokenStore] = await Promise.all([
    import("@/lib/api/client"),
    import("@/lib/api/session"),
    import("@/lib/api/token-store"),
  ]);
  return { ...client, ...session, ...tokenStore };
}

beforeEach(() => { vi.unstubAllEnvs(); });

describe("apiRequest — envelope", () => {
  it("정상: 공통 envelope 의 data 를 반환한다", async () => {
    server.use(http.get(`${BASE}/member/students/me/home`, () => HttpResponse.json({ data: { id: "sample-1" }, meta: { requestId: "r1" } })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest<{ id: string }>("/member/students/me/home")).resolves.toEqual({ id: "sample-1" });
  });

  it("envelope 위반(data 없음) → INVALID_API_ENVELOPE", async () => {
    server.use(http.get(`${BASE}/member/students/me/home`, () => HttpResponse.json({ id: "no-envelope" })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 502, code: "INVALID_API_ENVELOPE" });
  });

  it("빈 목록은 오류가 아니다", async () => {
    server.use(http.get(`${BASE}/member/parents/me/notifications`, () => HttpResponse.json({ data: { items: [], nextCursor: null, hasNext: false } })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/parents/me/notifications")).resolves.toEqual({ items: [], nextCursor: null, hasNext: false });
  });
});

describe("apiRequest — 오류 코드", () => {
  it("400 코드와 상태를 ApiError 로 보존하고 재시도하지 않는다", async () => {
    let calls = 0;
    server.use(http.get(`${BASE}/member/students/me/home`, () => {
      calls += 1;
      return HttpResponse.json({ error: { code: "INVALID_REQUEST", message: "잘못된 요청" } }, { status: 400 });
    }));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 400, code: "INVALID_REQUEST" });
    expect(calls).toBe(1);
  });

  it("429 RATE_LIMITED 를 보존한다", async () => {
    server.use(http.get(`${BASE}/member/students/me/home`, () => HttpResponse.json({ error: { code: "RATE_LIMITED" } }, { status: 429 })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
  });

  it("🔴 403 ROLE_FORBIDDEN 을 그대로 올린다 — 경로에서 member 가 빠지면 이 코드가 온다", async () => {
    server.use(http.get(`${BASE}/parents/me/profile`, () => HttpResponse.json({ error: { code: "ROLE_FORBIDDEN", message: "권한이 없습니다." } }, { status: 403 })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/parents/me/profile")).rejects.toMatchObject({ status: 403, code: "ROLE_FORBIDDEN" });
  });

  it("403 STUDENT_ACTIVATION_REQUIRED 를 보존한다", async () => {
    server.use(http.get(`${BASE}/member/students/me/home`, () => HttpResponse.json({ error: { code: "STUDENT_ACTIVATION_REQUIRED" } }, { status: 403 })));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 403, code: "STUDENT_ACTIVATION_REQUIRED" });
  });

  it("🔴 계약에 없는 옛 코드는 계약 코드로 정규화된다", async () => {
    server.use(http.post(`${BASE}/member/parents/me/children/verification`, () => HttpResponse.json({ error: { code: "STUDENT_NOT_FOUND" } }, { status: 404 })));
    const { apiRequest } = await freshClient();
    // readiness 문서가 쓰던 STUDENT_NOT_FOUND 는 계약 enum 에 없다 → RESOURCE_NOT_FOUND
    await expect(apiRequest("/member/parents/me/children/verification", { method: "POST" }))
      .rejects.toMatchObject({ status: 404, code: "RESOURCE_NOT_FOUND" });
  });
});

describe("apiRequest — 401 과 single-flight refresh", () => {
  it("401 → refresh 성공 → 원 요청 1회 재시도", async () => {
    let refreshCalls = 0;
    let dataCalls = 0;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => { refreshCalls += 1; return HttpResponse.json({ data: { accessToken: "new-token" } }); }),
      http.get(`${BASE}/member/students/me/home`, () => {
        dataCalls += 1;
        if (dataCalls === 1) return HttpResponse.json({ error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 });
        return HttpResponse.json({ data: { ok: true } });
      }),
    );
    const { apiRequest, readAccessToken } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).resolves.toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
    expect(dataCalls).toBe(2);
    expect(readAccessToken()).toBe("new-token");
  });

  it("🔴 재시도한 요청이 또 401 이면 refresh 를 다시 부르지 않는다 (무한 루프 방지)", async () => {
    let refreshCalls = 0;
    let dataCalls = 0;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => { refreshCalls += 1; return HttpResponse.json({ data: { accessToken: "new-token" } }); }),
      http.get(`${BASE}/member/students/me/home`, () => {
        dataCalls += 1;
        return HttpResponse.json({ error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 });
      }),
    );
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 401 });
    expect(refreshCalls).toBe(1);
    expect(dataCalls).toBe(2);
  });

  it("refresh 실패 → 토큰 null + notifyUnauthorized 1회", async () => {
    let unauthorized = 0;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 })),
      http.get(`${BASE}/member/students/me/home`, () => HttpResponse.json({ error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 })),
    );
    const { apiRequest, readAccessToken, registerUnauthorizedHandler, setAccessToken } = await freshClient();
    setAccessToken("stale");
    registerUnauthorizedHandler(() => { unauthorized += 1; });
    await expect(apiRequest("/member/students/me/home")).rejects.toMatchObject({ status: 401 });
    expect(readAccessToken()).toBeNull();
    expect(unauthorized).toBe(1);
  });

  it("🔴 동시 401 ×5 → refresh 요청은 정확히 1회다", async () => {
    let refreshCalls = 0;
    const failedOnce = new Set<string>();
    server.use(
      http.post(`${BASE}/auth/refresh`, async () => {
        refreshCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({ data: { accessToken: "new-token" } });
      }),
      http.get(`${BASE}/member/parents/me/children/:id/home`, ({ params }) => {
        const key = String(params.id);
        if (!failedOnce.has(key)) {
          failedOnce.add(key);
          return HttpResponse.json({ error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 });
        }
        return HttpResponse.json({ data: { id: key } });
      }),
    );
    const { apiRequest } = await freshClient();
    const results = await Promise.all(
      ["a", "b", "c", "d", "e"].map((id) => apiRequest<{ id: string }>(`/member/parents/me/children/${id}/home`)),
    );
    expect(results.map((result) => result.id)).toEqual(["a", "b", "c", "d", "e"]);
    // 🔴 single-flight 가 깨지면 여기가 5 가 된다.
    expect(refreshCalls).toBe(1);
  });
});

describe("apiRequest — 전송", () => {
  it("메모리 토큰이 Authorization 헤더로 붙는다", async () => {
    let auth: string | null = null;
    server.use(http.get(`${BASE}/member/students/me/home`, ({ request }) => {
      auth = request.headers.get("authorization");
      return HttpResponse.json({ data: {} });
    }));
    const { apiRequest, registerAccessTokenReader, setAccessToken, readAccessToken } = await freshClient();
    registerAccessTokenReader(readAccessToken);
    setAccessToken("token-abc");
    await apiRequest("/member/students/me/home");
    expect(auth).toBe("Bearer token-abc");
  });

  it("Idempotency-Key 헤더를 그대로 보낸다", async () => {
    let key: string | null = null;
    server.use(http.post(`${BASE}/member/students/me/attempts/a1/submission`, ({ request }) => {
      key = request.headers.get("idempotency-key");
      return HttpResponse.json({ data: {} });
    }));
    const { apiRequest } = await freshClient();
    await apiRequest("/member/students/me/attempts/a1/submission", { method: "POST", headers: { "Idempotency-Key": "fixed-key" } });
    expect(key).toBe("fixed-key");
  });

  it("timeout → REQUEST_TIMEOUT(408)", async () => {
    server.use(http.get(`${BASE}/member/students/me/home`, async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return HttpResponse.json({ data: {} });
    }));
    const { apiRequest } = await freshClient();
    await expect(apiRequest("/member/students/me/home", { timeoutMs: 20 }))
      .rejects.toMatchObject({ status: 408, code: "REQUEST_TIMEOUT" });
  });
});
