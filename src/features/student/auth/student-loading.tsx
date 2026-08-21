"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";

export function StudentLoading() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setTimeout(() => router.replace(ROUTES.auth.studentOnboarding), 1400);
    return () => window.clearTimeout(timer);
  }, [router]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#FFFCEC] px-10 text-center">
      <Image src="/brand/logo-horizontal.svg" alt="Check-On" width={230} height={59} priority />
      <p className="mt-7 text-sm font-semibold text-[#9A4F2D]">나의 국어 약점을 채우는 시간</p>
      <div className="mt-10 h-1.5 w-[120px] overflow-hidden rounded-full bg-[#F1E8D8]" role="progressbar" aria-label="앱을 준비하고 있어요"><span className="block h-full w-2/3 animate-pulse rounded-full bg-brand" /></div>
      <p className="mt-3 text-xs text-muted">학습 정보를 준비하고 있어요</p>
    </main>
  );
}
