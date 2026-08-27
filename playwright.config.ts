import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3001", trace: "retain-on-failure", ...devices["Desktop Chrome"] },
  // 🔴 데이터 소스를 명시한다. .env.local 에 무엇이 들어 있든 E2E 는 이 값으로 돈다.
  //    E2E_DATA_SOURCE=api 로 API 모드도 돌린다 (양쪽 다 green 이어야 한다).
  webServer: {
    command: `NEXT_PUBLIC_DATA_SOURCE=${process.env.E2E_DATA_SOURCE ?? "mock"} pnpm dev --port 3001`,
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
