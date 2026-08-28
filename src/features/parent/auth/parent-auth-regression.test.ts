import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("학부모 로그인 전 보호 API 회귀 방지", () => {
  it("인증 화면에서는 프로필과 알림 조회를 실행하지 않는다", () => {
    const shell = read("src/components/layout/parent-shell.tsx");
    expect(shell).toMatch(/useParentProfileQuery\(\{ enabled: !isAuthRoute \}\)/);
    expect(shell).toMatch(/useParentNotificationsQuery\(\{ enabled: !isAuthRoute \}\)/);
  });

  it("로그인 성공 시 이전 학부모 캐시를 제거한 뒤 홈으로 이동한다", () => {
    const mutations = read("src/features/auth/mutations.ts");
    const login = read("src/features/parent/auth/parent-auth.tsx");
    expect(mutations).toMatch(/removeQueries\(\{ queryKey: queryKeys\.parent\.all \}\)/);
    expect(login).toMatch(/router\.replace\(ROUTES\.parent\.home\)/);
  });

  it("공개 로그인 화면은 자기 자신으로 다시 보내지 않는다", () => {
    const providers = read("src/app/providers.tsx");
    expect(providers).toMatch(/if \(isPublicPath\(pathname\)\) return/);
  });
});
