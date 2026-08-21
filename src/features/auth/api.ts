import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";

export type AppRole = "student" | "parent";
export type LoginInput = { role: AppRole; loginId: string; password: string };
export type SignupInput = { role: AppRole; name: string; email?: string; password: string; grade?: string };
export type AuthSession = { userId: string; role: AppRole; accountStatus: "active" | "inactive" };
export type StudentActivationResponse = { studentId: string; name: string; grade: string; accountStatus: "active" | "inactive" };
export interface AuthGateway { login(input: LoginInput): Promise<AuthSession>; signup(input: SignupInput): Promise<AuthSession>; logout(): Promise<void>; getStudentActivationStatus(): Promise<StudentActivationResponse>; }
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
const mockAuthGateway: AuthGateway = {
  async login({ role }) { await wait(); return { userId: role === "student" ? "student-1" : "parent-1", role, accountStatus: role === "student" ? useStudentAuthStore.getState().status : "active" }; },
  async signup({ role }) { await wait(); return { userId: `${role}-${Date.now()}`, role, accountStatus: role === "student" ? "inactive" : "active" }; },
  async logout() { await wait(); },
  async getStudentActivationStatus() { await wait(); const state = useStudentAuthStore.getState(); return { studentId: state.studentId, name: state.name, grade: state.grade, accountStatus: state.status }; },
};
const httpAuthGateway: AuthGateway = {
  login: (input) => apiRequest("/v1/auth/login", { method: "POST", body: input }),
  signup: (input) => apiRequest(`/v1/auth/${input.role}/signup`, { method: "POST", body: input }),
  logout: () => apiRequest("/v1/auth/logout", { method: "POST" }),
  getStudentActivationStatus: () => apiRequest("/v1/auth/student/activation-status"),
};
export const authGateway = env.dataSource === "api" ? httpAuthGateway : mockAuthGateway;
