import { beforeAll, describe, expect, it } from "vitest";

/**
 * 실제 백엔드에 붙는 계약 확인.
 *
 * 🔴 기본은 skip 이다. mock 으로만 확인하면 계약과 실제 응답의 차이를 영원히 못 본다.
 * 백엔드를 띄운 뒤 이렇게 돌린다:
 *
 *   CHECKON_LIVE_BACKEND=1 pnpm test -- --run src/lib/api/live-backend.test.ts
 *
 * (선택) CHECKON_LIVE_BASE_URL 로 base URL 을 바꿀 수 있다. 기본 http://localhost:8080/api/v1
 */
const LIVE = process.env.CHECKON_LIVE_BACKEND === "1";
const BASE = process.env.CHECKON_LIVE_BASE_URL ?? "http://localhost:8080/api/v1";

const describeLive = LIVE ? describe : describe.skip;

async function json(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

const stamp = Date.now();
const parentEmail = `pr10-live-parent-${stamp}@example.com`;
const studentEmail = `pr10-live-student-${stamp}@example.com`;
const password = "Password123!";

describeLive("실제 백엔드 계약 확인", () => {
  let parentToken = "";
  let studentToken = "";
  let studentPublicId = "";

  beforeAll(async () => {
    await json("/member/auth/parents/sign-up", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ email: parentEmail, password, name: "라이브학부모", termsAgreed: true }),
    });
    const parentLogin = await json("/auth/login", { method: "POST", body: JSON.stringify({ email: parentEmail, password }) });
    parentToken = parentLogin.body.data.accessToken;

    const signUp = await json("/member/auth/students/sign-up", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ email: studentEmail, password, name: "라이브학생", grade: 2, termsAgreed: true }),
    });
    studentPublicId = signUp.body.data.studentPublicId;

    const studentLogin = await json("/member/auth/students/login", { method: "POST", body: JSON.stringify({ studentPublicId, password }) });
    studentToken = studentLogin.body.data.accessToken;

    await json("/member/parents/me/children", {
      method: "POST",
      headers: { Authorization: `Bearer ${parentToken}`, "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ studentPublicId }),
    });
  }, 60_000);

  it("🔴 member 조각이 빠진 경로는 403 이다 — 이게 경로를 한 곳에서 만드는 이유다", async () => {
    const withMember = await json("/member/parents/me/profile", { headers: { Authorization: `Bearer ${parentToken}` } });
    const withoutMember = await json("/parents/me/profile", { headers: { Authorization: `Bearer ${parentToken}` } });
    expect(withMember.status).toBe(200);
    expect(withoutMember.status).toBe(403);
  });

  it("학부모 로그인은 member 경로가 아니라 기존 /auth/login 이다", async () => {
    const legacy = await json("/auth/login", { method: "POST", body: JSON.stringify({ email: parentEmail, password }) });
    expect(legacy.status).toBe(200);
    expect(typeof legacy.body.data.accessToken).toBe("string");
    // 🔴 계약대로 account.teacherProfileId 는 학부모면 null 이다.
    expect(legacy.body.data.account.teacherProfileId ?? null).toBeNull();
  });

  it("실제 응답이 프론트 zod 스키마를 통과한다 (학부모)", async () => {
    const { parentProfileSchema, parentNotificationPageSchema } = await import("@/features/parent/api/schemas");
    const profile = await json("/member/parents/me/profile", { headers: { Authorization: `Bearer ${parentToken}` } });
    expect(parentProfileSchema.safeParse(profile.body.data).success).toBe(true);

    const notifications = await json("/member/parents/me/notifications", { headers: { Authorization: `Bearer ${parentToken}` } });
    expect(parentNotificationPageSchema.safeParse(notifications.body.data).success).toBe(true);
  });

  it("실제 응답이 프론트 zod 스키마를 통과한다 (학생)", async () => {
    const { studentHomeSchema, studentProfileSchema, worksheetPageSchema, studentRecordPageSchema } =
      await import("@/features/student/api/schemas");
    const auth = { Authorization: `Bearer ${studentToken}` };

    const home = await json("/member/students/me/home", { headers: auth });
    expect(studentHomeSchema.safeParse(home.body.data).success).toBe(true);

    const profile = await json("/member/students/me/profile", { headers: auth });
    expect(studentProfileSchema.safeParse(profile.body.data).success).toBe(true);

    const worksheets = await json("/member/students/me/worksheets", { headers: auth });
    expect(worksheetPageSchema.safeParse(worksheets.body.data).success).toBe(true);

    const records = await json("/member/students/me/learning-records", { headers: auth });
    expect(studentRecordPageSchema.safeParse(records.body.data).success).toBe(true);
  });

  it("🔴 세션 응답이 계약 모양이다", async () => {
    const { memberSessionSchema } = await import("@/lib/api/schemas");
    const session = await json("/member/auth/session", { headers: { Authorization: `Bearer ${parentToken}` } });
    expect(memberSessionSchema.safeParse(session.body.data).success).toBe(true);
  });

  it("🔴 이미 연결된 자녀 재등록은 CHILD_ALREADY_LINKED(409) 다", async () => {
    const again = await json("/member/parents/me/children", {
      method: "POST",
      headers: { Authorization: `Bearer ${parentToken}`, "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ studentPublicId }),
    });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("CHILD_ALREADY_LINKED");
  });

  it("🔴 학부모가 학생 API 를 치면 403 이다 (역할 격리)", async () => {
    const crossed = await json("/member/students/me/home", { headers: { Authorization: `Bearer ${parentToken}` } });
    expect(crossed.status).toBe(403);
  });

  it("🔴 상담 취소는 백엔드가 열지 않았다 — 프론트가 호출하지 않는 이유", async () => {
    const { consultationCancellationSupported } = await import("@/lib/api/endpoints");
    expect(consultationCancellationSupported).toBe(false);
  });
});
