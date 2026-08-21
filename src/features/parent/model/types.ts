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
  };
};

export type ParentHomeResponse = {
  student: { id: string; name: string; period: string };
  metrics: { label: string; value: string; emphasis?: boolean }[];
  report: { id: string; month: string; title: string; issuedAt: string };
  recent: ParentRecord[];
};

export type ParentAnalysisResponse = {
  percentile: number;
  accuracy: number;
  changeFromPreviousMonth: number;
  sampleAsOf: string;
  areaScores: { area: string; score: number }[];
  accuracyTrend: { label: string; accuracy: number }[];
  primaryWeakness: {
    area: string;
    skill: string;
    score: number;
    description: string;
    studyFrequency: string;
    averageTime: string;
    evidenceQuestionCount: number;
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
  summary: { accuracy: number; percentile: number; priorityArea: string; sampleAsOf: string };
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
