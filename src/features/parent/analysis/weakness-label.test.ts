import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { toParentAnalysis } from "@/features/parent/api/adapters";

/**
 * 🔴 계약의 `status: AVAILABLE` 은 **「지표를 산출할 수 있다」**는 뜻이지
 * 「약점이다」가 아니다. 그 둘을 같은 것으로 번역하면 100% 짜리도 약점이 된다.
 *
 * 계약에는 「몇 %p 낮으면 약점」이라는 임계값이 없다. 만들면 지어낸 값이다.
 * 그래서 배지를 두지 않고 **순서**로 말한다 — 섹션 제목이 이미 「먼저 보완할 순서」다.
 */
const cell = (over: Record<string, unknown> = {}) => ({
  areaTag: "language" as const,
  typeTag: "concept" as const,
  status: "AVAILABLE" as const,
  scoredCount: 9,
  correctCount: 9,
  accuracyRate: 1,
  improvement: { status: "INSUFFICIENT_SAMPLE" as const, minimumSampleSize: 10 },
  ...over,
});

const analysis = (ranking: ReturnType<typeof cell>[], primary: ReturnType<typeof cell> | null = null) =>
  toParentAnalysis({
    month: "2026-08",
    overall: { status: "AVAILABLE", accuracyRate: 0.75, scoredCount: 40 },
    weaknessRanking: ranking,
    primaryWeakness: primary,
  });

describe("🔴 「약점 확정」 라벨을 만들지 않는다", () => {
  it("화면에 「약점 확정」 배지가 없다 — 임계값이 계약에 없으므로 순서로만 말한다", () => {
    const code = readFileSync(resolve(process.cwd(), "src/features/parent/analysis/parent-analysis.tsx"), "utf8");
    const ranking = code.slice(code.indexOf("먼저 보완할 순서"), code.indexOf("</section>", code.indexOf("먼저 보완할 순서")));
    expect(ranking).not.toMatch(/약점 확정/);
    expect(ranking).not.toMatch(/더 확인/);
    // 표본 미달만 「판단 보류」로 말한다.
    expect(ranking).toMatch(/판단 보류/);
    expect(ranking).toMatch(/minimumSampleSize/);
  });

  it("🔴 status:AVAILABLE 을 「약점」으로 번역하지 않는다", () => {
    const result = analysis([cell()]);
    const row = result.weaknessRanking[0];
    // 도메인에 「confirmed/watch」 같은 약점 판정 필드가 있으면 안 된다.
    expect(Object.keys(row)).not.toContain("status");
    expect(Object.keys(row)).not.toContain("gapFromBaseline");
    expect(row.accuracy).toBe(100);
    expect(row.minimumSampleSize).toBe(10);
  });

  it("🔴 accuracyDeltaPp 는 전월 대비이고, 낼 수 없으면 null 이다 — 0 으로 채우지 않는다", () => {
    // 표본 부족이면 서버가 deltaPp 를 주지 않는다. 0 으로 채우면 「변화 없음」이라는 없는 사실이 된다.
    expect(analysis([cell()]).weaknessRanking[0].accuracyDeltaPp).toBeNull();
    // 양수는 개선이다. 43%→51% 은 +8.0.
    const improved = cell({ accuracyRate: 0.9, scoredCount: 10, improvement: { status: "AVAILABLE", accuracyDeltaPp: 10, minimumSampleSize: 10 } });
    expect(analysis([improved]).weaknessRanking[0].accuracyDeltaPp).toBe(10);
  });

  it("🔴 표본 미달 셀은 1순위 후보에서 뺀다 — 9문항짜리가 1순위가 되면 안 된다", () => {
    const under = cell({ scoredCount: 9 });
    const enough = cell({ areaTag: "literature", typeTag: "infer", accuracyRate: 0.5, scoredCount: 12, correctCount: 6,
      improvement: { status: "AVAILABLE", accuracyDeltaPp: 13.6, minimumSampleSize: 10 } });
    // 서버가 primaryWeakness 를 주지 않을 때의 대체 선택.
    expect(analysis([under, enough]).primaryWeakness.area).toBe("문학");
  });

  it("서버가 primaryWeakness 를 주면 그것을 쓴다", () => {
    const primary = cell({ areaTag: "literature", typeTag: "infer", accuracyRate: 0.5, scoredCount: 12 });
    expect(analysis([cell()], primary).primaryWeakness.area).toBe("문학");
  });
});
