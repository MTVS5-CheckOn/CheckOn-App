"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/config/routes";

const LOADING_DURATION_MS = 1400;

export function StudentLoading() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = window.performance.now();
    let animationFrameId = 0;

    const updateProgress = (now: number) => {
      const nextProgress = Math.min(
        100,
        Math.round(((now - startedAt) / LOADING_DURATION_MS) * 100),
      );

      setProgress(nextProgress);

      if (nextProgress < 100) {
        animationFrameId = window.requestAnimationFrame(updateProgress);
        return;
      }

      router.replace(ROUTES.auth.studentOnboarding);
    };

    animationFrameId = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#FFFCEC] px-10 text-center">
      <Image src="/brand/logo-horizontal.svg" alt="Check-On" width={230} height={59} priority />
      <p className="mt-7 text-sm font-semibold text-[#9A4F2D]">나의 국어 약점을 채우는 시간</p>
      <div
        className="mt-10 h-1.5 w-[120px] overflow-hidden rounded-full bg-[#F1E8D8]"
        role="progressbar"
        aria-label="앱을 준비하고 있어요"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span
          className="block h-full w-full origin-left rounded-full bg-brand"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        {progress < 100 ? "학습 정보를 준비하고 있어요" : "준비가 완료됐어요"} · {progress}%
      </p>
    </main>
  );
}
