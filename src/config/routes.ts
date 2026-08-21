export const ROUTES = {
  student: { home: "/student", records: "/student/records", questions: "/student/questions", profile: "/student/profile", worksheets: "/student/worksheets" },
  parent: { home: "/parent", records: "/parent/records", analysis: "/parent/analysis", reports: "/parent/reports", consultations: "/parent/consultations", profile: "/parent/profile", notifications: "/parent/notifications" },
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
    parentSignup: "/parent/signup",
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
    record: (recordId: string) => `/student/records/${recordId}`,
    question: (questionId: string) => `/student/questions/${questionId}`,
    newQuestion: (worksheetId?: string) => worksheetId ? `/student/questions/new?worksheetId=${worksheetId}` : "/student/questions/new",
    questionComplete: (questionId: string, returnTo?: string) => `/student/questions/complete?questionId=${questionId}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`,
    inviteCode: () => "/student/profile/invite",
  },
  parent: {
    record: (recordId: string) => `/parent/records/${recordId}`,
    weakness: (area: string) => `/parent/analysis/${encodeURIComponent(area)}`,
    report: (reportId: string) => `/parent/reports/${reportId}`,
    reportPdf: (reportId: string) => `/parent/reports/${reportId}/pdf`,
    consultation: (consultationId: string) => `/parent/consultations/${consultationId}`,
    newConsultation: (context?: { type: "record" | "analysis" | "report"; id: string; label: string; detail?: string }) => {
      if (!context) return "/parent/consultations/new";
      const params = new URLSearchParams({ contextType: context.type, contextId: context.id, contextLabel: context.label });
      if (context.detail) params.set("contextDetail", context.detail);
      return `/parent/consultations/new?${params.toString()}`;
    },
    confirmConsultation: () => "/parent/consultations/confirm",
    consultationComplete: (consultationId: string) => `/parent/consultations/complete?consultationId=${encodeURIComponent(consultationId)}`,
    childRegister: () => "/parent/profile/children/new",
    inviteCode: () => "/parent/profile/invite",
  },
} as const;
