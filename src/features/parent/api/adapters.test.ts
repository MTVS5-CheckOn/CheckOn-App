import { describe, expect, it } from "vitest";
import { toParentRecord, toParentReport } from "@/features/parent/api/adapters";
import { parentRecords, parentReports } from "@/features/parent/shared/mock-data";

describe("parent API adapters", () => {
  it("학습기록의 중첩 배열을 화면 모델과 분리한다", () => {
    const dto = parentRecords[0];
    const model = toParentRecord(dto);
    expect(model).toEqual(dto);
    expect(model.trend).not.toBe(dto.trend);
    expect(model.detail).not.toBe(dto.detail);
  });

  it("PDF 페이지 라벨을 복제해 서버 응답 변경을 막는다", () => {
    const dto = parentReports[0];
    const model = toParentReport(dto);
    model.pdf.pageLabels.push("추가");
    expect(dto.pdf.pageLabels).not.toContain("추가");
  });
});
