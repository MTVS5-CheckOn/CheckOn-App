import { expect, test } from "@playwright/test";

test.describe("CheckOn 핵심 화면", () => {
  test("학생 홈에서 오늘의 학습으로 진입한다", async ({ page }) => {
    await page.goto("/student");
    await expect(page.getByText("오늘의 학습")).toBeVisible();
    await page.getByRole("link", { name: /현대시 독해 집중훈련/ }).click();
    await expect(page).toHaveURL(/\/student\/worksheets\//);
  });

  test("학부모가 상담 요청 화면에 진입한다", async ({ page }) => {
    await page.goto("/parent/consultations");
    await page.getByRole("link", { name: "상담 요청" }).click();
    await expect(page).toHaveURL(/\/parent\/consultations\/new/);
    await expect(page.getByText(/상담 내용은 접수 후 자동 분류/)).toBeVisible();
  });
});
