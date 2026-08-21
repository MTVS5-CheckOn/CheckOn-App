import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";

export type AppRole = "student" | "parent";
export type LoginInput = { role: AppRole; loginId: string; password: string };
export type SignupInput = { role: AppRole; name: string; email?: string; password: string; grade?: string };
export type AuthSession = { userId: string; role: AppRole; accountStatus: "active" | "inactive" };
export interface AuthGateway { login(input: LoginInput): Promise<AuthSession>; signup(input: SignupInput): Promise<AuthSession>; logout(): Promise<void>; }
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
const mockAuthGateway: AuthGateway = {
  async login({ role }) { await wait(); return { userId: role === "student" ? "student-1" : "parent-1", role, accountStatus: "active" }; },
  async signup({ role }) { await wait(); return { userId: `${role}-${Date.now()}`, role, accountStatus: role === "student" ? "inactive" : "active" }; },
  async logout() { await wait(); },
};
const httpAuthGateway: AuthGateway = {
  login: (input) => apiRequest("/v1/auth/login", { method: "POST", body: input }),
  signup: (input) => apiRequest(`/v1/auth/${input.role}/signup`, { method: "POST", body: input }),
  logout: () => apiRequest("/v1/auth/logout", { method: "POST" }),
};
export const authGateway = env.dataSource === "api" ? httpAuthGateway : mockAuthGateway;
