export type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown> };
export type ApiErrorPayload = { code?: string; message?: string; details?: unknown };
export type PageResponse<T> = { items: T[]; page: number; size: number; totalElements: number; totalPages: number };

export type MutationStatus<T> =
  | { status: "success"; data: T }
  | { status: "rejected"; code: string; message: string };
