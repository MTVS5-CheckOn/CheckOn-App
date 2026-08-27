import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 🔴 로컬 채점 금지를 **소스 수준에서** 지킨다.
 *
 * 런타임 단언만으로는 잡히지 않는다 — 로컬 채점은 "서버와 같은 답을 내는 동안" 조용히 통과하고,
 * 서버 채점 규칙이 바뀌는 순간 화면이 거짓말을 시작한다.
 * 그래서 채점에 쓰이는 식별자가 풀이·제출 화면에 다시 나타나는지를 본다.
 */
function source(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

const SOLVING_SCREENS = [
  "src/features/student/quiz/submit-confirmation.tsx",
  "src/features/student/quiz/quiz-solver.tsx",
  "src/features/student/quiz/quiz-question-form.tsx",
];

describe("🔴 API 모드에서 프론트가 채점하지 않는다", () => {
  it.each(SOLVING_SCREENS)("%s 에 정답 판정 식별자가 없다", (path) => {
    const code = source(path);
    // 정답을 읽는 순간 미제출 상태에서 정답이 노출된다 (백엔드 절대 규칙 4).
    expect(code).not.toMatch(/\bcorrectAnswer\b/);
    expect(code).not.toMatch(/\bcorrectNo\b/);
    expect(code).not.toMatch(/\bcorrectCount\b/);
  });

  it("🔴 제출 화면이 학습기록 store 에 직접 저장하지 않는다", () => {
    const code = source("src/features/student/quiz/submit-confirmation.tsx");
    expect(code).not.toMatch(/saveRecord/);
    expect(code).not.toMatch(/useLearningRecordStore/);
  });

  it("🔴 하드코딩된 trend(52/61/68)가 남아 있지 않다", () => {
    for (const path of SOLVING_SCREENS) {
      const code = source(path);
      expect(code).not.toMatch(/accuracy:\s*52/);
      expect(code).not.toMatch(/accuracy:\s*61/);
      expect(code).not.toMatch(/accuracy:\s*68/);
    }
  });

  it("🔴 결과 화면은 서버 결과만 본다 — 세션 답안이나 기록 store 로 다시 세지 않는다", () => {
    const code = source("src/features/student/quiz/quiz-results.tsx");
    expect(code).not.toMatch(/useLearningRecordStore/);
    expect(code).not.toMatch(/useLearningRecordsQuery/);
    // 서버가 준 correctCount 를 그대로 구조 분해해 쓴다.
    expect(code).toMatch(/const \{ correctCount, itemCount, accuracyRate/);
  });

  it("🔴 풀이용 타입에 정답·해설 필드가 없다", () => {
    const code = source("src/features/student/quiz/types.ts");
    const solvingType = code.slice(code.indexOf("export type QuizQuestion"), code.indexOf("export type AttemptInProgress"));
    expect(solvingType).not.toMatch(/correct/);
    expect(solvingType).not.toMatch(/explanation/);
  });

  it("🔴 풀이용 mock 픽스처에도 정답이 실려 있지 않다", async () => {
    const { quizQuestionFixtures } = await import("@/features/student/quiz/mock-data");
    for (const question of quizQuestionFixtures) {
      const keys = Object.keys(question);
      expect(keys).not.toContain("correctAnswer");
      expect(keys).not.toContain("correctNo");
      expect(keys).not.toContain("explanation");
    }
  });
});

describe("🔴 zod 스키마에 .strict() 를 쓰지 않는다", () => {
  it("백엔드가 필드를 추가해도 앱 전체가 502 가 되지 않아야 한다", () => {
    const schemaFiles = [
      "src/lib/api/schemas.ts",
      "src/features/parent/api/schemas.ts",
      "src/features/student/api/schemas.ts",
      "src/features/student/quiz/schemas.ts",
    ];
    for (const path of schemaFiles) {
      expect(source(path)).not.toMatch(/\.strict\(\)/);
    }
  });
});

/**
 * 🔴 계약 suite 가 한쪽에만 걸리는 파괴는 **종료 코드로 잡히지 않는다.**
 * 테스트가 조용히 줄어들 뿐이라 `pnpm test` 는 exit 0 을 낸다.
 * 그래서 등록 자체를 단언한다 — 개수 비교에 기대지 않는다.
 */
describe("🔴 gateway 계약 suite 는 mock·HTTP 양쪽에 걸려 있어야 한다", () => {
  it("quiz gateway 계약이 두 번 등록된다", () => {
    const code = source("src/features/student/quiz/quiz-gateway.test.ts");
    const registrations = code.match(/runQuizGatewayContract\(/g) ?? [];
    // 한쪽만 걸면 mock 과 HTTP 가 갈라져도 아무도 모른다.
    expect(registrations.length).toBe(2);
    expect(code).toMatch(/runQuizGatewayContract\("mock"/);
    expect(code).toMatch(/runQuizGatewayContract\("http"/);
  });
});
