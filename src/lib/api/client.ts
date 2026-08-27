import { ApiError } from "@/lib/api/errors";
import { env } from "@/config/env";
import { normalizeErrorCode } from "@/lib/api/error-codes";
import { getAccessToken } from "@/lib/api/session";
import { refreshAccessToken } from "@/lib/api/refresh";
import type { ApiEnvelope, ApiErrorEnvelope, ApiErrorPayload } from "@/lib/api/types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string;
  timeoutMs?: number;
  /** 🔴 내부 전용. 401 재시도 1회 상한을 지키기 위한 표시다. */
  retriedAfterRefresh?: boolean;
};

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call(value, "data");
}

function unwrapErrorPayload(payload: ApiErrorPayload | ApiErrorEnvelope | null): ApiErrorPayload | null {
  return payload && "error" in payload ? payload.error : payload;
}

export function unwrapApiResponse<T>(payload: unknown): T {
  if (env.apiResponseMode === "raw") return payload as T;
  if (env.apiResponseMode === "wrapped") {
    if (!isEnvelope(payload)) {
      throw new ApiError("API 응답 형식이 올바르지 않습니다.", 502, "INVALID_API_ENVELOPE", payload);
    }
    return payload.data as T;
  }
  // 🔴 auto 는 추측이다. 백엔드 성공 body 는 항상 { data: ... } 이므로 wrapped 를 쓴다.
  return (isEnvelope(payload) && (Object.prototype.hasOwnProperty.call(payload, "meta") || Object.keys(payload).length === 1)
    ? payload.data
    : payload) as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    accessToken = getAccessToken() ?? undefined,
    timeoutMs = env.requestTimeoutMs,
    headers,
    signal,
    retriedAfterRefresh = false,
    ...requestInit
  } = options;
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
    // 🔴 abort 를 error 의 타입·이름으로 판정하지 않는다.
    // fetch 구현(undici·MSW 등)에 따라 AbortError 가 다른 오류로 감싸여 올라와
    // timeout 이 NETWORK_ERROR 로 잘못 분류된다. 우리가 켠 신호를 직접 본다.
    if (timeoutController.signal.aborted) {
      throw new ApiError("요청 시간이 초과되었습니다.", 408, "REQUEST_TIMEOUT");
    }
    if (signal?.aborted) throw error;
    throw new ApiError("서버에 연결할 수 없습니다.", 0, "NETWORK_ERROR", error);
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && !retriedAfterRefresh) {
    // 🔴 single-flight. 동시에 401 이 몇 개 오든 refresh 요청은 1회다.
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // 🔴 재시도는 1회 상한. 재시도한 요청이 또 401 이면 refresh 를 다시 부르지 않는다.
      return apiRequest<T>(path, { ...options, retriedAfterRefresh: true, accessToken: undefined });
    }
  }

  if (!response.ok) {
    const rawPayload = (await response.json().catch(() => null)) as ApiErrorPayload | ApiErrorEnvelope | null;
    const payload = unwrapErrorPayload(rawPayload);
    throw new ApiError(
      payload?.message ?? "요청을 처리하지 못했습니다.",
      response.status,
      normalizeErrorCode(payload?.code),
      payload,
    );
  }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError("JSON이 아닌 API 응답을 받았습니다.", 502, "INVALID_CONTENT_TYPE", { contentType });
  }
  return unwrapApiResponse<T>(await response.json());
}
