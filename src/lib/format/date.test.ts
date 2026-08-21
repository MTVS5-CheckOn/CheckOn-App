import { describe, expect, it } from "vitest";
import { formatMonthLabel, getTodayLearningDate } from "@/lib/format/date";

describe("date formatter", () => {
  it("API 월 키를 한국어 라벨로 표시한다", () => expect(formatMonthLabel("2026-08")).toBe("2026년 8월"));
  it("학습 완료 시각은 한국 시간으로 저장한다", () => expect(getTodayLearningDate(new Date("2026-08-21T15:30:00Z"))).toEqual({ date: "2026.08.22", month: "2026-08" }));
});
