"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { useLearningRecordQuery } from "@/features/student/records/queries";
import { useLearningRecordStore } from "@/features/student/records/learning-record.store";

type ResultFilter = "all" | "correct" | "incorrect";

export function LearningRecordDetail({ recordId }: { recordId: string }) {
  const { data: fetchedRecord, isLoading, isError, refetch } = useLearningRecordQuery(recordId);
  const submittedRecord = useLearningRecordStore((state) => state.submittedRecords.find((item) => item.id === recordId));
  const record = submittedRecord ?? fetchedRecord;
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  if (isLoading && !submittedRecord) return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-48 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError && !submittedRecord) return <div className="p-5 text-center"><p className="text-sm font-bold">학습기록을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-3 rounded-xl bg-brand px-5 py-2 text-sm font-semibold">다시 시도</button></div>;
  if (!record) return <div className="p-8 text-center text-sm text-muted">해당 학습기록을 찾을 수 없습니다.</div>;
  const accuracy = Math.round(record.correctCount / record.questionCount * 100);
  const visibleQuestions = record.questions.filter((question) => filter === "all" || (filter === "correct" ? question.answer === question.correctAnswer : question.answer !== question.correctAnswer));

  return <div className="space-y-3 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><h2 className="font-bold">{record.title}</h2><p className="mt-2 text-xs text-subtle">{record.date}　·　{record.questionCount}문항　·　{record.area}</p></section>
    <dl className="grid grid-cols-3 gap-2"><SmallMetric label="정답률" value={`${accuracy}%`} /><SmallMetric label="풀이시간" value={formatElapsed(record.elapsedSeconds)} /><SmallMetric label="오답" value={`${record.questionCount - record.correctCount}`} danger /></dl>
    <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><h3 className="text-sm font-bold text-muted">주간 정답률 추이</h3><div className="mt-2 h-40" aria-label="주간 정답률 선 차트"><ResponsiveContainer width="100%" height="100%"><LineChart data={record.trend} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}><CartesianGrid stroke="#EDF0F2" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><YAxis domain={[40, 100]} ticks={[40,55,70,85,100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, "정답률"]} /><Line type="monotone" dataKey="accuracy" stroke="#4C75DD" strokeWidth={3} dot={{ r: 4, fill: "#8CC0EB", strokeWidth: 0 }} activeDot={{ r: 6 }} animationDuration={700} /></LineChart></ResponsiveContainer></div></section>
    {/*
      🔴 백엔드가 weaknessStatus 를 항상 NO_DATA 로 고정한다
      (StudentLearningRecordQueryService:122). 그래서 이 카드는 채워지지 않는다.
      제목만 있는 주황 박스를 두면 「로딩이 덜 됐나」로 보인다 — 값이 없으면 카드째 감춘다.
    */}
    {record.weakness ? (
      <section className="rounded-card border border-[#FFC7A2] bg-[#FFF7F1] p-4"><p className="text-xs font-bold text-[#D96534]">이번 학습에서 발견된 약점</p><span className="mt-3 inline-flex rounded-lg bg-[#FFE6D5] px-2 py-1 text-xs font-bold text-[#9A4F2D]">{record.weakness}</span>{record.weaknessDescription ? <p className="mt-2 text-xs leading-5 text-[#8B5B45]">{record.weaknessDescription}</p> : null}</section>
    ) : null}
    {/* 🔴 백엔드가 학습기록 items 를 채우지 않는다(실측: itemCount 10 인데 items·itemIds 는 빈 배열).
        문항이 없으면 필터 칩과 「문항별 결과 0」만 남아 로딩이 덜 된 화면처럼 보인다 — 섹션째 감춘다. */}
    {record.questions.length ? (
    <>
    <div className="flex gap-2">{([['all','전체'],['correct','정답'],['incorrect','오답']] as const).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`h-9 rounded-full border px-4 text-xs font-semibold ${filter === value ? "border-brand bg-brand" : "border-border bg-surface text-muted"}`}>{label}</button>)}</div>
    <p className="text-xs font-semibold text-subtle">문항별 결과 {visibleQuestions.length}</p>
    <div className="space-y-2">{visibleQuestions.map((question) => { const correct = question.answer === question.correctAnswer; const open = openQuestionId === question.id; return <article key={question.id} className="overflow-hidden rounded-card border border-border bg-surface"><button onClick={() => setOpenQuestionId(open ? null : question.id)} aria-expanded={open} className="flex min-h-[62px] w-full items-center gap-3 px-4 text-left"><span className={`grid size-8 place-items-center rounded-lg text-sm font-bold ${correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{question.number}</span><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{correct ? "정답" : "오답"}</span><span className="min-w-0 flex-1 truncate text-xs text-subtle">내 답: {question.answer} · 정답: {question.correctAnswer} · {formatElapsed(question.elapsedSeconds)}</span><ChevronDown size={17} className={`text-subtle transition-transform ${open ? "rotate-180" : ""}`} /></button>{open ? <div className="space-y-3 border-t border-divider p-4 text-sm leading-6"><p className="font-semibold">{question.stem}</p><div className="rounded-xl bg-[#F4F6F8] p-3"><p className="text-xs font-bold text-muted">해설</p><p className="mt-1 text-muted">{question.explanation}</p></div></div> : null}</article>; })}</div>
    </>
    ) : null}
    <Link href={routeBuilders.student.solveWorksheet(record.worksheetId)} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">취약 유형 보완 문제 풀기</Link>
  </div>;
}

function SmallMetric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="rounded-card border border-border bg-surface p-4 text-center"><strong className={`text-xl ${danger ? "text-[#E85A4F]" : ""}`}>{value}</strong><p className="mt-1 text-xs text-muted">{label}</p></div>; }
