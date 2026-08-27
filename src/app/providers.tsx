"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { env } from "@/config/env";
import { isPublicPath, loginPathFor } from "@/config/public-paths";
import { registerAccessTokenReader, registerUnauthorizedHandler } from "@/lib/api/session";
import { readAccessToken, setAccessToken } from "@/lib/api/token-store";
import { refreshAccessToken } from "@/lib/api/refresh";
import { authGateway } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          error instanceof ApiError
            ? (error.status === 0 || error.status === 408 || error.status >= 500) && failureCount < 1
            : failureCount < 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  }));

  // 🔴 이 등록이 없으면 getAccessToken() 이 항상 null 이라 요청에 Authorization 이 붙지 않는다.
  useEffect(() => registerAccessTokenReader(readAccessToken), []);

  useEffect(() => registerUnauthorizedHandler(() => {
    setAccessToken(null);
    // 남은 캐시가 다음 로그인 계정 화면에 섞이지 않도록 비운다.
    queryClient.clear();
    router.replace(`${loginPathFor(pathname)}?returnTo=${encodeURIComponent(pathname)}`);
  }), [pathname, router, queryClient]);

  // 부팅 게이트 — 보호 경로인데 메모리 토큰이 없으면 refresh 로 세션을 되살린다.
  // 새로고침하면 메모리 토큰은 사라지고 HttpOnly refresh 쿠키만 남기 때문이다.
  useEffect(() => {
    if (env.dataSource !== "api" || isPublicPath(pathname) || readAccessToken()) return;
    let cancelled = false;
    void (async () => {
      const refreshed = await refreshAccessToken();
      // 실패 시 refreshAccessToken 안에서 이미 로그인으로 보낸다.
      if (!refreshed || cancelled) return;
      await authGateway.getSession().catch(() => null);
    })();
    return () => { cancelled = true; };
  }, [pathname]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
