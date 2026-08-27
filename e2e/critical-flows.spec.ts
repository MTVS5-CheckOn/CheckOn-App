import { expect, test } from "@playwright/test";

const DATA_SOURCE = process.env.E2E_DATA_SOURCE ?? "mock";
const mockOnly = DATA_SOURCE === "mock" ? test : test.skip;

/** 기존 2건은 mock 모드용이다. 지우지 않고 describe 로 나눈다. */
test.describe("mock 모드 — 핵심 화면", () => {
  mockOnly("학생 홈에서 오늘의 학습으로 진입한다", async ({ page }) => {
    await page.goto("/student");
    await expect(page.getByText("오늘의 학습")).toBeVisible();
    await page.getByRole("link", { name: /현대시 독해 집중훈련/ }).click();
    await expect(page).toHaveURL(/\/student\/worksheets\//);
  });

  mockOnly("학부모가 상담 요청 화면에 진입한다", async ({ page }) => {
    await page.goto("/parent/consultations");
    await page.getByRole("link", { name: "상담 요청", exact: true }).click();
    await expect(page).toHaveURL(/\/parent\/consultations\/new/);
    await expect(page.getByText(/상담 내용은 접수 후 자동 분류/)).toBeVisible();
  });

  mockOnly("🔴 상담 요청은 담당 선생님을 고르게 한다 (계약 required teacherId)", async ({ page }) => {
    await page.goto("/parent/consultations/new");
    // 🔴 계약이 teacherId 를 요구하므로 화면이 선생님을 고르게 해야 한다.
    await expect(page.getByRole("combobox").nth(1)).toBeVisible();
    await expect(page.getByRole("option", { name: "선생님을 선택하세요" })).toBeAttached();
  });
});

/**
 * 🔴 proxy 회귀 — 미들웨어가 쿠키를 다시 보기 시작하는지만 본다.
 *
 * 브라우저로 열면 클라이언트 인증 게이트가(로그인 안 된 상태라) 정상적으로 로그인으로 보낸다.
 * 그건 버그가 아니다. 우리가 막으려는 건 **미들웨어가** 리다이렉트하는 것이다 —
 * CHECKON_REFRESH 는 Path=/api/v1/auth 라 Next 라우트로 전송되지 않아
 * 쿠키 판정은 언제나 "로그인 안 됨"이 되고, 로그인해도 앱에 들어갈 수 없게 된다.
 * 그래서 JS 를 실행하지 않는 순수 요청으로 미들웨어만 검사한다.
 */
test.describe("proxy 회귀", () => {
  for (const route of ["/student/records", "/parent/reports", "/student/worksheets", "/parent/analysis"]) {
    test(`🔴 미들웨어가 ${route} 를 로그인으로 돌려보내지 않는다`, async ({ request }) => {
      const response = await request.get(route, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      expect(response.headers().location ?? "").not.toMatch(/login/);
    });
  }
});

/**
 * 🔴 비어 있는 게 정상인 화면.
 * API 모드에서 서버 응답을 고정해 빈 상태가 오류 화면이 아니라 안내로 그려지는지 본다.
 */
test.describe("빈 상태", () => {
  test.skip(DATA_SOURCE !== "api", "API 모드에서만 서버 응답을 고정할 수 있다");

  test("🔴 보고서 목록이 비어도 오류가 아니라 빈 상태다", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/reports")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { items: [], nextCursor: null, hasNext: false } }) });
      }
      if (url.includes("/auth/refresh")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { accessToken: "e2e-token" } }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { items: [], nextCursor: null, hasNext: false } }) });
    });
    await page.goto("/parent/reports");
    await expect(page.getByText("발행된 월별 보고서가 없어요")).toBeVisible({ timeout: 15_000 });
  });
});
