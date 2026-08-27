"use client";

import { AlertCircle, CheckCircle2, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useParentRecordQuery } from "@/features/parent/api/queries";
import type { ParentRecord } from "@/features/parent/model/types";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

const STATUS_META = {
  stable: { label: "안정", className: "bg-[#E8F6F1] text-[#26856B]" },
  weak: { label: "먼저 보완", className: "bg-[#FFF0EA] text-[#C9572B]" },
  insufficient: { label: "판단 보류", className: "bg-[#F0F2F5] text-muted" },
} as const;

export function ParentRecordDetail({ recordId }: { recordId: string }) {
  const child = useSelectedChild();
  const { data: record, isLoading, isError, refetch } = useParentRecordQuery(child?.studentId ?? "", recordId);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!record) return <div className="p-8 text-center text-sm text-muted">해당 학습기록을 찾을 수 없습니다.</div>;

  const { detail } = record;

  return (
    <div className="space-y-4 px-5 py-4">
      <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
        <p className="text-xs font-semibold text-[#C9572B]">{record.area}</p>
        <h2 className="mt-2 text-lg font-bold">{record.title}</h2>
        <p className="mt-2 text-xs text-subtle">2026.{record.date} · 채점 {record.questionCount}문항 · {record.elapsed}</p>
      </section>

      {/* 🔴 「다시 보기」·「반복 실수」는 계약에 원천이 없어 감춘다
          (LearningRecordDetail 에 reviewCount·repeatedMistakeCount 가 없다). */}
      <dl className="grid grid-cols-1 gap-2">
        <Metric label="맞힌 문항" value={`${detail.correctCount}개`} />
      </dl>

      {/* 🔴 insight 는 계약에 원천이 없다. weakness.description 이 AVAILABLE 일 때만 값이 있고,
          없으면 섹션째 감춘다 — 제목만 남은 빈 카드를 두지 않는다. */}
      {detail.insight ? (
      <section className="rounded-card border border-[#FFD2B8] bg-[#FFF8F3] p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-[#7D452C]"><Eye size={18} /></span>
          <div><h3 className="text-sm font-bold">이 기록에서 확인된 핵심</h3><p className="mt-1 text-sm leading-6 text-muted">{detail.insight}</p></div>
        </div>
      </section>
      ) : null}

      <section className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-end justify-between">
          <div><h3 className="text-sm font-bold">정답률 흐름</h3><p className="mt-1 text-[11px] text-subtle">다른 학생이 아닌, 본인의 최근 기준선과 비교합니다.</p></div>
          <strong className="text-xl">{record.accuracy}%</strong>
        </div>
        <div className="mt-3 h-44" aria-label="정답률 추이 선 차트">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={record.trend} margin={{ top: 12, right: 8, bottom: 0, left: -26 }}>
              <CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} ticks={[40, 55, 70, 85, 100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, "정답률"]} />
              
              <Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ fill: "#8CC0EB", r: 4, strokeWidth: 0 }} animationDuration={650} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 🔴 skillResults 는 계약에 원천이 없다. 비면 섹션째 감춘다. */}
      {detail.skillResults.length ? (
      <section className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-center justify-between"><h3 className="text-sm font-bold">유형별 학습 결과</h3><span className="text-[11px] text-subtle">10문항 미만 판단 보류</span></div>
        <div className="mt-3 divide-y divide-divider">
          {detail.skillResults.map((result) => <SkillResult key={result.skill} result={result} />)}
        </div>
        <div className="mt-3 flex gap-2 rounded-xl bg-[#F7F8FA] p-3 text-[11px] leading-5 text-muted"><AlertCircle size={16} className="mt-0.5 shrink-0" />표본이 적은 유형을 약점으로 단정하지 않고 다음 학습까지 지켜봅니다.</div>
      </section>
      ) : null}

      {detail.totalTime ? (
      <section className="rounded-card border border-border bg-surface p-4">
        <h3 className="text-sm font-bold">풀이 세부 정보</h3>
        {/* 🔴 「오답 유형」·「시간 초과 문항」은 계약에 원천이 없어 감춘다. */}
        <dl className="mt-3 divide-y divide-divider text-sm"><Row label="총 풀이 시간" value={detail.totalTime} /></dl>
      </section>
      ) : null}

      <div className="space-y-2">
        <Link href={ROUTES.parent.analysis} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">고급 분석 전체 보기</Link>
        <Link href={routeBuilders.parent.newConsultation({ type: "record", id: record.id, label: record.title, detail: `${record.area} · 정답률 ${record.accuracy}% · 다시 볼 문항 ${detail.reviewCount}개` })} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">이 학습기록으로 상담 요청</Link>
      </div>
    </div>
  );
}

function SkillResult({ result }: { result: ParentRecord["detail"]["skillResults"][number] }) {
  const meta = STATUS_META[result.status];
  const iconClass = result.status === "stable" ? "bg-[#E8F6F1] text-[#26856B]" : result.status === "weak" ? "bg-[#FFF0EA] text-[#C9572B]" : "bg-[#F0F2F5] text-subtle";
  return <div className="flex items-center gap-3 py-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${iconClass}`}>{result.status === "stable" ? <CheckCircle2 size={17} /> : result.status === "weak" ? <RotateCcw size={16} /> : <AlertCircle size={16} />}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{result.skill}</p><p className="mt-0.5 text-[11px] text-subtle">채점 {result.questionCount}문항</p></div><div className="text-right"><strong className="text-base">{result.accuracy == null ? "—" : `${result.accuracy}%`}</strong><span className={`ml-2 inline-block rounded-md px-2 py-1 text-[10px] font-bold ${meta.className}`}>{meta.label}</span></div></div>;
}

function Metric({ label, value, accent = false, danger = false }: { label: string; value: string; accent?: boolean; danger?: boolean }) { return <div className="rounded-card border border-border bg-surface p-3 text-center"><dd className={`text-lg font-bold ${accent ? "text-action" : danger ? "text-[#E85A4F]" : ""}`}>{value}</dd><dt className="mt-1 text-[11px] text-muted">{label}</dt></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="ml-auto max-w-[210px] text-right font-semibold">{value}</dd></div>; }
function LoadingState() { return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-52 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="p-8 text-center"><p className="text-sm font-bold">학습기록을 불러오지 못했어요.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>; }
