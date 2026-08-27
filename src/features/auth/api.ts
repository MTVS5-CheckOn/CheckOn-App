import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createIdempotencyKey, idempotencyHeaders } from "@/lib/api/idempotency";
import {
  memberAuthResultSchema,
  memberSessionSchema,
  signUpResultSchema,
  studentActivationSchema,
  type MemberAuthResult,
  type MemberSession,
  type SignUpResult,
  type StudentActivation,
} from "@/lib/api/schemas";
import { parseApiResponse } from "@/lib/api/validate";
import { setAccessToken } from "@/lib/api/token-store";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";

export type AppRole = "student" | "parent";

/**
 * 🔴 로그인은 role 로 갈린다 (MB-01 CONFIRMED, member-api.yaml:20-22).
 * · 학생  — POST /api/v1/member/auth/students/login  (공개 학생 ID + 비밀번호)
 * · 학부모 — POST /api/v1/auth/login                  (이메일 + 비밀번호, 기존 API)
 * 응답 `data` 모양은 양쪽이 같다(MemberAuthResult).
 */
export type LoginInput =
  | { role: "student"; studentPublicId: string; password: string }
  | { role: "parent"; email: string; password: string };

export type SignupInput =
  | { role: "student"; email: string; password: string; name: string; grade: number; termsAgreed: boolean; marketingAgreed?: boolean }
  | { role: "parent"; email: string; password: string; name: string; termsAgreed: boolean; marketingAgreed?: boolean };

export type { MemberAuthResult, MemberSession, SignUpResult, StudentActivation };

export interface AuthGateway {
  login(input: LoginInput): Promise<MemberAuthResult>;
  signup(input: SignupInput): Promise<SignUpResult>;
  logout(): Promise<void>;
  /** 앱 bootstrap — 현재 계정·프로필·활성화 상태 */
  getSession(): Promise<MemberSession>;
  getStudentActivationStatus(): Promise<StudentActivation>;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 250));

const MOCK_TOKEN = "mock-access-token";

const mockAuthGateway: AuthGateway = {
  async login(input) {
    await wait();
    return {
      accessToken: MOCK_TOKEN,
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      account: {
        id: input.role === "student" ? "student-1" : "parent-1",
        role: input.role === "student" ? "STUDENT" : "PARENT",
        email: input.role === "parent" ? input.email : undefined,
        teacherProfileId: null,
      },
    };
  },
  async signup(input) {
    await wait();
    return {
      accountId: `${input.role}-${input.email}`,
      role: input.role === "student" ? "STUDENT" : "PARENT",
      studentPublicId: input.role === "student" ? "STU-B52D9K" : null,
      activationStatus: input.role === "student" ? "PENDING_PARENT_LINK" : null,
    };
  },
  async logout() { await wait(); },
  async getSession() {
    await wait();
    const state = useStudentAuthStore.getState();
    return {
      accountId: "student-1",
      role: "STUDENT",
      name: state.name,
      studentProfileId: "student-1",
      parentProfileId: null,
      activationStatus: state.status === "active" ? "ACTIVE" : "PENDING_PARENT_LINK",
      studentPublicId: state.studentId,
      teachers: [],
      notificationsEnabled: true,
    };
  },
  async getStudentActivationStatus() {
    await wait();
    const state = useStudentAuthStore.getState();
    return {
      status: state.status === "active" ? "ACTIVE" : "PENDING_PARENT_LINK",
      studentPublicId: state.studentId,
      activatedAt: null,
    };
  },
};

const httpAuthGateway: AuthGateway = {
  async login(input) {
    // 🔴 문자열 조립으로 role 경로를 만들지 않는다. 학부모는 member 경로가 아니다.
    const path = input.role === "student" ? endpoints.memberAuth.studentLogin() : endpoints.legacyAuth.login();
    const body = input.role === "student"
      ? { studentPublicId: input.studentPublicId, password: input.password }
      : { email: input.email, password: input.password };
    const result = parseApiResponse(memberAuthResultSchema, await apiRequest(path, { method: "POST", body }), "login");
    // 🔴 메모리에만 둔다. localStorage 금지.
    setAccessToken(result.accessToken);
    return result;
  },
  async signup(input) {
    const path = input.role === "student" ? endpoints.memberAuth.studentSignUp() : endpoints.memberAuth.parentSignUp();
    const body = input.role === "student"
      ? { email: input.email, password: input.password, name: input.name, grade: input.grade, termsAgreed: input.termsAgreed, marketingAgreed: input.marketingAgreed ?? false }
      : { email: input.email, password: input.password, name: input.name, termsAgreed: input.termsAgreed, marketingAgreed: input.marketingAgreed ?? false };
    return parseApiResponse(
      signUpResultSchema,
      await apiRequest(path, { method: "POST", body, headers: idempotencyHeaders(createIdempotencyKey()) }),
      "signup",
    );
  },
  async logout() {
    // 🔴 member 는 logout 을 만들지 않는다. 기존 /api/v1/auth/logout 을 쓴다.
    await apiRequest(endpoints.legacyAuth.logout(), { method: "POST" });
    setAccessToken(null);
  },
  async getSession() {
    return parseApiResponse(memberSessionSchema, await apiRequest(endpoints.memberAuth.session()), "session");
  },
  async getStudentActivationStatus() {
    return parseApiResponse(
      studentActivationSchema,
      await apiRequest(endpoints.memberAuth.studentActivationStatus()),
      "activation-status",
    );
  },
};

export const authGateway = env.dataSource === "api" ? httpAuthGateway : mockAuthGateway;
