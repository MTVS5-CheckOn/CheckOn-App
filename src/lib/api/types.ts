export type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown> };
export type ApiErrorPayload = { code?: string; message?: string; details?: unknown };
export type ApiErrorEnvelope = { error: ApiErrorPayload; meta?: Record<string, unknown> };

/**
 * 목록 공통 — cursor pagination (member-api.yaml `CursorPage`).
 * 🔴 `limit` 최대 50. 51 이상은 서버가 400 으로 거절한다.
 */
export type CursorPage<T> = { items: T[]; nextCursor: string | null; hasNext: boolean };

export const MAX_PAGE_LIMIT = 50;

/** limit 을 계약 상한으로 자른다. 🔴 서버가 400 을 내기 전에 프론트에서 막는다. */
export function clampLimit(limit: number) {
  return Math.max(1, Math.min(limit, MAX_PAGE_LIMIT));
}

/** cursor·limit 을 query string 으로. 값이 없으면 키를 붙이지 않는다. */
export function pageQuery(params: { cursor?: string | null; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.limit !== undefined) search.set("limit", String(clampLimit(params.limit)));
  const value = search.toString();
  return value ? `?${value}` : "";
}

export type MutationStatus<T> =
  | { status: "success"; data: T }
  | { status: "rejected"; code: string; message: string };
