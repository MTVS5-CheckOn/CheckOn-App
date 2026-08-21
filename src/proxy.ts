import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/student/login", "/student/onboarding", "/student/signup", "/student/loading", "/student/activation-pending", "/student/activation-complete",
  "/parent/login", "/parent/signup",
];

function isPublicPath(pathname: string) { return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)); }

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api" || isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  const session = request.cookies.get("checkon_session");
  if (session) return NextResponse.next();
  const loginPath = request.nextUrl.pathname.startsWith("/parent") ? "/parent/login" : "/student/login";
  const url = new URL(loginPath, request.url);
  url.searchParams.set("returnTo", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/student/:path*", "/parent/:path*"] };
