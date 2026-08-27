import { env } from "@/config/env";
import { studentHomeData, type StudentHomeResponse } from "@/features/student/home/model";
import { toStudentHome } from "@/features/student/api/adapters";
import { studentHomeSchema } from "@/features/student/api/schemas";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { parseApiResponse } from "@/lib/api/validate";

export type { StudentHomeResponse };
export interface StudentHomeGateway { get(): Promise<StudentHomeResponse>; }

const mockStudentHomeGateway: StudentHomeGateway = {
  async get() { await new Promise((resolve) => setTimeout(resolve, 150)); return studentHomeData; },
};

const httpStudentHomeGateway: StudentHomeGateway = {
  get: async () => toStudentHome(parseApiResponse(studentHomeSchema, await apiRequest(endpoints.student.home()), "student.home")),
};

export const studentHomeGateway = env.dataSource === "api" ? httpStudentHomeGateway : mockStudentHomeGateway;
