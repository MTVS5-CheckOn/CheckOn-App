import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { toStudentRecordDetail } from "@/features/student/api/adapters";

/**
 * 🔴 제목만 있고 비어 있는 카드를 두지 않는다 — 「로딩이 덜 됐나」로 보인다.
 *
 * 백엔드가 채우지 않는 것이 둘 있다(실측):
 * · weaknessStatus 가 항상 NO_DATA (StudentLearningRecordQueryService:122)
 * · 학습기록 items 가 빈 배열 (itemCount 는 10 인데 items·itemIds 는 [])
 * 값이 오면 그대로 그리고, 없으면 그 카드/섹션을 렌더링하지 않는다.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const SCREEN = "src/features/student/records/learning-record-detail.tsx";

const detail = (over: Record<string, unknown> = {}) => toStudentRecordDetail({
  recordId: "r1", title: "독서", occurredAt: "2026-08-25T00:00:00Z",
  itemCount: 10, correctCount: 9, accuracyRate: 0.9,
  itemIds: [], weaknessStatus: "NO_DATA",
  ...over,
});

describe("🔴 빈 카드를 렌더링하지 않는다", () => {
  it("weaknessStatus 가 NO_DATA 면 약점 값이 비어 있다", () => {
    const record = detail();
    expect(record.weakness).toBe("");
    expect(record.weaknessDescription).toBe("");
  });

  it("items 가 없으면 문항 목록도 비어 있다 — itemIds 로 만들어내지 않는다", () => {
    // 🔴 itemCount 가 10 이어도 문항 본문이 없으면 문항을 지어내지 않는다.
    expect(detail().questions).toEqual([]);
  });

  it("약점 카드가 값이 있을 때만 그려진다", () => {
    expect(read(SCREEN)).toMatch(/\{record\.weakness \?/);
  });

  it("문항 목록·필터가 문항이 있을 때만 그려진다", () => {
    expect(read(SCREEN)).toMatch(/\{record\.questions\.length \?/);
  });

  it("값이 오면 그대로 그린다", () => {
    const record = detail({
      weakness: { status: "AVAILABLE", areaTag: "reading", description: "근거 문장 찾기가 약합니다" },
      items: [{ itemId: "i1", itemNo: 1, stem: "문항", selectedNo: 1, correctNo: 1, correct: true, explanation: "해설", activeElapsedSeconds: 30 }],
    });
    expect(record.weakness).toBe("독서");
    expect(record.weaknessDescription).toBe("근거 문장 찾기가 약합니다");
    expect(record.questions).toHaveLength(1);
  });
});
