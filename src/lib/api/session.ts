type AccessTokenReader = () => string | null;

let accessTokenReader: AccessTokenReader = () => null;

export function registerAccessTokenReader(reader: AccessTokenReader) {
  accessTokenReader = reader;
  return () => { accessTokenReader = () => null; };
}

export function getAccessToken() { return accessTokenReader(); }
