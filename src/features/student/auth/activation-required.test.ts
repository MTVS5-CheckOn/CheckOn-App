import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { isActivationRequired } from "@/features/student/auth/activation-required-notice";

/**
 * 🔴 대기 학생은 학습 화면 5곳에서 403 STUDENT_ACTIVATION_REQUIRED 를 받는다.
 * 그건 실패가 아니라 "아직 활성화 전"이다 — 「불러오지 못했어요」로 그리면 거짓말이다.
 */
const SCREENS = [
  "src/features/student/home/student-home.tsx",
  "src/features/student/worksheets/worksheet-list.tsx",
  "src/features/student/records/learning-record-list.tsx",
  "src/features/student/questions/question-list.tsx",
  "src/features/student/profile/student-profile.tsx",
];

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("🔴 대기 학생에게 오류 화면 대신 안내 화면을 보여준다", () => {
  it("403 STUDENT_ACTIVATION_REQUIRED 만 활성화 안내로 판정한다", () => {
    expect(isActivationRequired(new ApiError("x", 403, "STUDENT_ACTIVATION_REQUIRED"))).toBe(true);
    // 진짜 실패는 안내로 감추지 않는다 — 그것도 거짓말이다.
    expect(isActivationRequired(new ApiError("x", 500, "INTERNAL"))).toBe(false);
    expect(isActivationRequired(new ApiError("x", 403, "ROLE_FORBIDDEN"))).toBe(false);
    expect(isActivationRequired(new Error("boom"))).toBe(false);
  });

  it.each(SCREENS)("%s 이 활성화 안내를 건다", (path) => {
    const code = read(path);
    expect(code).toMatch(/isActivationRequired\(error\)/);
    expect(code).toMatch(/<ActivationRequiredNotice/);
  });
});
