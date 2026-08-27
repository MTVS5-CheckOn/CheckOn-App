import { describe, expect, it } from "vitest";
import { consultationCancellationSupported, endpoints, isLegacyAuthPath, isMemberPath } from "@/lib/api/endpoints";

/** 모든 builder 를 호출해 (그룹, 이름, 결과 경로) 로 펼친다. 새 endpoint 도 자동으로 검사 대상이 된다. */
function everyPath() {
  const rows: { group: string; name: string; path: string }[] = [];
  for (const [group, builders] of Object.entries(endpoints)) {
    for (const [name, build] of Object.entries(builders as Record<string, (...args: string[]) => string>)) {
      // 인자 수만큼 자리표시자를 넣는다. 값 자체는 접두 검사에 영향을 주지 않는다.
      const args = Array.from({ length: build.length }, (_, index) => `arg${index}`);
      rows.push({ group, name, path: build(...args) });
    }
  }
  return rows;
}

describe("API 경로 단일 출처", () => {
  it("builder 를 하나도 빠뜨리지 않고 열거한다", () => {
    // 계약 46 오퍼레이션 중 이 앱이 쓰는 것 + legacy auth 3개.
    expect(everyPath().length).toBeGreaterThanOrEqual(45);
  });

  it.each(everyPath().filter((row) => row.group !== "legacyAuth"))(
    "🔴 $group.$name 은 member 경계를 지난다 ($path)",
    ({ path }) => {
      // 🔴 이 단언이 깨지면 백엔드에서 403 이 돌아온다.
      //    MemberSecurityConfiguration(@Order(0)) 이 /api/v1/member/** 만 매칭하고,
      //    벗어난 /api/v1/** 는 AccountSecurityConfiguration 의 hasRole("TEACHER") 로 떨어진다.
      expect(isMemberPath(path)).toBe(true);
    },
  );

  it.each(everyPath().filter((row) => row.group === "legacyAuth"))(
    "$group.$name 은 기존 계정 API 라 member 접두를 붙이지 않는다 ($path)",
    ({ path }) => {
      expect(isMemberPath(path)).toBe(false);
      expect(isLegacyAuthPath(path)).toBe(true);
    },
  );

  it("🔴 낡은 /v1/ 접두를 다시 만들지 않는다", () => {
    for (const { path } of everyPath()) expect(path.startsWith("/v1/")).toBe(false);
  });

  it("경로 조각을 URL 인코딩한다", () => {
    expect(endpoints.parent.home("a/b")).toContain("a%2Fb");
  });

  it("계약이 이름을 바꾼 세 곳을 지킨다", () => {
    // follow-ups → messages, notifications → notification-preference
    expect(endpoints.student.questionMessages("q")).toBe("/member/students/me/questions/q/messages");
    expect(endpoints.student.notificationPreference()).toBe("/member/students/me/profile/notification-preference");
    expect(endpoints.parent.notificationPreference()).toBe("/member/parents/me/profile/notification-preference");
  });

  it("🔴 상담 취소는 백엔드 미구현이라 꺼져 있다 (MB-09)", () => {
    expect(consultationCancellationSupported).toBe(false);
  });
});
