"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { routeBuilders } from "@/config/routes";
import { useParentAnalysisQuery } from "@/features/parent/api/queries";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentAnalysis() {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-64 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !data) return <div className="p-8 text-center"><p className="text-sm font-bold">분석 데이터를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const { percentile, accuracy, changeFromPreviousMonth, sampleAsOf, areaScores, accuracyTrend, primaryWeakness } = data;
  return <div className="space-y-4 px-5 py-4">
    <section className="rounded-card border border-border bg-surface p-4"><div className="flex items-start justify-between"><div><p className="text-xs text-muted">전국 백분위</p><strong className="mt-1 block text-[34px] leading-10 text-action">{percentile}위</strong></div><div className="text-right"><p className="text-xs text-muted">정답률</p><strong className="mt-1 block text-2xl">{accuracy}%</strong><p className="mt-1 text-xs font-semibold text-[#26856B]">▲ 전월 대비 +{changeFromPreviousMonth}%</p></div></div><p className="mt-1 text-[11px] text-subtle">전국 동일 학년 표본 · {sampleAsOf} 기준</p></section>
    <section className="rounded-card border border-border bg-surface p-4"><h2 className="text-sm font-bold text-muted">영역별 성취도</h2><div className="mt-2 grid grid-cols-[1fr_120px] items-center"><div className="h-48" aria-label="영역별 성취도 레이더 차트"><ResponsiveContainer width="100%" height="100%"><RadarChart data={areaScores} outerRadius="62%"><PolarGrid stroke="#DCE4EC" /><PolarAngleAxis dataKey="area" tick={{ fill: "#667085", fontSize: 10 }} /><Radar dataKey="score" stroke="#4C75DD" fill="#BFDDF0" fillOpacity={0.55} animationDuration={650} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /></RadarChart></ResponsiveContainer></div><dl className="space-y-2 text-xs">{areaScores.map((item) => <div key={item.area} className={`flex justify-between gap-2 ${item.score === 43 ? "font-bold text-[#E85A4F]" : ""}`}><dt>{item.area}</dt><dd className="font-bold">{item.score}%</dd></div>)}</dl></div><p className="text-[11px] text-subtle">미측정 영역은 표기하지 않습니다.</p></section>
    <Link href={routeBuilders.parent.weakness(primaryWeakness.area)} className="flex items-center rounded-card border border-border bg-surface p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded bg-[#E85A4F] px-1.5 py-1 text-[11px] font-bold text-white">1순위 취약</span><strong className="text-sm">{primaryWeakness.area} · {primaryWeakness.skill}</strong></div><p className="mt-2 text-xs text-muted">정답률 {primaryWeakness.score}% · {primaryWeakness.description}</p><p className="mt-1 text-[11px] text-subtle">전국 동일 학년 표본 · {sampleAsOf} 기준</p></div><ChevronRight className="text-action" size={18} /></Link>
    <section className="rounded-card border border-border bg-surface p-4"><h2 className="text-sm font-bold text-muted">정답률 추이</h2><div className="mt-2 h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={accuracyTrend} margin={{ top: 10, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><YAxis domain={[40,100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ r: 4, fill: "#8CC0EB", strokeWidth: 0 }} animationDuration={650} /><Tooltip /></LineChart></ResponsiveContainer></div></section>
    <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `monthly-analysis-${sampleAsOf}`, label: `${sampleAsOf} 기준 고급 분석`, detail: `전국 백분위 ${percentile}위 · 우선 보완 ${primaryWeakness.area} ${primaryWeakness.score}%` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
  </div>;
}

export function WeaknessDetail({ area }: { area: string }) {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-64 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !data) return <div className="p-8 text-center"><p className="text-sm font-bold">취약 영역을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const { areaScores, primaryWeakness, sampleAsOf } = data;
  const score = areaScores.find((item) => item.area === area)?.score ?? primaryWeakness.score;
  const skill = area === primaryWeakness.area ? primaryWeakness.skill : "영역 종합";
  return <div className="space-y-4 px-5 py-4">
    <section className="rounded-card border border-border bg-surface p-4">{area === primaryWeakness.area ? <span className="rounded bg-[#E85A4F] px-1.5 py-1 text-[11px] font-bold text-white">1순위 취약</span> : null}<h2 className="mt-3 text-xl font-bold">{area}</h2><p className="mt-2 text-sm text-muted">{skill} · 정답률 <strong className="text-[#E85A4F]">{score}%</strong></p></section>
    <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold text-muted">5개 영역 정답률 비교</h3><div className="mt-3 h-52" aria-label="영역별 정답률 막대 차트"><ResponsiveContainer width="100%" height="100%"><BarChart data={areaScores} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 2 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0,100]} tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="area" width={48} tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /><Bar dataKey="score" radius={[0,5,5,0]} animationDuration={650}>{areaScores.map((item) => <Cell key={item.area} fill={item.area === area ? "#FFC7A2" : "#8CC0EB"} />)}</Bar></BarChart></ResponsiveContainer></div></section>
    <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold text-muted">최근 4주 학습 패턴</h3><dl className="mt-3 divide-y divide-divider text-sm"><Row label="학습 빈도" value={primaryWeakness.studyFrequency} /><Row label="평균 풀이 시간" value={primaryWeakness.averageTime} /><Row label="근거 문항 수" value={`${primaryWeakness.evidenceQuestionCount}문항`} /></dl></section>
    {primaryWeakness.relatedRecordId ? <Link href={routeBuilders.parent.record(primaryWeakness.relatedRecordId)} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">관련 학습기록 보기</Link> : null}
    <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `weakness-${area}`, label: `${area} 취약 영역 분석`, detail: `${skill} · 정답률 ${score}%` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
    <div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-[#7C6210]"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>백분위와 취약 영역은 동일 학년의 익명 학습 표본을 기준으로 산출됩니다. 기준일 {sampleAsOf}</p></div>
  </div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="ml-auto text-right font-semibold">{value}</dd></div>; }
