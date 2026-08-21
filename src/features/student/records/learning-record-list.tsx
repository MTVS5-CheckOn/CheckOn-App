"use client";

import { ChevronRight, FileSearch } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routeBuilders } from "@/config/routes";
import { useLearningRecordsQuery } from "@/features/student/records/queries";
import { useLearningRecordStore } from "@/features/student/records/learning-record.store";
import type { RecordArea } from "@/features/student/records/types";
import { formatElapsed } from "@/features/student/quiz/format-time";

type AreaFilter = "전체" | RecordArea;
const AREAS: AreaFilter[] = ["전체", "화법과작문", "언어·매체", "독서", "문학"];

export function LearningRecordList() {
  const [month, setMonth] = useState("2026-08");
  const [area, setArea] = useState<AreaFilter>("전체");
  const { data = [], isLoading, isError, refetch } = useLearningRecordsQuery();
  const submittedRecords = useLearningRecordStore((state) => state.submittedRecords);
  const allRecords = useMemo(() => [...submittedRecords, ...data.filter((record) => !submittedRecords.some((submitted) => submitted.worksheetId === record.worksheetId))], [data, submittedRecords]);
  const records = useMemo(() => allRecords.filter((record) => record.month === month && (area === "전체" || record.area === area)), [allRecords, area, month]);
  const totalQuestions = records.reduce((sum, record) => sum + record.questionCount, 0);
  const totalCorrect = records.reduce((sum, record) => sum + record.correctCount, 0);
  const totalSeconds = records.reduce((sum, record) => sum + record.elapsedSeconds, 0);
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
      <label className="flex items-center justify-between text-xs text-muted">학습 월
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-9 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink outline-none focus:border-action">
          <option value="2026-08">2026년 8월</option><option value="2026-07">2026년 7월</option>
        </select>
      </label>
      <dl className="mt-4 grid grid-cols-3 text-center"><Metric label="정답률" value={`${accuracy}%`} /><Metric label="풀이 문항" value={`${totalQuestions}문항`} /><Metric label="학습 시간" value={`${Math.round(totalSeconds / 60)}분`} /></dl>
    </section>
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="영역 필터">{AREAS.map((item) => <button key={item} onClick={() => setArea(item)} aria-pressed={area === item} className={`h-9 shrink-0 rounded-full border px-4 text-xs font-semibold ${area === item ? "border-brand bg-brand text-[#4C3024]" : "border-border bg-surface text-muted"}`}>{item}</button>)}</div>
    <section>
      <p className="mb-2 text-xs font-semibold text-subtle">최근 학습</p>
      {isLoading ? <RecordSkeleton /> : isError ? <StateCard title="학습기록을 불러오지 못했어요" action="다시 시도" onAction={() => refetch()} /> : records.length ? <div className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]">{records.map((record) => <Link key={record.id} href={routeBuilders.student.record(record.id)} className="flex min-h-[93px] items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0"><div className="min-w-0 flex-1"><p className="text-xs text-subtle">{record.date} · {record.area}</p><h2 className="mt-1 truncate text-sm font-semibold">{record.title}</h2><p className="mt-1 text-xs text-muted">{record.questionCount}문항 · 정답률 {Math.round(record.correctCount / record.questionCount * 100)}% · {formatElapsed(record.elapsedSeconds)}</p></div><ChevronRight size={18} className="shrink-0 text-[#9AA8BC]" /></Link>)}</div> : <StateCard title="선택한 조건의 학습기록이 없어요" description="다른 월이나 영역을 선택해 보세요." />}
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dd className="text-[22px] font-bold">{value}</dd><dt className="mt-1 text-xs text-muted">{label}</dt></div>; }
function RecordSkeleton() { return <div className="space-y-2" aria-label="학습기록을 불러오는 중"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function StateCard({ title, description, action, onAction }: { title: string; description?: string; action?: string; onAction?: () => void }) { return <div className="rounded-card border border-border bg-surface px-5 py-10 text-center"><FileSearch className="mx-auto text-[#9AA8BC]" /><p className="mt-3 text-sm font-bold">{title}</p>{description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}{action ? <button onClick={onAction} className="mt-4 h-10 rounded-xl bg-brand px-5 text-sm font-semibold">{action}</button> : null}</div>; }
