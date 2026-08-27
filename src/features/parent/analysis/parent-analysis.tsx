"use client";

import { AlertTriangle, ChevronRight, Link2, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { routeBuilders } from "@/config/routes";
import { useParentAnalysisQuery } from "@/features/parent/api/queries";
import type { ParentAnalysisResponse } from "@/features/parent/model/types";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentAnalysis() {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { accuracy, baselineAccuracy, weaknessImprovement, comparisonMonth, analysisAsOf, areaScores, accuracyTrend, primaryWeakness } = data;

  return (
    <div className="space-y-4 px-5 py-4">
      <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs text-muted">지난달 대비 약점 개선도</p><strong className="mt-1 block text-[34px] leading-10 text-action">+{weaknessImprovement}%p</strong></div>
          <div className="text-right"><p className="text-xs text-muted">이번 달 정답률</p><strong className="mt-1 block text-2xl">{accuracy}%</strong><p className="mt-1 text-[11px] text-subtle">내 기준 {baselineAccuracy}%</p></div>
        </div>
        <p className="mt-3 text-[11px] text-subtle">우선 보완 영역 정답률 · {comparisonMonth} 대비 · {analysisAsOf} 기준</p>
      </section>

      <dl className="grid grid-cols-3 gap-2">
        <CompactMetric label="채점 문항" value={`${data.gradedQuestionCount}`} suffix="문항" />
        <CompactMetric label="다시 보기" value={`${data.reviewQuestionCount}`} suffix="문항" action />
        <CompactMetric label="반복 실수" value={`${data.repeatedMistakeCount}`} suffix="건" danger />
      </dl>

      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">영역별 성취도</h2>
        <p className="mt-1 text-[11px] text-subtle">이번 달 자기 평균을 기준으로 영역별 차이를 확인합니다.</p>
        <div className="mt-2 grid grid-cols-[1fr_120px] items-center">
          <div className="h-48" aria-label="영역별 성취도 레이더 차트"><ResponsiveContainer width="100%" height="100%"><RadarChart data={areaScores} outerRadius="62%"><PolarGrid stroke="#DCE4EC" /><PolarAngleAxis dataKey="area" tick={{ fill: "#667085", fontSize: 10 }} /><Radar dataKey="score" stroke="#4C75DD" fill="#BFDDF0" fillOpacity={0.55} animationDuration={650} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /></RadarChart></ResponsiveContainer></div>
          <dl className="space-y-2 text-xs">{areaScores.map((item) => <div key={item.area} className={`flex justify-between gap-2 ${item.area === primaryWeakness.area ? "font-bold text-[#E85A4F]" : ""}`}><dt>{item.area}</dt><dd className="font-bold">{item.score}%</dd></div>)}</dl>
        </div>
        <p className="text-[11px] text-subtle">미측정 영역은 표기하지 않습니다.</p>
      </section>

      <Link href={routeBuilders.parent.weakness(primaryWeakness.area)} className="block rounded-card border border-[#FFD2B8] bg-[#FFF8F3] p-4">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-[#9A4D2D]"><RotateCcw size={19} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded bg-[#E85A4F] px-1.5 py-1 text-[11px] font-bold text-white">1순위 취약</span><strong className="text-sm">{primaryWeakness.area} · {primaryWeakness.skill}</strong></div><p className="mt-2 text-xs text-muted">정답률 {primaryWeakness.score}% · 자기 기준보다 {baselineAccuracy - primaryWeakness.score}%p 낮음</p><p className="mt-1 text-[11px] text-subtle">채점 {primaryWeakness.evidenceQuestionCount}문항 · 반복 실수 {primaryWeakness.repeatedMistakeCount}건</p></div><ChevronRight className="mt-2 shrink-0 text-action" size={18} /></div>
      </Link>

      <section className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-end justify-between"><div><h2 className="text-sm font-bold">최근 정답률 흐름</h2><p className="mt-1 text-[11px] text-subtle">회색 점선은 이 학생의 최근 기준선입니다.</p></div><strong>{accuracy}%</strong></div>
        <div className="mt-2 h-44"><ResponsiveContainer width="100%" height="100%"><LineChart data={accuracyTrend} margin={{ top: 12, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><ReferenceLine y={baselineAccuracy} stroke="#98A2B3" strokeDasharray="5 4" /><Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ r: 4, fill: "#8CC0EB", strokeWidth: 0 }} animationDuration={650} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /></LineChart></ResponsiveContainer></div>
      </section>

      <WeeklyEvidence data={data} />

      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">먼저 보완할 순서</h2>
        <div className="mt-3 divide-y divide-divider">{data.weaknessRanking.map((item) => <div key={`${item.area}-${item.skill}`} className="flex items-center gap-3 py-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${item.status === "confirmed" ? "bg-[#FFF0EA] text-[#C9572B]" : "bg-[#F0F2F5] text-muted"}`}>{item.rank}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.area} · {item.skill}</p><p className="mt-0.5 text-[11px] text-subtle">{item.questionCount}문항 · 자기 기준보다 {Math.abs(item.gapFromBaseline)}%p 낮음</p></div><div className="text-right"><strong>{item.accuracy}%</strong><p className={`text-[10px] font-semibold ${item.status === "confirmed" ? "text-[#C9572B]" : "text-subtle"}`}>{item.status === "confirmed" ? "약점 확정" : "더 확인"}</p></div></div>)}</div>
      </section>

      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">반복해서 나타난 실수</h2>
        <div className="mt-3 space-y-2">{data.misconceptionSummary.map((item) => <div key={`${item.area}-${item.label}`} className="flex items-center rounded-xl bg-[#F7F8FA] px-3 py-3 text-sm"><span className="text-muted">{item.area}</span><strong className="ml-2">{item.label}</strong><span className="ml-auto font-bold text-[#E85A4F]">{item.count}건</span></div>)}</div>
      </section>

      <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `monthly-analysis-${analysisAsOf}`, label: `${analysisAsOf} 기준 고급 분석`, detail: `지난달 대비 약점 개선도 +${weaknessImprovement}%p · 우선 보완 ${primaryWeakness.area} ${primaryWeakness.score}%` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
    </div>
  );
}

export function WeaknessDetail({ area }: { area: string }) {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");
  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { areaScores, primaryWeakness, analysisAsOf, baselineAccuracy } = data;
  const score = areaScores.find((item) => item.area === area)?.score ?? primaryWeakness.score;
  const isPrimary = area === primaryWeakness.area;
  const skill = isPrimary ? primaryWeakness.skill : "영역 종합";

  return (
    <div className="space-y-4 px-5 py-4">
      <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
        <div className="flex items-center justify-between">{isPrimary ? <span className="rounded bg-[#E85A4F] px-2 py-1 text-[11px] font-bold text-white">약점 확정</span> : <span className="rounded bg-[#F0F2F5] px-2 py-1 text-[11px] font-bold text-muted">영역 분석</span>}<span className="text-[11px] text-subtle">{analysisAsOf} 기준</span></div>
        <h2 className="mt-3 text-xl font-bold">{area} · {skill}</h2>
        <div className="mt-4 flex items-end gap-3"><strong className="text-[34px] leading-10 text-[#E85A4F]">{score}%</strong><p className="pb-1 text-xs text-muted">내 기준 {baselineAccuracy}%보다 <strong>{baselineAccuracy - score}%p 낮음</strong></p></div>
        <p className="mt-3 text-[11px] text-subtle">채점 {primaryWeakness.evidenceQuestionCount}문항을 근거로 판정했습니다.</p>
      </section>

      {isPrimary ? <section className="rounded-card border border-[#B9D8EF] bg-[#F2F9FE] p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#BFDDF0] text-[#2F6FA7]"><Sparkles size={18} /></span><div><p className="text-xs text-muted">지난달 대비 개선</p><p className="mt-0.5 text-sm font-bold">{primaryWeakness.previousMonthScore}% → {primaryWeakness.score}% <span className="text-action">(+{primaryWeakness.score - primaryWeakness.previousMonthScore}%p)</span></p></div></div></section> : null}

      <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold">5개 영역 정답률 비교</h3><div className="mt-3 h-52" aria-label="영역별 정답률 막대 차트"><ResponsiveContainer width="100%" height="100%"><BarChart data={areaScores} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 2 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="area" width={48} tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} /><ReferenceLine x={baselineAccuracy} stroke="#98A2B3" strokeDasharray="5 4" /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /><Bar dataKey="score" radius={[0, 5, 5, 0]} animationDuration={650}>{areaScores.map((item) => <Cell key={item.area} fill={item.area === area ? "#FFC7A2" : "#8CC0EB"} />)}</Bar></BarChart></ResponsiveContainer></div><p className="text-[11px] text-subtle">회색 점선은 이번 달 자기 평균입니다.</p></section>

      {isPrimary ? <>
        <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold">왜 이 영역이 약점인가요?</h3><dl className="mt-3 divide-y divide-divider text-sm"><Row label="반복 실수" value={`${primaryWeakness.misconception} ${primaryWeakness.repeatedMistakeCount}건`} /><Row label="평균 풀이 시간" value={primaryWeakness.averageTime} /><Row label="학습 빈도" value={primaryWeakness.studyFrequency} /></dl></section>
        <section className="rounded-card border border-border bg-surface p-4"><div className="flex items-center gap-2"><Link2 size={17} className="text-action" /><h3 className="text-sm font-bold">함께 살펴볼 연결 유형</h3></div><div className="mt-3 space-y-2">{primaryWeakness.linkedWeaknesses.map((item) => <div key={item.label} className="flex items-center rounded-xl bg-[#F7F8FA] p-3 text-sm"><span>{item.label}</span><span className="ml-auto text-xs font-semibold text-muted">연결 {item.relationScore}/100</span></div>)}</div><p className="mt-3 text-[11px] leading-5 text-subtle">한 유형만 보지 않고, 함께 막힌 앞선 유형과 실제 기록을 같이 확인합니다.</p></section>
        <section className="rounded-card border border-[#FFD2B8] bg-[#FFF8F3] p-4"><h3 className="text-sm font-bold">다음 학습 제안</h3><p className="mt-2 text-sm leading-6 text-muted">{primaryWeakness.nextAction}</p></section>
      </> : null}

      {primaryWeakness.relatedRecordId ? <Link href={routeBuilders.parent.record(primaryWeakness.relatedRecordId)} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">근거 학습기록 보기</Link> : null}
      <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `weakness-${area}`, label: `${area} 취약 영역 분석`, detail: `${skill} · 정답률 ${score}% · 자기 기준 대비 ${score - baselineAccuracy}%p` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
      <div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-[#7C6210]"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>10문항 미만인 유형은 약점으로 단정하지 않고 판단 보류로 표시합니다.</p></div>
    </div>
  );
}

function WeeklyEvidence({ data }: { data: ParentAnalysisResponse }) {
  return <section className="rounded-card border border-border bg-surface p-4"><h2 className="text-sm font-bold">주간 학습 근거</h2><p className="mt-1 text-[11px] text-subtle">정답률만이 아니라 학습량과 반복 실수를 함께 봅니다.</p><div className="mt-3 space-y-2">{data.weeklySummary.map((week) => <div key={week.label} className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl bg-[#F7F8FA] px-3 py-3"><strong className="text-xs">{week.label}</strong><div><p className="text-xs font-semibold">정답률 {week.accuracy}% · {week.questionCount}문항</p><p className="mt-0.5 text-[10px] text-subtle">다시 보기 {week.reviewCount}문항</p></div><span className={`text-[10px] font-bold ${week.repeatedMistakes == null ? "text-subtle" : "text-[#C9572B]"}`}>{week.repeatedMistakes == null ? "판단 보류" : `반복 ${week.repeatedMistakes}건`}</span></div>)}</div><div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-3 text-xs"><span className="text-muted">출제 난이도 분포</span><div className="flex gap-2">{data.difficultyDistribution.map((item) => <span key={item.level} className="font-semibold">{item.level} {item.count}</span>)}</div></div></section>;
}

function CompactMetric({ label, value, suffix, action = false, danger = false }: { label: string; value: string; suffix: string; action?: boolean; danger?: boolean }) { return <div className="rounded-card border border-border bg-surface p-3 text-center"><dd className={`text-xl font-bold ${action ? "text-action" : danger ? "text-[#E85A4F]" : ""}`}>{value}<span className="ml-0.5 text-xs">{suffix}</span></dd><dt className="mt-1 text-[11px] text-muted">{label}</dt></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="ml-auto max-w-[230px] text-right font-semibold">{value}</dd></div>; }
function LoadingState() { return <div className="space-y-3 p-5"><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-64 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="p-8 text-center"><p className="text-sm font-bold">분석 데이터를 불러오지 못했어요.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>; }
