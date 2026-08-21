import type { ParentRecord } from "@/features/parent/shared/mock-data";

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
};

export type ParentReport = { id: string; year: number; month: number; teacher: string; pages: number; issuedAt: string; isNew: boolean };
export type ChildRegistrationRequest = { studentId: string };
export type ChildRegistrationResponse = { id: string; studentId: string; name: string; grade: string; active: boolean };
export type InviteRegistrationRequest = { code: string };
export type InviteRegistrationResponse = { id: string; name: string; academy: string };
