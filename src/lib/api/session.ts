type AccessTokenReader = () => string | null;
type UnauthorizedHandler = () => void;

let accessTokenReader: AccessTokenReader = () => null;
let unauthorizedHandler: UnauthorizedHandler = () => undefined;

export function registerAccessTokenReader(reader: AccessTokenReader) {
  accessTokenReader = reader;
  return () => { accessTokenReader = () => null; };
}

export function getAccessToken() { return accessTokenReader(); }
export function registerUnauthorizedHandler(handler: UnauthorizedHandler) { unauthorizedHandler = handler; return () => { unauthorizedHandler = () => undefined; }; }
export function notifyUnauthorized() { unauthorizedHandler(); }
