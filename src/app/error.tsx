"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto grid min-h-dvh w-full max-w-[390px] place-items-center bg-app p-5 text-center"><section className="w-full rounded-card border border-border bg-surface p-6"><AlertTriangle className="mx-auto text-[#E85A4F]" /><h1 className="mt-4 text-lg font-bold">화면을 불러오지 못했어요</h1><p className="mt-2 text-sm leading-6 text-muted">잠시 후 다시 시도해 주세요. 문제가 계속되면 앱을 다시 실행해 주세요.</p><ActionButton className="mt-5" onClick={reset}>다시 시도</ActionButton></section></main>;
}
