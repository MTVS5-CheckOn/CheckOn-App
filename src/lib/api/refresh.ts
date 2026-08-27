import { env } from "@/config/env";
import { endpoints } from "@/lib/api/endpoints";
import { notifyAuthFailure } from "@/lib/api/session";
import { setAccessToken } from "@/lib/api/token-store";

/**
 * single-flight refresh.
 *
 * 🔴 모듈 스코프 하나만 둔다. 홈 진입처럼 query 여러 개가 동시에 401 을 받아도
 * `POST /api/v1/auth/refresh` 는 **정확히 1회**만 나가야 한다. 이 변수를 없애면
 * 401 마다 새 Promise 가 생겨 refresh 가 동시 다발로 나가고, 서버가 refresh token 을
 * 회전시키는 순간 서로의 토큰을 무효화해 전부 로그아웃된다.
 */
let inflight: Promise<boolean> | null = null;

type RefreshEnvelope = { data?: { accessToken?: unknown } };

/** 🔴 apiRequest 를 쓰지 않는다. 401 인터셉터를 다시 타면 무한 재귀가 된다. */
async function requestRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${env.apiBaseUrl}${endpoints.legacyAuth.refresh()}`, {
      method: "POST",
      // 🔴 HttpOnly CHECKON_REFRESH 쿠키(Path=/api/v1/auth)가 실려야 한다.
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return false;
    const payload = (await response.json().catch(() => null)) as RefreshEnvelope | null;
    const token = payload?.data?.accessToken;
    if (typeof token !== "string" || token.length === 0) return false;
    setAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  if (inflight) return inflight;
  inflight = requestRefresh()
    .then((ok) => {
      if (!ok) {
        setAccessToken(null);
        // 캐시를 비우고 로그인으로 보낸다. 남은 캐시가 로그인 후 다른 계정 화면에 섞이면 안 된다.
        notifyAuthFailure();
      }
      return ok;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** 테스트 전용 — 모듈 스코프 상태를 초기화한다. */
export function resetRefreshStateForTest() {
  inflight = null;
}
