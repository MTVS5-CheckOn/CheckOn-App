"use client";

import { ChevronRight, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routeBuilders } from "@/config/routes";
import { useQuestionsQuery } from "@/features/student/questions/queries";
import type { StudentQuestionStatus } from "@/features/student/questions/types";

type Filter = "all" | StudentQuestionStatus;
const FILTERS: { value: Filter; label: string }[] = [{ value: "all", label: "전체" }, { value: "waiting", label: "답변 대기" }, { value: "answered", label: "답변 완료" }];

export function QuestionList() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: questions = [], isLoading, isError, refetch } = useQuestionsQuery();
  const visible = useMemo(() => questions.filter((question) => filter === "all" || question.status === filter), [filter, questions]);
  return <div className="space-y-3 px-5 py-5">
    <div className="flex gap-2">{FILTERS.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`h-9 rounded-full border px-4 text-xs font-semibold ${filter === item.value ? "border-brand bg-brand" : "border-border bg-surface text-muted"}`}>{item.label}</button>)}</div>
    {isLoading ? <div className="space-y-2"><div className="h-20 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-20 animate-pulse rounded-card bg-[#E9EDF2]" /></div> : isError ? <div className="rounded-card border border-border bg-surface px-5 py-10 text-center"><p className="text-sm font-bold">질문을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div> : visible.length ? <section className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]">{visible.map((question) => <Link key={question.id} href={routeBuilders.student.question(question.id)} className="flex min-h-[72px] items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0"><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{question.title}</h2><p className="mt-1 truncate text-xs text-subtle">{question.worksheetTitle} · {question.createdAt}</p></div><StatusChip status={question.status} /><ChevronRight size={18} className="shrink-0 text-[#9AA8BC]" /></Link>)}</section> : <div className="rounded-card border border-border bg-surface px-5 py-12 text-center"><MessageCircleQuestion className="mx-auto text-[#9AA8BC]" /><p className="mt-3 text-sm font-bold">{filter === "all" ? "등록한 질문이 없어요" : `${FILTERS.find((item) => item.value === filter)?.label} 질문이 없어요`}</p><Link href="/student/questions/new" className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold">질문 작성하기</Link></div>}
  </div>;
}

function StatusChip({ status }: { status: StudentQuestionStatus }) { return <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${status === "waiting" ? "bg-[#FFF0EE] text-[#E85A4F]" : "bg-[#E8F6F1] text-[#26856B]"}`}>{status === "waiting" ? "답변 대기" : "답변 완료"}</span>; }
