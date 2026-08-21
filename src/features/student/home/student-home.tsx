"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { routeBuilders } from "@/config/routes";
import type { WorksheetSummary } from "@/features/student/home/model";
import { useStudentHomeQuery } from "@/features/student/home/queries";

function WorksheetCard({ item }: { item: WorksheetSummary }) {
  return <Link href={routeBuilders.student.solveWorksheet(item.id)} className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"><Card className="flex min-h-[108px] items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Badge>{item.area}</Badge><Badge tone={item.status === "신규" ? "warning" : "info"}>{item.status}</Badge></div><h3 className="mt-2 truncate text-[15px] font-semibold">{item.title}</h3><p className="mt-1 text-xs text-subtle">{item.meta}</p></div><ChevronRight aria-hidden size={18} className="shrink-0 text-[#9AA8BC]" /></Card></Link>;
}

export function StudentHome() {
  const { data, isLoading, isError, refetch } = useStudentHomeQuery();
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-52 animate-pulse rounded-lg bg-[#E9EDF2]" /><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !data) return <div className="p-8 text-center"><p className="text-sm font-bold">오늘의 학습을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const { weakness, today, continuing } = data;
  return <div className="space-y-6 p-5">
    <section className="relative overflow-hidden rounded-lg bg-brand p-5 text-[#4C3024]"><div className="absolute -right-7 -top-7 size-24 rounded-full bg-white/25" /><p className="text-xs font-semibold opacity-70">학습 취약 영역</p><h1 className="mt-1 text-[22px] font-bold leading-[33px]">{weakness.area}</h1><p className="mt-0.5 text-[13px] opacity-80">{weakness.description}</p><div className="mt-4 flex items-center gap-2"><div className="min-w-0 flex-1"><ProgressBar value={weakness.accuracy} tone="ink" /></div><strong className="text-xs">{weakness.accuracy}%</strong></div><Link href={routeBuilders.student.solveWorksheet("l2")} className="mt-5 inline-flex min-h-9 items-center rounded-full bg-[#79523D] px-4 text-[13px] font-semibold text-white">문제 풀기</Link></section>
    <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.3px] text-subtle">오늘의 학습</p>{today.map((item) => <WorksheetCard key={item.id} item={item} />)}</section>
    <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.3px] text-subtle">이어 풀기</p><Link href={routeBuilders.student.solveWorksheet(continuing.id)} className="block"><Card className="flex items-center gap-3 p-4"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-[#EEF4FF] font-bold text-action">{continuing.completed}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{continuing.title}</h3><p className="mt-0.5 text-xs text-muted">{continuing.meta}</p><div className="mt-2"><ProgressBar value={(continuing.completed! / continuing.total!) * 100} /></div></div><ChevronRight aria-hidden size={18} className="text-[#9AA8BC]" /></Card></Link></section>
  </div>;
}
