/**
 * access token 저장소 — 🔴 메모리 전용.
 *
 * localStorage·sessionStorage·쿠키를 쓰지 않는다. 저 셋은 XSS 가 읽어갈 수 있고,
 * refresh 는 이미 HttpOnly `CHECKON_REFRESH` 쿠키(Path=/api/v1/auth)가 담당한다.
 * 새로고침하면 토큰이 사라지는 것이 정상이고, 부팅 시 refresh 로 다시 얻는다.
 */

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function readAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}
