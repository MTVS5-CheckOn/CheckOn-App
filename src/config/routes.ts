export const ROUTES = {
  student: { home: "/student", records: "/student/records", questions: "/student/questions", profile: "/student/profile", worksheets: "/student/worksheets" },
  parent: { home: "/parent", records: "/parent/records", analysis: "/parent/analysis", reports: "/parent/reports", profile: "/parent/profile" },
  auth: {
    studentLoading: "/student/loading",
    studentOnboarding: "/student/onboarding",
    studentLogin: "/student/login",
    studentSignupTerms: "/student/signup/terms",
    studentSignupInfo: "/student/signup/info",
    studentSignupComplete: "/student/signup/complete",
    studentActivationPending: "/student/activation-pending",
    studentActivationComplete: "/student/activation-complete",
    parentLogin: "/parent/login",
  },
} as const;

export type AppRoute = (typeof ROUTES.student)[keyof typeof ROUTES.student] | (typeof ROUTES.parent)[keyof typeof ROUTES.parent] | (typeof ROUTES.auth)[keyof typeof ROUTES.auth];

export const routeBuilders = {
  student: {
    worksheet: (worksheetId: string) => `/student/worksheets/${worksheetId}`,
    solveWorksheet: (worksheetId: string) => `/student/worksheets/${worksheetId}/solve`,
    worksheetQuestion: (worksheetId: string) => `/student/worksheets/${worksheetId}/solve/question`,
    submitWorksheet: (worksheetId: string) => `/student/worksheets/${worksheetId}/submit`,
    worksheetResults: (worksheetId: string) => `/student/worksheets/${worksheetId}/results`,
  },
} as const;
