import type { ParentReport } from "@/features/parent/model/types";

/** 시연 전용 고정 보고서. 실제 API 파일 접근이 연결되면 제거한다. */
export const PARK_SEOYEON_DEMO_REPORT_ID = "demo-park-seoyeon-2026-08";
export const PARK_SEOYEON_DEMO_PDF_URL = "/reports/CheckOn-parent-report-2026-08.pdf";

export const parkSeoyeonDemoReport: ParentReport = {
  id: PARK_SEOYEON_DEMO_REPORT_ID,
  year: 2026,
  month: 8,
  studentName: "박서연",
  teacher: "김검온 선생님",
  issuedAt: "2026.08.20",
  isNew: true,
  studyPeriod: "2026.08.01 ~ 2026.08.18",
  summary: {
    accuracy: 75,
    weaknessImprovement: 13.6,
    priorityArea: "문학 · 추론",
    comparisonMonth: "2026년 7월",
    gradedQuestionCount: 40,
    repeatedMistakeCount: 0,
  },
  teacherComment: "7월보다 정답률이 높아졌고 언어·개념과 독서·사실 확인이 안정적입니다. 다음 학습에서는 문학·추론을 우선 보완합니다.",
  sections: [
    { title: "월간 분석", description: "정답률·채점 문항·지난달 대비 약점 개선도", status: "available" },
    { title: "선생님 의견", description: "DB 학습 기록에 근거한 이번 달 요약", status: "available" },
    { title: "주간 분석", description: "학습 흐름·다시 볼 문항·최근 변화", status: "available" },
    { title: "영역·유형별 성과", description: "영역과 문제 유형을 교차한 정확도", status: "available" },
    { title: "진단 결과", description: "대표 강점과 우선 보완 영역", status: "available" },
    { title: "영역별 성취도", description: "학생 본인의 이번 달 평균을 기준으로 비교", status: "available" },
  ],
  hasPdf: true,
};

export const isParkSeoyeonDemoReport = (reportId: string) => reportId === PARK_SEOYEON_DEMO_REPORT_ID;
