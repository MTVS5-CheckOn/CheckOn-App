/** 🔴 계약 AreaTag 5종의 표시 이름. "언어·매체" 는 mock 픽스처가 쓰던 옛 묶음 이름이다. */
export type ParentRecordArea = "문학" | "독서" | "화법과작문" | "언어" | "매체" | "언어·매체" | "기타";

export type ParentRecord = {
  id: string;
  date: string;
  month: string;
  area: ParentRecordArea;
  title: string;
  questionCount: number;
  accuracy: number;
  elapsed: string;
  wrongCount: number;
  trend: { label: string; accuracy: number }[];
  detail: {
    totalTime: string;
    wrongTypeSummary: string;
    overtimeQuestionSummary: string;
    baselineAccuracy: number;
    correctCount: number;
    reviewCount: number;
    repeatedMistakeCount: number;
    insight: string;
    skillResults: {
      skill: string;
      accuracy: number | null;
      questionCount: number;
      status: "stable" | "weak" | "insufficient";
    }[];
  };
};

export type ParentHomeResponse = {
  student: { id: string; name: string; period: string };
  metrics: { label: string; value: string; emphasis?: boolean }[];
  report: { id: string; month: string; title: string; issuedAt: string };
  recent: ParentRecord[];
};

export type ParentAnalysisResponse = {
  accuracy: number;
  baselineAccuracy: number;
  weaknessImprovement: number;
  comparisonMonth: string;
  analysisAsOf: string;
  gradedQuestionCount: number;
  reviewQuestionCount: number;
  repeatedMistakeCount: number;
  areaScores: { area: string; score: number }[];
  accuracyTrend: { label: string; accuracy: number }[];
  weeklySummary: {
    label: string;
    accuracy: number;
    questionCount: number;
    reviewCount: number;
    repeatedMistakes: number | null;
  }[];
  difficultyDistribution: { level: "하" | "중" | "상"; count: number }[];
  weaknessRanking: {
    rank: number;
    area: string;
    skill: string;
    accuracy: number;
    questionCount: number;
    /**
     * 🔴 계약의 `improvement.accuracyDeltaPp` — **전월 대비 퍼센트포인트**다.
     * 「자기 기준 대비」가 아니고, **양수면 개선**이다(43%→51% 은 +8.0).
     * 값을 낼 수 없으면(표본 부족 등) null 이다 — 0 으로 채우지 않는다.
     */
    accuracyDeltaPp: number | null;
    /** 판정에 쓴 최소 표본 수. `questionCount` 가 이보다 적으면 판단 보류다. */
    minimumSampleSize: number | null;
  }[];
  misconceptionSummary: { area: string; label: string; count: number }[];
  primaryWeakness: {
    area: string;
    skill: string;
    score: number;
    description: string;
    studyFrequency: string;
    averageTime: string;
    evidenceQuestionCount: number;
    previousMonthScore: number;
    repeatedMistakeCount: number;
    misconception: string;
    linkedWeaknesses: { label: string; relationScore: number }[];
    nextAction: string;
    relatedRecordId?: string;
  };
};

export type ParentReport = {
  id: string;
  year: number;
  month: number;
  studentName: string;
  teacher: string;
  issuedAt: string;
  isNew: boolean;
  studyPeriod: string;
  summary: {
    accuracy: number;
    weaknessImprovement: number;
    priorityArea: string;
    comparisonMonth: string;
    gradedQuestionCount: number;
    repeatedMistakeCount: number;
  };
  teacherComment: string;
  sections: { title: string; description: string; status: "available" | "insufficient" }[];
  /**
   * 🔴 PDF 는 아직 연결되지 않았다. `false` 가 계약상 정상 상태다.
   * 실제 파일은 POST .../reports/{id}/file-access 가 주는 수명 짧은 signed URL 로 연다
   * (`parent/api/file-gateway.ts`). URL 을 도메인 타입에 담아 캐시하지 않는다.
   */
  hasPdf: boolean;
};

export type ParentProfileResponse = {
  id: string;
  name: string;
  maskedPhone: string;
  notificationsEnabled: boolean;
  /** 🔴 studentId 는 UUID(경로용), studentPublicId 는 사용자에게 보이는 값. */
  children: { studentId: string; studentPublicId: string; name: string; grade: string; active: boolean }[];
  /** 🔴 `academy` 는 계약에 없다(백엔드 teacher_profiles 에 원본이 없음). `subject` 도 현재 항상 null. */
  teachers: { id: string; name: string; subject: string | null }[];
};

export type ParentNotification = {
  id: string;
  type: "report" | "consultation" | "question" | "learning" | "child";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  target: {
    studentId: string | null;
    resourceId: string | null;
  } | null;
};
