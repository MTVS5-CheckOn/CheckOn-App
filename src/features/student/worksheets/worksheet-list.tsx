"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routeBuilders } from "@/config/routes";
import { useWorksheetsQuery } from "@/features/student/worksheets/queries";
import type { WorksheetStatus } from "@/features/student/worksheets/types";

type Filter = "all" | "in_progress" | "completed";
const FILTERS: { value: Filter; label: string }[] = [{ value: "all", label: "전체" }, { value: "in_progress", label: "진행 중" }, { value: "completed", label: "완료" }];

export function WorksheetList() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data = [], isLoading } = useWorksheetsQuery();
  const worksheets = useMemo(() => data.filter((worksheet) => filter === "all" || worksheet.status === filter || (filter === "in_progress" && worksheet.status === "new")), [data, filter]);

  return (
    <div className="px-5 py-5">
      <div className="mb-3 flex gap-2" role="group" aria-label="학습지 상태 필터">{FILTERS.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`h-[34px] rounded-full border px-4 text-[13px] font-semibold ${filter === item.value ? "border-brand bg-brand text-[#4C3024]" : "border-border bg-surface text-muted"}`}>{item.label}</button>)}</div>
      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]" aria-live="polite">
        {isLoading ? <p className="p-5 text-sm text-muted">학습지를 불러오고 있어요.</p> : worksheets.length ? worksheets.map((worksheet) => <WorksheetRow key={worksheet.id} worksheet={worksheet} />) : <p className="p-8 text-center text-sm text-muted">해당 상태의 학습지가 없습니다.</p>}
      </section>
    </div>
  );
}

function WorksheetRow({ worksheet }: { worksheet: { id: string; title: string; area: string; questionCount: number; estimatedMinutes: number; status: WorksheetStatus; accuracy?: number } }) {
  const status = { new: { label: "신규", className: "bg-warning-soft text-[#9A6B16]" }, in_progress: { label: "진행 중", className: "bg-[#EEF4FF] text-action" }, completed: { label: "완료", className: "bg-[#E8F6F1] text-[#26856B]" } }[worksheet.status];
  return <Link href={routeBuilders.student.worksheet(worksheet.id)} className="flex min-h-[104px] items-center gap-3 border-b border-divider px-4 py-4 last:border-b-0"><div className="min-w-0 flex-1"><div className="mb-2 flex gap-2"><span className="rounded-md bg-[#F4F6F8] px-2 py-1 text-[11px] font-bold text-muted">{worksheet.area}</span><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span></div><h2 className="truncate text-[15px] font-bold">{worksheet.title}</h2><p className="mt-1 text-xs text-subtle">{worksheet.questionCount}문항 · 약 {worksheet.estimatedMinutes}분{worksheet.accuracy ? ` · 정답률 ${worksheet.accuracy}%` : ""}</p></div><ChevronRight className="shrink-0 text-[#9AA8BC]" size={20} /></Link>;
}
