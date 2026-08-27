import { expect, it } from "vitest";
import type { QuizGateway } from "@/features/student/quiz/api";

/**
 * gateway 계약 suite.
 *
 * 🔴 mock 과 HTTP 양쪽에 **같은 함수를 두 번** 호출한다.
 * 한쪽에만 걸면 mock 과 HTTP 가 서로 다른 모양으로 갈라져도 아무도 모른다.
 * 그러면 화면이 env.dataSource 분기를 갖게 되고, 그 분기는 테스트되지 않는다.
 */
export function runQuizGatewayContract(name: string, factory: () => QuizGateway, options: { network: boolean }) {
  const assignmentId = "assignment-contract";

  it(`[${name}] attempt 를 시작하면 풀이용 문항이 온다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    expect(attempt.status).toBe("IN_PROGRESS");
    expect(attempt.items.length).toBeGreaterThan(0);
    expect(attempt.version).toBeGreaterThan(0);
  });

  it(`[${name}] 🔴 미제출 문항에 정답·해설이 실려 오지 않는다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    for (const item of attempt.items) {
      const keys = Object.keys(item);
      expect(keys).not.toContain("correctNo");
      expect(keys).not.toContain("correct");
      expect(keys).not.toContain("explanation");
      expect(keys).not.toContain("correctAnswer");
    }
  });

  it(`[${name}] 🔴 재개는 같은 attempt 를 돌려준다 (신규 201 · 재개 200 둘 다 성공)`, async () => {
    const gateway = factory();
    const first = await gateway.startAttempt(assignmentId, "key-1");
    const second = await gateway.startAttempt(assignmentId, "key-2");
    expect(second.attemptId).toBe(first.attemptId);
  });

  it(`[${name}] 🔴 미제출 attempt 의 결과 조회는 404 다 — 로컬 채점으로 채우지 않는다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    await expect(gateway.getResult(attempt.attemptId)).rejects.toMatchObject({ status: 404 });
  });

  it(`[${name}] 제출하면 서버가 채점한 결과가 온다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    const answers = Object.fromEntries(attempt.items.map((item) => [item.itemId, 2]));
    await gateway.submit(attempt.attemptId, { baseVersion: attempt.version, answers }, "submit-key");
    const result = await gateway.getResult(attempt.attemptId);
    expect(result.status).toBe("SCORED");
    expect(result.itemCount).toBe(attempt.items.length);
    // 🔴 correctCount 는 서버가 준 값이다. 화면이 다시 세지 않는다.
    expect(typeof result.correctCount).toBe("number");
    // 🔴 accuracyRate 는 0~1 이다.
    expect(result.accuracyRate).toBeGreaterThanOrEqual(0);
    expect(result.accuracyRate).toBeLessThanOrEqual(1);
    expect(result.items.every((item) => typeof item.correct === "boolean")).toBe(true);
    expect(result.items.every((item) => typeof item.explanation === "string")).toBe(true);
  });

  it(`[${name}] 🔴 같은 Idempotency-Key 로 두 번 제출해도 두 번 채점되지 않는다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    const answers = Object.fromEntries(attempt.items.map((item) => [item.itemId, 2]));
    const key = "same-submit-key";
    await gateway.submit(attempt.attemptId, { baseVersion: attempt.version, answers }, key);
    // 재클릭 — 같은 키라 오류 없이 같은 결과여야 한다.
    await expect(gateway.submit(attempt.attemptId, { baseVersion: attempt.version, answers }, key)).resolves.toMatchObject({ status: "SUBMITTED" });
    const result = await gateway.getResult(attempt.attemptId);
    expect(result.itemCount).toBe(attempt.items.length);
  });

  it(`[${name}] 진행 저장은 같은 clientSequence 재전송을 멱등 처리한다`, async () => {
    const gateway = factory();
    const attempt = await gateway.startAttempt(assignmentId, "key-1");
    const first = await gateway.saveProgress(attempt.attemptId, { baseVersion: attempt.version, clientSequence: 1, answers: {} });
    const again = await gateway.saveProgress(attempt.attemptId, { baseVersion: attempt.version, clientSequence: 1, answers: {} });
    expect(again.duplicated).toBe(true);
    expect(again.version).toBe(first.version);
  });

  if (options.network) {
    it(`[${name}] 네트워크 계층 — 존재하지 않는 attempt 는 404 다`, async () => {
      const gateway = factory();
      await expect(gateway.getAttempt("missing-attempt")).rejects.toMatchObject({ status: 404 });
    });
  } else {
    // 🔴 skip 사유를 남긴다. 조용히 빼지 않는다.
    it.skip(`[${name}] 네트워크 계층 검사 — mock gateway 는 HTTP 를 타지 않으므로 해당 없음`, () => undefined);
  }
}
