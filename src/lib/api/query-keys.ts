/**
 * 🔴 목록 키에 cursor·필터·정렬을 포함한다.
 * 빠뜨리면 서로 다른 페이지·필터가 같은 캐시를 덮어쓴다.
 */
export type ListParams = { cursor?: string | null; limit?: number; month?: string; year?: number; sort?: string };

const list = (params: ListParams = {}) => ({
  cursor: params.cursor ?? null,
  limit: params.limit ?? null,
  month: params.month ?? null,
  year: params.year ?? null,
  sort: params.sort ?? null,
});

export const queryKeys = {
  session: () => ["session"] as const,
  student: {
    all: ["student"] as const,
    home: () => [...queryKeys.student.all, "home"] as const,
    records: (params?: ListParams) => [...queryKeys.student.all, "records", list(params)] as const,
    record: (recordId: string) => [...queryKeys.student.all, "records", recordId] as const,
    worksheets: (params?: ListParams) => [...queryKeys.student.all, "worksheets", list(params)] as const,
    worksheet: (worksheetId: string) => [...queryKeys.student.all, "worksheets", worksheetId] as const,
    attempt: (attemptId: string) => [...queryKeys.student.all, "attempts", attemptId] as const,
    attemptResult: (attemptId: string) => [...queryKeys.student.all, "attempts", attemptId, "result"] as const,
    questions: (params?: ListParams) => [...queryKeys.student.all, "questions", list(params)] as const,
    question: (questionId: string) => [...queryKeys.student.all, "questions", questionId] as const,
    profile: () => [...queryKeys.student.all, "profile"] as const,
    activation: () => [...queryKeys.student.all, "activation"] as const,
  },
  parent: {
    all: ["parent"] as const,
    home: (studentId: string) => [...queryKeys.parent.all, "home", studentId] as const,
    records: (studentId: string, params?: ListParams) => [...queryKeys.parent.all, "records", studentId, list(params)] as const,
    record: (studentId: string, recordId: string) => [...queryKeys.parent.all, "records", studentId, recordId] as const,
    analysis: (studentId: string, month: string) => [...queryKeys.parent.all, "analysis", studentId, month] as const,
    analysisWeakness: (studentId: string, areaTag: string, typeTag: string, month: string) =>
      [...queryKeys.parent.all, "analysis", studentId, "weaknesses", areaTag, typeTag, month] as const,
    reports: (studentId: string, params?: ListParams) => [...queryKeys.parent.all, "reports", studentId, list(params)] as const,
    report: (studentId: string, reportId: string) => [...queryKeys.parent.all, "reports", studentId, reportId] as const,
    consultations: (studentId: string, params?: ListParams) => [...queryKeys.parent.all, "consultations", studentId, list(params)] as const,
    consultation: (studentId: string, consultationId: string) =>
      [...queryKeys.parent.all, "consultations", studentId, "detail", consultationId] as const,
    children: () => [...queryKeys.parent.all, "children"] as const,
    profile: () => [...queryKeys.parent.all, "profile"] as const,
    notifications: (params?: ListParams) => [...queryKeys.parent.all, "notifications", list(params)] as const,
  },
} as const;
