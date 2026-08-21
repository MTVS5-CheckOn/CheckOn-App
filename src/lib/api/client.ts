import { ApiError } from "@/lib/api/errors";
import { env } from "@/config/env";
import { getAccessToken, notifyUnauthorized } from "@/lib/api/session";
import type { ApiEnvelope, ApiErrorEnvelope, ApiErrorPayload } from "@/lib/api/types";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; accessToken?: string; timeoutMs?: number };

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call(value, "data");
}

function unwrapErrorPayload(payload: ApiErrorPayload | ApiErrorEnvelope | null): ApiErrorPayload | null {
  return payload && "error" in payload ? payload.error : payload;
}

export function unwrapApiResponse<T>(payload: unknown): T {
  if (env.apiResponseMode === "raw") return payload as T;
  if (env.apiResponseMode === "wrapped") {
    if (!isEnvelope(payload)) throw new ApiError("API 응답 형식이 올바르지 않습니다.", 502, "INVALID_API_ENVELOPE", payload);
    return payload.data as T;
  }
  return (isEnvelope(payload) && (Object.prototype.hasOwnProperty.call(payload, "meta") || Object.keys(payload).length === 1) ? payload.data : payload) as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken = getAccessToken() ?? undefined, timeoutMs = env.requestTimeoutMs, headers, signal, ...requestInit } = options;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal;
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...requestInit,
    credentials: "include",
    signal: combinedSignal,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new ApiError("요청 시간이 초과되었습니다.", 408, "REQUEST_TIMEOUT");
    throw new ApiError("서버에 연결할 수 없습니다.", 0, "NETWORK_ERROR", error);
  } finally { clearTimeout(timeoutId); }
  if (!response.ok) {
    const rawPayload = await response.json().catch(() => null) as ApiErrorPayload | ApiErrorEnvelope | null;
    const payload = unwrapErrorPayload(rawPayload);
    if (response.status === 401) notifyUnauthorized();
    throw new ApiError(payload?.message ?? "요청을 처리하지 못했습니다.", response.status, payload?.code, payload);
  }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new ApiError("JSON이 아닌 API 응답을 받았습니다.", 502, "INVALID_CONTENT_TYPE", { contentType });
  return unwrapApiResponse<T>(await response.json());
}
