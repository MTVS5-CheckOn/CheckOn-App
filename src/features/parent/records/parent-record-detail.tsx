"use client";

import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useParentRecordQuery } from "@/features/parent/api/queries";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentRecordDetail({ recordId }: { recordId: string }) {
  const child = useSelectedChild();
  const { data: record, isLoading, isError, refetch } = useParentRecordQuery(child?.studentId ?? "", recordId);
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-20 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-52 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">학습기록을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!record) return <div className="p-8 text-center text-sm text-muted">해당 학습기록을 찾을 수 없습니다.</div>;
  return <div className="space-y-4 px-5 py-4">
    <section className="rounded-card border border-border bg-surface p-4"><h2 className="font-bold">{record.title}</h2><p className="mt-2 text-xs text-subtle">2026.{record.date} · {record.questionCount}문항 · 정답률 {record.accuracy}% · {record.elapsed}</p></section>
    <dl className="grid grid-cols-3 gap-3"><Metric label="정답률" value={`${record.accuracy}%`} /><Metric label="풀이시간" value={record.elapsed} /><Metric label="오답" value={`${record.wrongCount}문항`} /></dl>
    <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold text-muted">정답률 추이</h3><div className="mt-2 h-40" aria-label="정답률 추이 선 차트"><ResponsiveContainer width="100%" height="100%"><LineChart data={record.trend} margin={{ top: 12, right: 8, bottom: 0, left: -26 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><YAxis domain={[40,100]} ticks={[40,55,70,85,100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /><Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ fill: "#8CC0EB", r: 4, strokeWidth: 0 }} animationDuration={650} /></LineChart></ResponsiveContainer></div></section>
    <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold text-muted">세부 분석</h3><dl className="mt-3 divide-y divide-divider text-sm"><Row label="총 시간" value={record.detail.totalTime} /><Row label="오답 유형" value={record.detail.wrongTypeSummary} /><Row label="시간 초과 문항" value={record.detail.overtimeQuestionSummary} /></dl></section>
    <div className="space-y-2"><Link href={ROUTES.parent.analysis} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">고급 분석 전체 보기</Link><Link href={routeBuilders.parent.newConsultation({ type: "record", id: record.id, label: record.title, detail: `${record.area} · 정답률 ${record.accuracy}% · 오답 ${record.wrongCount}문항` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 학습기록으로 상담 요청</Link></div>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-card border border-border bg-surface p-4"><p className="text-xs text-muted">{label}</p><strong className="mt-2 block text-lg">{value}</strong></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="ml-auto text-right font-semibold">{value}</dd></div>; }
