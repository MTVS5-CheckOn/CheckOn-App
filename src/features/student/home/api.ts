import { env } from "@/config/env";
import { studentHomeData } from "@/features/student/home/model";
import { apiRequest } from "@/lib/api/client";

export type StudentHomeResponse = typeof studentHomeData;
export interface StudentHomeGateway { get(): Promise<StudentHomeResponse>; }
const mockStudentHomeGateway: StudentHomeGateway = { async get() { await new Promise((resolve) => setTimeout(resolve, 150)); return studentHomeData; } };
const httpStudentHomeGateway: StudentHomeGateway = { get: () => apiRequest("/v1/students/me/home") };
export const studentHomeGateway = env.dataSource === "api" ? httpStudentHomeGateway : mockStudentHomeGateway;
