"use client";

import { BookOpen, CheckCircle2, Clock3, Info, ListChecks } from "lucide-react";
import Link from "next/link";
import { routeBuilders } from "@/config/routes";
import { useWorksheetQuery } from "@/features/student/worksheets/queries";

export function WorksheetDetail({ worksheetId }: { worksheetId: string }) {
  const { data: worksheet, isLoading, isError, refetch } = useWorksheetQuery(worksheetId);
  if (isLoading) return <div className="space-y-3 p-5" aria-label="학습지를 불러오는 중"><div className="h-40 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-28 animate-pulse rounded-card bg-[#F1F3F6]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">학습지를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-3 h-10 rounded-xl bg-brand px-5 text-sm font-semibold">다시 시도</button></div>;
  if (!worksheet) return <p className="p-5 text-sm text-muted">학습지를 찾을 수 없습니다.</p>;
  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col">
      <main className="flex-1 space-y-4 px-5 py-5">
        <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
          <div className="flex flex-wrap gap-2"><span className="rounded-md bg-[#F4F6F8] px-2 py-1 text-[11px] font-bold text-muted">{worksheet.area}</span>{worksheet.reviewedByTeacher ? <span className="flex items-center gap-1 rounded-md bg-[#E8F6F1] px-2 py-1 text-[11px] font-bold text-[#26856B]"><CheckCircle2 size={13} />선생님 확인 완료</span> : null}</div>
          <h2 className="mt-3 text-xl font-extrabold">{worksheet.title}</h2><p className="mt-1.5 text-sm leading-6 text-muted">{worksheet.description}</p>
        </section>
        <div className="grid grid-cols-3 gap-3"><Metric icon={ListChecks} label="문항 수" value={`${worksheet.questionCount}문항`} /><Metric icon={Clock3} label="예상 시간" value={`약 ${worksheet.estimatedMinutes}분`} /><Metric icon={BookOpen} label="영역" value={worksheet.area} /></div>
        <section className="space-y-2 rounded-card border border-border bg-surface p-4 text-xs leading-5 text-muted"><p className="flex gap-2"><Info size={16} className="shrink-0 text-[#6EB5E9]" />문항별 풀이 시간이 기록됩니다.</p><p className="flex gap-2"><Info size={16} className="shrink-0 text-[#6EB5E9]" />정답과 해설은 답안 제출 후에만 볼 수 있습니다.</p></section>
      </main>
      <div className="sticky bottom-0 border-t border-divider bg-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3"><Link href={worksheet.status === "completed" ? routeBuilders.student.worksheetResults(worksheet.id) : routeBuilders.student.solveWorksheet(worksheet.id)} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-bold text-[#4C3024]">{worksheet.status === "in_progress" ? "이어 풀기" : worksheet.status === "completed" ? "결과 다시 보기" : "문제 풀기 시작"}</Link></div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) { return <div className="flex min-h-[116px] flex-col items-center justify-center rounded-card border border-border bg-surface p-3 text-center"><span className="grid size-9 place-items-center rounded-xl bg-[#EEF4FF] text-action"><Icon size={20} /></span><span className="mt-2 text-xs text-muted">{label}</span><strong className="mt-1 text-sm">{value}</strong></div>; }
