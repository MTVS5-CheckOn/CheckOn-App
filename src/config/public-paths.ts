/** 로그인 없이 들어갈 수 있는 화면. proxy 와 클라이언트 인증 게이트가 같은 목록을 본다. */
export const PUBLIC_PATHS = [
  "/student/login",
  "/student/onboarding",
  "/student/signup",
  "/student/loading",
  "/student/activation-pending",
  "/student/activation-complete",
  "/parent/login",
  "/parent/signup",
];

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function loginPathFor(pathname: string) {
  return pathname.startsWith("/parent") ? "/parent/login" : "/student/login";
}
