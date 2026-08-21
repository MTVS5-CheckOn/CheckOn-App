export type WorksheetSummary = { id: string; area: string; status: "신규" | "진행 중"; title: string; meta: string; completed?: number; total?: number };
export const studentHomeData = {
  weakness: { area: "독서 · 추론형 독해", accuracy: 43, description: "최근 2주간 정답률 43% — 집중 보완이 필요해요" },
  today: [
    { id: "w1", area: "문학", status: "신규", title: "현대시 독해 집중훈련", meta: "10문항 · 약 20분" },
    { id: "w2", area: "독서", status: "진행 중", title: "독서 추론·전개 유형", meta: "8문항 · 약 18분" },
  ] satisfies WorksheetSummary[],
  continuing: { id: "w3", area: "독서", status: "진행 중", title: "독서 추론·전개 유형", meta: "3 / 8문항 완료", completed: 3, total: 8 } satisfies WorksheetSummary,
};
