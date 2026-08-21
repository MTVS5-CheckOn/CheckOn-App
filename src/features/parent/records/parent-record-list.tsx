"use client";

import { ChevronRight, FileSearch } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routeBuilders } from "@/config/routes";
import { useParentRecordsQuery } from "@/features/parent/api/queries";
import type { ParentRecord } from "@/features/parent/model/types";
import { useSelectedChild } from "@/features/parent/shared/parent.store";
import { formatMonthLabel } from "@/lib/format/date";

type Area = "전체" | ParentRecord["area"];
const AREAS: Area[] = ["전체", "문학", "독서", "화법과작문", "언어·매체"];

export function ParentRecordList() {
  const [month, setMonth] = useState("");
  const [area, setArea] = useState<Area>("전체");
  const child = useSelectedChild();
  const { data = [], isLoading, isError, refetch } = useParentRecordsQuery(child?.studentId ?? "");
  const months = useMemo(() => [...new Set(data.map((item) => item.month))].sort().reverse(), [data]);
  const selectedMonth = months.includes(month) ? month : months[0] ?? "";
  const records = useMemo(() => data.filter((item) => item.month === selectedMonth && (area === "전체" || item.area === area)), [data, area, selectedMonth]);
  const questionCount = records.reduce((sum, item) => sum + item.questionCount, 0);
  const accuracy = records.length ? Math.round(records.reduce((sum, item) => sum + item.accuracy, 0) / records.length) : 0;

  return <div className="space-y-3 px-5 py-4">
    <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
      <select aria-label="학습 월" value={selectedMonth} onChange={(event) => setMonth(event.target.value)} className="h-9 rounded-lg bg-transparent pr-3 text-sm font-bold outline-none">{months.map((item) => <option key={item} value={item}>{formatMonthLabel(item)}</option>)}</select>
      <dl className="mt-4 grid grid-cols-3 text-center"><Metric label="정답률" value={`${accuracy}%`} /><Metric label="풀이 문항" value={`${questionCount}문항`} /><Metric label="학습 횟수" value={`${records.length}회`} /></dl>
    </section>
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1" aria-label="학습 영역 필터">{AREAS.map((item) => <button key={item} onClick={() => setArea(item)} aria-pressed={area === item} className={`h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold ${area === item ? "border-brand bg-brand text-[#4C3024]" : "border-border bg-surface text-muted"}`}>{item}</button>)}</div>
    {isLoading ? <div className="space-y-2"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div> : isError ? <section className="rounded-card border border-border bg-surface px-5 py-10 text-center"><p className="text-sm font-bold">학습기록을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></section> : records.length ? <section className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]">{records.map((record) => <Link key={record.id} href={routeBuilders.parent.record(record.id)} className="flex min-h-[93px] items-center gap-2 border-b border-divider px-4 py-3 last:border-0"><div className="min-w-0 flex-1"><p className="text-xs text-subtle">{record.date} · {record.area}</p><h2 className="mt-1 truncate text-sm font-bold">{record.title}</h2><p className="mt-1 text-xs text-muted">{record.questionCount}문항 · {record.elapsed}</p></div><div className="text-right"><strong className="text-lg">{record.accuracy}%</strong><p className="text-[11px] text-subtle">정답률</p></div><ChevronRight size={17} className="text-subtle" /></Link>)}</section> : <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><FileSearch className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">선택한 학습기록이 없어요</p><p className="mt-1 text-xs text-muted">다른 월이나 영역을 선택해 보세요.</p></section>}
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dd className="text-[22px] font-bold">{value}</dd><dt className="mt-1 text-xs text-muted">{label}</dt></div>; }
