export const queryKeys = {
  student: {
    all: ["student"] as const,
    home: () => [...queryKeys.student.all, "home"] as const,
    records: (month?: string) => [...queryKeys.student.all, "records", { month }] as const,
  },
  parent: {
    all: ["parent"] as const,
    home: (studentId: string) => [...queryKeys.parent.all, "home", studentId] as const,
    reports: (studentId: string, month?: string) => [...queryKeys.parent.all, "reports", studentId, { month }] as const,
  },
} as const;
