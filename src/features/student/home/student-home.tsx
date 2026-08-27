"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { routeBuilders } from "@/config/routes";
import type { Worksheet } from "@/features/student/worksheets/types";
import { useStudentHomeQuery } from "@/features/student/home/queries";
import { ActivationRequiredNotice, isActivationRequired } from "@/features/student/auth/activation-required-notice";

function WorksheetCard({ item }: { item: Worksheet }) {
  return <Link href={routeBuilders.student.solveWorksheet(item.id)} className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"><Card className="flex min-h-[108px] items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Badge>{item.area}</Badge><Badge tone={item.status === "new" ? "warning" : "info"}>{item.status === "new" ? "신규" : item.status === "in_progress" ? "진행 중" : "완료"}</Badge></div><h3 className="mt-2 truncate text-[15px] font-semibold">{item.title}</h3><p className="mt-1 text-xs text-subtle">{item.questionCount}문항{item.estimatedMinutes ? ` · 약 ${item.estimatedMinutes}분` : ""}</p></div><ChevronRight aria-hidden size={18} className="shrink-0 text-[#9AA8BC]" /></Card></Link>;
}

export function StudentHome() {
  const { data, isLoading, isError, error, refetch } = useStudentHomeQuery();
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-52 animate-pulse rounded-lg bg-[#E9EDF2]" /><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isActivationRequired(error)) return <ActivationRequiredNotice what="오늘의 학습" />;
  if (isError || !data) return <div className="p-8 text-center"><p className="text-sm font-bold">오늘의 학습을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const { weakness, todayWorksheets, continuing } = data;
  return <div className="space-y-6 p-5">
    {/* 🔴 약점은 판정 표본이 모여야 나온다. 없으면 지어내지 않고 그 사실을 보여준다. */}
    {weakness ? (
      <section className="relative overflow-hidden rounded-lg bg-brand p-5 text-[#4C3024]"><div className="absolute -right-7 -top-7 size-24 rounded-full bg-white/25" /><p className="text-xs font-semibold opacity-70">학습 취약 영역</p><h1 className="mt-1 text-[22px] font-bold leading-[33px]">{weakness.area}</h1>{weakness.accuracy != null ? <><div className="mt-4 flex items-center gap-2"><div className="min-w-0 flex-1"><ProgressBar value={weakness.accuracy} tone="ink" /></div><strong className="text-xs">{weakness.accuracy}%</strong></div></> : null}</section>
    ) : (
      <section className="rounded-lg border border-border bg-surface p-5 text-center" role="status"><p className="text-sm font-bold">아직 취약 영역을 판단하기 어려워요</p><p className="mt-1 text-xs leading-5 text-muted">학습을 조금 더 쌓으면 영역별 약점을 알려드릴게요.</p></section>
    )}

    <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.3px] text-subtle">오늘의 학습</p>
      {/* 🔴 강사가 배정해야 생긴다. 빈 목록은 오류가 아니다. */}
      {todayWorksheets.length ? todayWorksheets.map((item) => <WorksheetCard key={item.id} item={item} />)
        : <Card className="px-5 py-10 text-center"><p className="text-sm font-bold">오늘 배정된 학습지가 없어요</p><p className="mt-1 text-xs leading-5 text-muted">선생님이 학습지를 배정하면 이곳에 표시됩니다.</p></Card>}
    </section>

    {continuing ? (
      <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.3px] text-subtle">이어 풀기</p><Link href={routeBuilders.student.solveWorksheet(continuing.id)} className="block"><Card className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{continuing.title}</h3><p className="mt-0.5 text-xs text-muted">{continuing.questionCount}문항</p></div><ChevronRight aria-hidden size={18} className="text-[#9AA8BC]" /></Card></Link></section>
    ) : null}
  </div>;
}
