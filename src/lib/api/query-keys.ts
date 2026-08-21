export const queryKeys = {
  student: {
    all: ["student"] as const,
    home: () => [...queryKeys.student.all, "home"] as const,
    records: (month?: string) => [...queryKeys.student.all, "records", { month }] as const,
    worksheets: () => [...queryKeys.student.all, "worksheets"] as const,
    worksheet: (worksheetId: string) => [...queryKeys.student.worksheets(), worksheetId] as const,
  },
  parent: {
    all: ["parent"] as const,
    home: (studentId: string) => [...queryKeys.parent.all, "home", studentId] as const,
    records: (studentId: string, month?: string) => [...queryKeys.parent.all, "records", studentId, { month }] as const,
    record: (studentId: string, recordId: string) => [...queryKeys.parent.all, "records", studentId, recordId] as const,
    analysis: (studentId: string) => [...queryKeys.parent.all, "analysis", studentId] as const,
    reports: (studentId: string, year?: number) => [...queryKeys.parent.all, "reports", studentId, { year }] as const,
    report: (studentId: string, reportId: string) => [...queryKeys.parent.all, "reports", studentId, reportId] as const,
  },
} as const;
