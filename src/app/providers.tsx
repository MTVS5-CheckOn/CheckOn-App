"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { registerUnauthorizedHandler } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => registerUnauthorizedHandler(() => {
    const login = pathname.startsWith("/parent") ? "/parent/login" : "/student/login";
    router.replace(`${login}?returnTo=${encodeURIComponent(pathname)}`);
  }), [pathname, router]);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (failureCount, error) => error instanceof ApiError ? (error.status === 0 || error.status === 408 || error.status >= 500) && failureCount < 1 : failureCount < 1, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
