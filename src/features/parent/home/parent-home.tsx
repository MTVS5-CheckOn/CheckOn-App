"use client";

import { Check, ChevronRight, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ROUTES } from "@/config/routes";
import { useParentHomeQuery } from "@/features/parent/api/queries";
import { useParentStore, useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentHome() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const child = useSelectedChild();
  const { children, selectedChildId, selectChild } = useParentStore();
  const { data, isLoading, isError, refetch } = useParentHomeQuery(child?.studentId ?? "");
  useEffect(() => {
    const open = () => setSelectorOpen(true);
    window.addEventListener("checkon:child-selector", open);
    return () => window.removeEventListener("checkon:child-selector", open);
  }, []);

  if (isLoading) return <div className="space-y-3 p-5"><div className="h-28 animate-pulse rounded-lg bg-[#E9EDF2]" /><div className="grid grid-cols-2 gap-3"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div></div>;
  if (isError || !data) return <div className="p-5 text-center"><p className="text-sm font-bold">학습 현황을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 h-10 rounded-xl bg-brand px-5 text-sm font-bold">다시 시도</button></div>;
  const { metrics, report, recent } = data;
  return <div className="space-y-4 p-5">
    <section className="rounded-lg bg-brand p-5 text-[#4C3024]"><p className="text-xs opacity-70">이번 달 학습 현황</p><h1 className="mt-1 text-xl font-bold">{child?.name ?? "자녀를 등록해 주세요"}</h1><p className="mt-1 text-xs opacity-70">2026.08.01 - 2026.08.31</p></section>
    <section className="grid grid-cols-2 gap-3">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
    <Link href={`${ROUTES.parent.reports}/${report.id}`} className="block"><Card className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Badge tone="danger">NEW</Badge><span className="text-xs text-muted">{report.month} 보고서</span></div><h2 className="mt-2 text-sm font-semibold">{report.title}</h2><p className="mt-1 text-xs text-subtle">{report.issuedAt} 발행</p></div><ChevronRight aria-hidden size={18} className="text-action" /></Card></Link>
    <section><SectionHeading title="최근 학습" href={ROUTES.parent.records} /><Card className="mt-2 overflow-hidden">{recent.map((item, index) => <Link key={item.id} href={`${ROUTES.parent.records}/${item.id}`} className={`flex min-h-[76px] items-center px-4 py-3 ${index ? "border-t border-divider" : ""}`}><div className="min-w-0 flex-1"><p className="text-xs text-subtle">{item.date} · {item.area}</p><h3 className="mt-1 truncate text-sm font-semibold">{item.title}</h3></div><div className="text-right"><strong className="text-lg">{item.accuracy}%</strong><p className="text-[11px] text-subtle">정답률</p></div></Link>)}</Card></section>
    {selectorOpen ? <div className="fixed inset-0 z-50 flex justify-center bg-[#202939]/35 px-5 pt-[76px]" onClick={() => setSelectorOpen(false)}><section role="dialog" aria-modal="true" aria-label="자녀 선택" onClick={(event) => event.stopPropagation()} className="h-fit w-full max-w-[350px] rounded-card border border-border bg-surface p-4 shadow-xl"><div className="flex items-center justify-between"><p className="text-xs text-muted">학습 현황을 확인할 자녀</p><button onClick={() => setSelectorOpen(false)} aria-label="닫기" className="grid size-9 place-items-center"><X size={18} /></button></div>{children.map((item) => <button key={item.id} onClick={() => { selectChild(item.id); setSelectorOpen(false); }} className="mt-1 flex min-h-14 w-full items-center border-b border-divider text-left last:border-0"><span className="flex-1 font-bold">{item.name} · {item.grade}</span>{selectedChildId === item.id ? <Check size={19} className="text-[#26856B]" /> : null}</button>)}<Link href="/parent/profile/children/new" className="mt-2 flex min-h-12 items-center gap-2 font-semibold text-action"><Plus size={18} />자녀 추가 등록</Link></section></div> : null}
  </div>;
}
