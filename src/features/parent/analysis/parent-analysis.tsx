"use client";

import { AlertTriangle, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { routeBuilders } from "@/config/routes";
import { useParentAnalysisQuery } from "@/features/parent/api/queries";
import type { ParentAnalysisResponse } from "@/features/parent/model/types";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentAnalysis() {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { accuracy, weaknessImprovement, analysisAsOf, areaScores, accuracyTrend, primaryWeakness } = data;

  return (
    <div className="space-y-4 px-5 py-4">
      <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs text-muted">지난달 대비 약점 개선도</p><strong className="mt-1 block text-[34px] leading-10 text-action">+{weaknessImprovement}%p</strong></div>
          {/* 🔴 baselineAccuracy(내 기준선)는 계약에 원천이 없어 감춘다 — ParentAnalysis 에 해당 필드가 없다. */}
          <div className="text-right"><p className="text-xs text-muted">이번 달 정답률</p><strong className="mt-1 block text-2xl">{accuracy}%</strong></div>
        </div>
        {/* 🔴 comparisonMonth 는 계약에 없다. analysisAsOf(calculatedAt)만 값이 있을 때 보여준다. */}
        {analysisAsOf ? <p className="mt-3 text-[11px] text-subtle">{analysisAsOf} 기준</p> : null}
      </section>

      {/* 🔴 「다시 보기」·「반복 실수」는 계약에 원천이 없어 감춘다
          (ParentAnalysis 에 reviewQuestionCount·repeatedMistakeCount 가 없다).
          남은 「채점 문항」은 overall.scoredCount 로 값이 있을 때만 그린다. */}
      {data.gradedQuestionCount ? (
        <dl className="grid grid-cols-1 gap-2">
          <CompactMetric label="채점 문항" value={`${data.gradedQuestionCount}`} suffix="문항" />
        </dl>
      ) : null}

      {/* 🔴 areaScores 가 비면 섹션째 감춘다. 빈 레이더 차트를 그리면 「측정했는데 0」처럼 보인다. */}
      {areaScores.length > 0 ? (
      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">영역별 성취도</h2>
        <p className="mt-1 text-[11px] text-subtle">이번 달 자기 평균을 기준으로 영역별 차이를 확인합니다.</p>
        <div className="mt-2 grid grid-cols-[1fr_120px] items-center">
          <div className="h-48" aria-label="영역별 성취도 레이더 차트"><ResponsiveContainer width="100%" height="100%"><RadarChart data={areaScores} outerRadius="62%"><PolarGrid stroke="#DCE4EC" /><PolarAngleAxis dataKey="area" tick={{ fill: "#667085", fontSize: 10 }} /><Radar dataKey="score" stroke="#4C75DD" fill="#BFDDF0" fillOpacity={0.55} animationDuration={650} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /></RadarChart></ResponsiveContainer></div>
          <dl className="space-y-2 text-xs">{areaScores.map((item) => <div key={item.area} className={`flex justify-between gap-2 ${item.area === primaryWeakness.area ? "font-bold text-[#E85A4F]" : ""}`}><dt>{item.area}</dt><dd className="font-bold">{item.score}%</dd></div>)}</dl>
        </div>
        <p className="text-[11px] text-subtle">미측정 영역은 표기하지 않습니다.</p>
      </section>
      ) : null}

      {/* 약점이 확정되지 않으면(area 빈 문자열) 링크를 감춘다. */}
      {primaryWeakness.area ? (
      <Link href={routeBuilders.parent.weakness(primaryWeakness.area)} className="block rounded-card border border-[#FFD2B8] bg-[#FFF8F3] p-4">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-[#9A4D2D]"><RotateCcw size={19} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded bg-[#E85A4F] px-1.5 py-1 text-[11px] font-bold text-white">1순위 취약</span><strong className="text-sm">{primaryWeakness.area} · {primaryWeakness.skill}</strong></div><p className="mt-2 text-xs text-muted">정답률 {primaryWeakness.score}% · </p><p className="mt-1 text-[11px] text-subtle">채점 {primaryWeakness.evidenceQuestionCount}문항 · 반복 실수 {primaryWeakness.repeatedMistakeCount}건</p></div><ChevronRight className="mt-2 shrink-0 text-action" size={18} /></div>
      </Link>
      ) : null}

      {/* 🔴 accuracyTrend 가 비면 섹션째 감춘다. 빈 차트는 데이터가 0이라는 뜻이 아니다. */}
      {accuracyTrend.length > 0 ? (
      <section className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-end justify-between"><div><h2 className="text-sm font-bold">최근 정답률 흐름</h2><p className="mt-1 text-[11px] text-subtle">회색 점선은 이 학생의 최근 기준선입니다.</p></div><strong>{accuracy}%</strong></div>
        <div className="mt-2 h-44"><ResponsiveContainer width="100%" height="100%"><LineChart data={accuracyTrend} margin={{ top: 12, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} /><Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ r: 4, fill: "#8CC0EB", strokeWidth: 0 }} animationDuration={650} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /></LineChart></ResponsiveContainer></div>
      </section>
      ) : null}

      {/* 🔴 WeeklyEvidence 는 weeklySummary·difficultyDistribution 을 쓰는데
          둘 다 계약(ParentAnalysis)에 원천이 없다. 영구 감춤. */}

      {/* 약점 랭킹이 없으면 섹션째 감춘다. */}
      {data.weaknessRanking.length > 0 ? (
      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">먼저 보완할 순서</h2>
        <div className="mt-3 divide-y divide-divider">{data.weaknessRanking.map((item) => {
          // 🔴 표본이 최소치에 못 미치면 「판단 보류」다. 화면이 이미 그렇게 약속했고,
          //    그 최소치는 응답의 improvement.minimumSampleSize 에 있다.
          const pending = item.minimumSampleSize != null && item.questionCount < item.minimumSampleSize;
          return <div key={`${item.area}-${item.skill}`} className="flex items-center gap-3 py-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#F0F2F5] text-xs font-bold text-muted">{item.rank}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.area} · {item.skill}</p>
              {/* 🔴 accuracyDeltaPp 는 전월 대비이고 양수면 개선이다. 방향을 그대로 말하고,
                  값을 낼 수 없으면(표본 부족 등) 아예 표시하지 않는다 — 0%p 로 채우지 않는다. */}
              <p className="mt-0.5 text-[11px] text-subtle">
                {item.questionCount}문항{item.accuracyDeltaPp != null ? ` · 지난달보다 ${Math.abs(item.accuracyDeltaPp)}%p ${item.accuracyDeltaPp >= 0 ? "높음" : "낮음"}` : ""}
              </p>
            </div>
            <div className="text-right">
              <strong>{item.accuracy}%</strong>
              {pending ? <p className="text-[10px] font-semibold text-subtle">판단 보류</p> : null}
            </div>
          </div>;
        })}</div>
      </section>
      ) : null}

      {/* 🔴 misconceptionSummary 는 계약에 원천이 없다(ParentAnalysis 에 필드 자체가 없다). 영구 감춤. */}
      {/* 🔴 「반복해서 나타난 실수」 섹션은 misconceptionSummary 를 쓰는데 계약에 원천이 없다.
          영구 감춤 — 타입·adapter 는 되살릴 수 있게 남겨 뒀다. */}

      <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `monthly-analysis-${analysisAsOf}`, label: `${analysisAsOf} 기준 고급 분석`, detail: `지난달 대비 약점 개선도 +${weaknessImprovement}%p · 우선 보완 ${primaryWeakness.area} ${primaryWeakness.score}%` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
    </div>
  );
}

export function WeaknessDetail({ area }: { area: string }) {
  const child = useSelectedChild();
  const { data, isLoading, isError, refetch } = useParentAnalysisQuery(child?.studentId ?? "");
  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { areaScores, primaryWeakness, analysisAsOf } = data;
  /**
   * 🔴 계약의 `areaScores` 가 이 화면의 원천이지만 백엔드가 **키 자체를 보내지 않는다**
   * (실측: analysis 응답 최상위 키에 areaScores·accuracyTrend 가 없다).
   * 그래서 고급 분석이 이미 받은 `weaknessRanking` 으로 그린다 — **새 요청은 없다.**
   * 🔴 영역별로 평균을 내지 않는다. 한 영역에 유형이 둘 이상 오고(독서·사실 / 독서·비판)
   *    그걸 합치면 서버가 주지 않은 값을 만들어내는 것이다. 서버가 준 셀을 그대로 막대로 둔다.
   * areaScores 가 채워지면 그쪽이 계약이 의도한 원천이므로 그것을 먼저 쓴다.
   */
  const chartCells = areaScores.length
    ? areaScores.map((item) => ({ label: item.area, score: item.score, area: item.area }))
    : data.weaknessRanking.map((item) => ({ label: `${item.area}·${item.skill}`, score: item.accuracy, area: item.area }));
  // 🔴 이 영역의 점수는 서버가 준 값만 쓴다. 여러 유형을 평균 내지 않는다.
  const areaScore = areaScores.find((item) => item.area === area)?.score
    ?? (area === primaryWeakness.area ? primaryWeakness.score : null);
  const score = areaScore ?? 0;
  const isPrimary = area === primaryWeakness.area;
  const skill = isPrimary ? primaryWeakness.skill : "영역 종합";

  return (
    <div className="space-y-4 px-5 py-4">
      <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
        <div className="flex items-center justify-between">{isPrimary ? <span className="rounded bg-[#E85A4F] px-2 py-1 text-[11px] font-bold text-white">약점 확정</span> : <span className="rounded bg-[#F0F2F5] px-2 py-1 text-[11px] font-bold text-muted">영역 분석</span>}<span className="text-[11px] text-subtle">{analysisAsOf} 기준</span></div>
        <h2 className="mt-3 text-xl font-bold">{area} · {skill}</h2>
        <div className="mt-4 flex items-end gap-3"><strong className="text-[34px] leading-10 text-[#E85A4F]">{score}%</strong>{/* 🔴 baselineAccuracy(내 기준선)는 계약에 원천이 없어 감춘다. */}</div>
        <p className="mt-3 text-[11px] text-subtle">채점 {primaryWeakness.evidenceQuestionCount}문항을 근거로 판정했습니다.</p>
      </section>

      {isPrimary ? <section className="rounded-card border border-[#B9D8EF] bg-[#F2F9FE] p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#BFDDF0] text-[#2F6FA7]"><Sparkles size={18} /></span><div><p className="text-xs text-muted">지난달 대비 개선</p><p className="mt-0.5 text-sm font-bold">{primaryWeakness.previousMonthScore}% → {primaryWeakness.score}% <span className="text-action">(+{primaryWeakness.score - primaryWeakness.previousMonthScore}%p)</span></p></div></div></section> : null}

      {/* 🔴 areaScores 가 비면 weaknessRanking 셀을 그대로 그린다. 비어 있으면 섹션째 감춘다 —
          빈 카드를 두면 「그래프가 안 나온다」로 보인다. */}
      {chartCells.length ? (
      <section className="rounded-card border border-border bg-surface p-4"><h3 className="text-sm font-bold">{areaScores.length ? "영역별 정답률 비교" : "영역·유형별 정답률"}</h3><div className="mt-3 h-52" aria-label="영역별 정답률 막대 차트"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartCells} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 2 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="label" width={92} tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /><Bar dataKey="score" radius={[0, 5, 5, 0]} animationDuration={650}>{chartCells.map((item) => <Cell key={item.label} fill={item.area === area ? "#FFC7A2" : "#8CC0EB"} />)}</Bar></BarChart></ResponsiveContainer></div></section>
      ) : null}

      {/* 🔴 「왜 이 영역이 약점인가요?」·「함께 막힌 유형」·「다음 학습 제안」 세 섹션을 감춘다.
          쓰는 값이 전부 계약에 원천이 없다 — WeaknessCell 에 description·studyFrequency·
          averageTime·misconception·linkedWeaknesses·nextAction 이 모두 없다. */}

      {primaryWeakness.relatedRecordId ? <Link href={routeBuilders.parent.record(primaryWeakness.relatedRecordId)} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">근거 학습기록 보기</Link> : null}
      <Link href={routeBuilders.parent.newConsultation({ type: "analysis", id: `weakness-${area}`, label: `${area} 취약 영역 분석`, detail: `${skill} · 정답률 ${score}%` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 분석으로 상담 요청</Link>
      <div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-[#7C6210]"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>표본이 최소치에 못 미치는 유형은 약점으로 단정하지 않고 판단 보류로 표시합니다.</p></div>
    </div>
  );
}

/* 🔴 계약에 weeklySummary·difficultyDistribution 원천이 없어 현재 화면에서 감췄다.
   백엔드가 낼지 정해지면 되살린다 — 그래서 지우지 않는다. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function WeeklyEvidence({ data }: { data: ParentAnalysisResponse }) {
  return <section className="rounded-card border border-border bg-surface p-4"><h2 className="text-sm font-bold">주간 학습 근거</h2><p className="mt-1 text-[11px] text-subtle">정답률만이 아니라 학습량과 반복 실수를 함께 봅니다.</p><div className="mt-3 space-y-2">{data.weeklySummary.map((week) => <div key={week.label} className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl bg-[#F7F8FA] px-3 py-3"><strong className="text-xs">{week.label}</strong><div><p className="text-xs font-semibold">정답률 {week.accuracy}% · {week.questionCount}문항</p><p className="mt-0.5 text-[10px] text-subtle">다시 보기 {week.reviewCount}문항</p></div><span className={`text-[10px] font-bold ${week.repeatedMistakes == null ? "text-subtle" : "text-[#C9572B]"}`}>{week.repeatedMistakes == null ? "판단 보류" : `반복 ${week.repeatedMistakes}건`}</span></div>)}</div><div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-3 text-xs"><span className="text-muted">출제 난이도 분포</span><div className="flex gap-2">{data.difficultyDistribution.map((item) => <span key={item.level} className="font-semibold">{item.level} {item.count}</span>)}</div></div></section>;
}

function CompactMetric({ label, value, suffix, action = false, danger = false }: { label: string; value: string; suffix: string; action?: boolean; danger?: boolean }) { return <div className="rounded-card border border-border bg-surface p-3 text-center"><dd className={`text-xl font-bold ${action ? "text-action" : danger ? "text-[#E85A4F]" : ""}`}>{value}<span className="ml-0.5 text-xs">{suffix}</span></dd><dt className="mt-1 text-[11px] text-muted">{label}</dt></div>; }
/* 🔴 「왜 이 영역이 약점인가요?」 섹션용. 그 값들이 계약에 없어 감췄다. 되살릴 때 쓴다. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="ml-auto max-w-[230px] text-right font-semibold">{value}</dd></div>; }
function LoadingState() { return <div className="space-y-3 p-5"><div className="h-28 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-64 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="p-8 text-center"><p className="text-sm font-bold">분석 데이터를 불러오지 못했어요.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>; }
