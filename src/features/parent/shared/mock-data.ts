import type { ParentAnalysisResponse, ParentNotification, ParentProfileResponse, ParentRecord, ParentReport } from "@/features/parent/model/types";

export const parentRecords: ParentRecord[] = [
  { id: "l1", date: "08.18", month: "2026-08", area: "화법과작문", title: "화법과작문 실전 모의", questionCount: 15, accuracy: 73, elapsed: "28:15", wrongCount: 3, trend: [{ label: "7/28", accuracy: 52 }, { label: "8/4", accuracy: 60 }, { label: "8/11", accuracy: 67 }, { label: "8/18", accuracy: 73 }], detail: { totalTime: "28분 15초", wrongTypeSummary: "추론형 2문항, 표현형 1문항", overtimeQuestionSummary: "3, 7번 문항" } },
  { id: "l2", date: "08.15", month: "2026-08", area: "언어·매체", title: "언어와 매체 핵심유형", questionCount: 12, accuracy: 58, elapsed: "24:40", wrongCount: 5, trend: [{ label: "7/25", accuracy: 49 }, { label: "8/1", accuracy: 55 }, { label: "8/8", accuracy: 61 }, { label: "8/15", accuracy: 58 }], detail: { totalTime: "24분 40초", wrongTypeSummary: "문법형 3문항, 매체형 2문항", overtimeQuestionSummary: "4, 9번 문항" } },
  { id: "l3", date: "08.12", month: "2026-08", area: "독서", title: "독서 비문학 빠른 독해", questionCount: 10, accuracy: 80, elapsed: "19:22", wrongCount: 2, trend: [{ label: "7/22", accuracy: 58 }, { label: "7/29", accuracy: 65 }, { label: "8/5", accuracy: 72 }, { label: "8/12", accuracy: 80 }], detail: { totalTime: "19분 22초", wrongTypeSummary: "추론형 2문항", overtimeQuestionSummary: "없음" } },
  { id: "l4", date: "08.08", month: "2026-08", area: "문학", title: "현대시 독해 집중훈련", questionCount: 10, accuracy: 70, elapsed: "20:05", wrongCount: 3, trend: [{ label: "7/18", accuracy: 50 }, { label: "7/25", accuracy: 57 }, { label: "8/1", accuracy: 64 }, { label: "8/8", accuracy: 70 }], detail: { totalTime: "20분 5초", wrongTypeSummary: "표현형 2문항, 개념형 1문항", overtimeQuestionSummary: "6번 문항" } },
];

export const accuracyTrend = [
  { label: "7/28", accuracy: 52 }, { label: "8/4", accuracy: 60 }, { label: "8/11", accuracy: 67 }, { label: "8/18", accuracy: 73 },
];

export const areaScores = [
  { area: "언어", score: 63 }, { area: "매체", score: 56 }, { area: "문학", score: 59 }, { area: "독서", score: 43 }, { area: "화법과작문", score: 71 },
];

const reportPdf = { url: "/reports/CheckOn-parent-report-2026-08.pdf", pageImageBasePath: "/reports/pages/report-", pageLabels: ["표지", "월간 분석", "선생님 의견", "주간 분석", "영역·유형별 성과", "진단 결과", "영역별 성취도"] };
export const parentReports: ParentReport[] = [
  { id: "r1", year: 2026, month: 8, studentName: "김민준", teacher: "박지은 선생님", pages: 7, issuedAt: "2026.08.19", isNew: true, studyPeriod: "2026.08.01 ~ 08.18", summary: { accuracy: 68, percentile: 71, priorityArea: "독서", sampleAsOf: "2026.08.31" }, pdf: reportPdf },
  { id: "r2", year: 2026, month: 7, studentName: "김민준", teacher: "박지은 선생님", pages: 7, issuedAt: "2026.07.20", isNew: false, studyPeriod: "2026.07.01 ~ 07.18", summary: { accuracy: 64, percentile: 66, priorityArea: "언어·매체", sampleAsOf: "2026.07.31" }, pdf: reportPdf },
  { id: "r3", year: 2026, month: 6, studentName: "김민준", teacher: "박지은 선생님", pages: 6, issuedAt: "2026.06.19", isNew: false, studyPeriod: "2026.06.01 ~ 06.17", summary: { accuracy: 61, percentile: 62, priorityArea: "문학", sampleAsOf: "2026.06.30" }, pdf: reportPdf },
];

export const parentAnalysis: ParentAnalysisResponse = {
  percentile: 71, accuracy: 68, changeFromPreviousMonth: 5, sampleAsOf: "2026.08.31", areaScores, accuracyTrend,
  primaryWeakness: { area: "독서", skill: "개념/지식", score: 43, description: "최근 4주 집중 보완 필요", studyFrequency: "주 1~2회 (비중 낮음)", averageTime: "문항당 3.2분 (전체 평균 2.1분)", evidenceQuestionCount: 12, relatedRecordId: "l3" },
};

export const parentProfile: ParentProfileResponse = { id: "parent-1", name: "이순영", maskedPhone: "010-XXXX-5678", notificationsEnabled: true, children: [{ id: "student-1", studentId: "STU-A41C", name: "김민준", grade: "고2", active: true }], teachers: [{ id: "teacher-1", name: "박지은 선생님", academy: "한울국어학원" }] };

export const parentNotifications: ParentNotification[] = [
  { id: "notification-1", type: "report", title: "8월 월별 보고서가 도착했어요", body: "박지은 선생님이 김민준 학생의 보고서를 발행했습니다.", createdAt: "오늘 14:20", read: false, href: "/parent/reports/r1" },
  { id: "notification-2", type: "learning", title: "이번 주 학습이 완료됐어요", body: "화법과작문 실전 모의 정답률은 73%입니다.", createdAt: "8월 18일", read: false },
];
