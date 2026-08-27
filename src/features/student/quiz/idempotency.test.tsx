import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStartAttemptMutation, useSubmitAttemptMutation } from "@/features/student/quiz/queries";
import * as quizApi from "@/features/student/quiz/api";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => { vi.restoreAllMocks(); });

describe("🔴 Idempotency-Key 는 재시도 사이에 유지된다", () => {
  it("제출이 실패해 다시 눌러도 같은 키가 나간다", async () => {
    const keys: string[] = [];
    vi.spyOn(quizApi.quizGateway, "submit").mockImplementation(async (_attemptId, _request, key) => {
      keys.push(key);
      // 첫 시도는 실패시켜 사용자가 다시 누르는 상황을 만든다.
      if (keys.length === 1) throw new Error("네트워크 오류");
      return { attemptId: "a1", assignmentId: "w1", status: "SUBMITTED", version: 2, submittedAt: "2026-08-28T00:00:00Z" };
    });

    const { result } = renderHook(() => useSubmitAttemptMutation("a1"), { wrapper });

    await result.current.mutateAsync({ baseVersion: 1 }).catch(() => undefined);
    await result.current.mutateAsync({ baseVersion: 1 }).catch(() => undefined);

    expect(keys).toHaveLength(2);
    // 🔴 여기가 깨지면 서버가 두 번 채점한다.
    expect(keys[0]).toBe(keys[1]);
  });

  it("성공하면 키를 버리고, 다음 제출은 새 키를 쓴다", async () => {
    const keys: string[] = [];
    vi.spyOn(quizApi.quizGateway, "submit").mockImplementation(async (_attemptId, _request, key) => {
      keys.push(key);
      return { attemptId: "a1", assignmentId: "w1", status: "SUBMITTED", version: 2, submittedAt: "2026-08-28T00:00:00Z" };
    });

    const { result } = renderHook(() => useSubmitAttemptMutation("a1"), { wrapper });
    await result.current.mutateAsync({ baseVersion: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await result.current.mutateAsync({ baseVersion: 2 });

    expect(keys).toHaveLength(2);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it("attempt 시작도 재시도 사이에 같은 키를 쓴다 — attempt 가 두 개 생기면 안 된다", async () => {
    const keys: string[] = [];
    vi.spyOn(quizApi.quizGateway, "startAttempt").mockImplementation(async (assignmentId, key) => {
      keys.push(key);
      if (keys.length === 1) throw new Error("네트워크 오류");
      return {
        attemptId: "a1", assignmentId, status: "IN_PROGRESS", version: 1,
        totalActiveElapsedSeconds: 0, answers: {}, activeElapsedSecondsByItem: {}, items: [],
      };
    });

    const { result } = renderHook(() => useStartAttemptMutation(), { wrapper });
    await result.current.mutateAsync("w1").catch(() => undefined);
    await result.current.mutateAsync("w1").catch(() => undefined);

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });
});
