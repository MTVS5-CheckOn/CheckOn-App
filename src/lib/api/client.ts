import { ApiError } from "@/lib/api/errors";
import { env } from "@/config/env";
import { getAccessToken } from "@/lib/api/session";
import type { ApiErrorPayload } from "@/lib/api/types";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; accessToken?: string; timeoutMs?: number };

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
    const payload = await response.json().catch(() => null) as ApiErrorPayload | null;
    throw new ApiError(payload?.message ?? "요청을 처리하지 못했습니다.", response.status, payload?.code, payload);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
