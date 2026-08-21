export type DataSourceMode = "mock" | "api";
export type ApiResponseMode = "raw" | "wrapped" | "auto";

function readDataSource(value: string | undefined): DataSourceMode {
  return value === "api" ? "api" : "mock";
}

function readResponseMode(value: string | undefined): ApiResponseMode {
  return value === "raw" || value === "wrapped" ? value : "auto";
}

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  dataSource: readDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE),
  requestTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10_000),
  apiResponseMode: readResponseMode(process.env.NEXT_PUBLIC_API_RESPONSE_MODE),
} as const;
