type AccessTokenReader = () => string | null;
type UnauthorizedHandler = () => void;

let accessTokenReader: AccessTokenReader = () => null;
let unauthorizedHandler: UnauthorizedHandler = () => undefined;

export function registerAccessTokenReader(reader: AccessTokenReader) {
  accessTokenReader = reader;
  return () => {
    accessTokenReader = () => null;
  };
}

export function getAccessToken() {
  return accessTokenReader();
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
  return () => {
    unauthorizedHandler = () => undefined;
  };
}

export function notifyUnauthorized() {
  unauthorizedHandler();
}

/**
 * refresh 까지 실패해 세션이 확정적으로 끝난 경우.
 * 등록된 핸들러가 query 캐시를 비우고 로그인으로 보낸다.
 */
export function notifyAuthFailure() {
  unauthorizedHandler();
}
