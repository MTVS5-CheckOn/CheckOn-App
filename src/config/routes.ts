export const ROUTES = {
  student: { home: "/student", records: "/student/records", questions: "/student/questions", profile: "/student/profile", worksheets: "/student/worksheets" },
  parent: { home: "/parent", records: "/parent/records", analysis: "/parent/analysis", reports: "/parent/reports", profile: "/parent/profile" },
  auth: { studentLogin: "/student/login", parentLogin: "/parent/login" },
} as const;

export type AppRoute = (typeof ROUTES.student)[keyof typeof ROUTES.student] | (typeof ROUTES.parent)[keyof typeof ROUTES.parent] | (typeof ROUTES.auth)[keyof typeof ROUTES.auth];
