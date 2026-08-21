export type ParentRecord = {
  id: string; date: string; month: string; area: "문학" | "독서" | "화법과작문" | "언어·매체";
  title: string; questionCount: number; accuracy: number; elapsed: string; wrongCount: number;
};

export const parentRecords: ParentRecord[] = [
  { id: "l1", date: "08.18", month: "2026-08", area: "화법과작문", title: "화법과작문 실전 모의", questionCount: 15, accuracy: 73, elapsed: "28:15", wrongCount: 3 },
  { id: "l2", date: "08.15", month: "2026-08", area: "언어·매체", title: "언어와 매체 핵심유형", questionCount: 12, accuracy: 58, elapsed: "24:40", wrongCount: 5 },
  { id: "l3", date: "08.12", month: "2026-08", area: "독서", title: "독서 비문학 빠른 독해", questionCount: 10, accuracy: 80, elapsed: "19:22", wrongCount: 2 },
  { id: "l4", date: "08.08", month: "2026-08", area: "문학", title: "현대시 독해 집중훈련", questionCount: 10, accuracy: 70, elapsed: "20:05", wrongCount: 3 },
];

export const accuracyTrend = [
  { label: "7/28", accuracy: 52 }, { label: "8/4", accuracy: 60 }, { label: "8/11", accuracy: 67 }, { label: "8/18", accuracy: 73 },
];

export const areaScores = [
  { area: "언어", score: 63 }, { area: "매체", score: 56 }, { area: "문학", score: 59 }, { area: "독서", score: 43 }, { area: "화법과작문", score: 71 },
];

export const parentReports = [
  { id: "r1", year: 2026, month: 8, teacher: "박지은 선생님", pages: 7, issuedAt: "2026.08.19", isNew: true },
  { id: "r2", year: 2026, month: 7, teacher: "박지은 선생님", pages: 7, issuedAt: "2026.07.20", isNew: false },
  { id: "r3", year: 2026, month: 6, teacher: "박지은 선생님", pages: 6, issuedAt: "2026.06.19", isNew: false },
];
