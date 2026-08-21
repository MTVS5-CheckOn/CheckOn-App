import type { Worksheet } from "@/features/student/worksheets/types";

export const worksheetFixtures: Worksheet[] = [
  { id: "l1", title: "현대시 독해 집중훈련", description: "현대시 독해 능력 강화 및 정서·태도 파악 훈련", area: "문학", questionCount: 10, estimatedMinutes: 20, status: "new", reviewedByTeacher: true },
  { id: "l2", title: "독서 추론·전개 유형", description: "독서 지문의 추론과 전개 방식 집중 보완", area: "독서", questionCount: 8, estimatedMinutes: 18, status: "in_progress", reviewedByTeacher: true },
  { id: "l3", title: "화법과작문 실전 모의", description: "화법과 작문 실전 유형별 약점 보완", area: "화법과작문", questionCount: 15, estimatedMinutes: 30, status: "completed", accuracy: 73, reviewedByTeacher: true },
  { id: "l4", title: "언어와 매체 핵심유형", description: "문법 개념과 매체 자료 해석 핵심 훈련", area: "언어·매체", questionCount: 12, estimatedMinutes: 25, status: "completed", accuracy: 58, reviewedByTeacher: true },
];
