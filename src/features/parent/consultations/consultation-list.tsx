"use client";

import { ChevronRight, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routeBuilders } from "@/config/routes";
import { useParentConsultationsQuery } from "@/features/parent/api/queries";
import { ConsultationStatusChip } from "@/features/parent/consultations/consultation-ui";
import type { ConsultationStatus } from "@/features/parent/consultations/types";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

type Filter = "all" | "pending" | "answered" | "closed";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "확인 중" },
  { value: "answered", label: "답변 완료" },
  { value: "closed", label: "상담 완료" },
];
const matchesFilter = (status: ConsultationStatus, filter: Filter) => filter === "all" || (filter === "pending" ? status === "submitted" || status === "reviewing" : status === filter);

export function ConsultationList() {
  const [filter, setFilter] = useState<Filter>("all");
  const child = useSelectedChild();
  const { data = [], isLoading, isError, refetch } = useParentConsultationsQuery(child?.studentId ?? "");
  const visible = useMemo(() => data.filter((item) => matchesFilter(item.status, filter)), [data, filter]);

  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card bg-brand-soft p-4"><p className="text-sm font-bold">{child?.name} 학생 상담</p><p className="mt-1 text-xs leading-5 text-muted">요청 내용과 선생님의 앱 답변을 한곳에서 확인할 수 있어요.</p></section>
    <div className="no-scrollbar flex gap-2 overflow-x-auto">{FILTERS.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`h-9 shrink-0 rounded-full border px-4 text-xs font-semibold ${filter === item.value ? "border-brand bg-brand text-[#6F3C27]" : "border-border bg-surface text-muted"}`}>{item.label}</button>)}</div>
    {isLoading ? <ConsultationListSkeleton /> : isError ? <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><p className="text-sm font-bold">상담 내역을 불러오지 못했어요.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></section> : visible.length ? <section className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]">{visible.map((consultation) => <Link key={consultation.id} href={routeBuilders.parent.consultation(consultation.id)} className="flex min-h-[92px] items-center gap-3 border-b border-divider px-4 py-3 last:border-0"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-action">상담 요청</span><span className="text-[11px] text-subtle">{consultation.createdAt.split(" ")[0]}</span></div><h2 className="mt-1 line-clamp-1 text-sm font-semibold">{consultation.content}</h2><p className="mt-1 text-xs text-subtle">{consultation.teacherName} · 앱 답변</p></div><ConsultationStatusChip status={consultation.status} /><ChevronRight size={17} className="shrink-0 text-subtle" /></Link>)}</section> : <EmptyConsultation filter={filter} />}
  </div>;
}

function ConsultationListSkeleton() { return <div className="space-y-2"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function EmptyConsultation({ filter }: { filter: Filter }) { return <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><MessagesSquare className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">{filter === "all" ? "아직 상담 요청이 없어요" : "해당 상태의 상담이 없어요"}</p><p className="mt-1 text-xs leading-5 text-muted">자녀의 학습 방향이 궁금할 때<br />담당 선생님께 상담을 요청해 보세요.</p><Link href={routeBuilders.parent.newConsultation()} className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-[#4C3024]">상담 요청하기</Link></section>; }
