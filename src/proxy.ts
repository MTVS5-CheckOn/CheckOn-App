import { NextResponse, type NextRequest } from "next/server";

/**
 * 🔴 미들웨어에서 세션 쿠키를 읽지 않는다.
 *
 * 백엔드가 발급하는 쿠키는 `CHECKON_REFRESH` 이고 Path 가 `/api/v1/auth` 다.
 * 그래서 `/student/*`·`/parent/*` 같은 Next 라우트에는 **애초에 전송되지 않는다.**
 * 쿠키 이름만 바꿔도 고쳐지지 않으므로 인증 판정을 클라이언트로 옮겼다 —
 * AppProviders 가 메모리 토큰이 없으면 부팅 시 refresh·session 을 시도하고,
 * 실패하면 notifyUnauthorized() 가 로그인으로 보낸다.
 *
 * 공개 경로 목록은 `@/config/public-paths` 에 있고 그 게이트가 쓴다.
 */
export function proxy(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = { matcher: ["/student/:path*", "/parent/:path*"] };
