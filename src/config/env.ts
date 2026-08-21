export type DataSourceMode = "mock" | "api";

function readDataSource(value: string | undefined): DataSourceMode {
  return value === "api" ? "api" : "mock";
}

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  dataSource: readDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE),
  requestTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10_000),
} as const;
