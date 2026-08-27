export type ParentRecordArea = "문학" | "독서" | "화법과작문" | "언어·매체";

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
    gapFromBaseline: number;
    status: "confirmed" | "watch";
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
  pages: number;
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
  pdf: { url: string; pageImageBasePath: string; pageLabels: string[] };
};

export type ParentProfileResponse = {
  id: string;
  name: string;
  maskedPhone: string;
  notificationsEnabled: boolean;
  children: { id: string; studentId: string; name: string; grade: string; active: boolean }[];
  teachers: { id: string; name: string; academy: string }[];
};

export type ParentNotification = {
  id: string;
  type: "report" | "learning" | "consultation";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};
