"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { quizQuestionFixtures } from "@/features/student/quiz/mock-data";
import { useQuizSessionStore } from "@/stores/quiz-session.store";
import { routeBuilders } from "@/config/routes";
import { learningRecordFixtures } from "@/features/student/records/mock-data";
import { useLearningRecordStore } from "@/features/student/records/learning-record.store";

type ResultFilter = "all" | "correct" | "incorrect";

export function QuizResults({ worksheetId }: { worksheetId: string }) {
  const { answers, elapsedSecondsByQuestion, worksheetId: activeWorksheetId, timerStatus } = useQuizSessionStore();
  const submittedRecord = useLearningRecordStore((state) => state.submittedRecords.find((item) => item.worksheetId === worksheetId));
  const storedRecord = submittedRecord ?? learningRecordFixtures.find((item) => item.worksheetId === worksheetId);
  const hasSubmittedSession = activeWorksheetId === worksheetId && timerStatus === "submitted";
  const resolvedAnswers = hasSubmittedSession ? answers : Object.fromEntries((storedRecord?.questions ?? []).map((question) => [`q${question.number}`, question.answer]));
  const resolvedElapsed = hasSubmittedSession ? elapsedSecondsByQuestion : Object.fromEntries((storedRecord?.questions ?? []).map((question) => [`q${question.number}`, question.elapsedSeconds]));
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const results = useMemo(() => quizQuestionFixtures.slice(0, storedRecord?.questionCount ?? quizQuestionFixtures.length).map((question) => ({ ...question, answer: resolvedAnswers[question.id], correct: resolvedAnswers[question.id] === question.correctAnswer, elapsed: resolvedElapsed[question.id] ?? 0 })), [resolvedAnswers, resolvedElapsed, storedRecord?.questionCount]);
  if (!hasSubmittedSession && !storedRecord) return <div className="px-5 py-10 text-center"><h2 className="text-lg font-bold">아직 채점 결과가 없어요</h2><p className="mt-2 text-sm text-muted">학습지를 모두 푼 뒤 답안을 제출하면 결과를 확인할 수 있습니다.</p><Link href={routeBuilders.student.solveWorksheet(worksheetId)} className="mt-5 flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold">문제 풀기 시작</Link></div>;
  const correctCount = results.filter((result) => result.correct).length;
  const incorrectCount = results.length - correctCount;
  const totalSeconds = results.reduce((sum, result) => sum + result.elapsed, 0);
  const visible = results.filter((result) => filter === "all" || (filter === "correct" ? result.correct : !result.correct));
  return (
    <div className="space-y-3 px-5 py-5">
      <section className="rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]"><div className="rounded-2xl bg-[#FFF1E7] py-2"><strong className="text-5xl font-extrabold">{Math.round((correctCount / results.length) * 100)}<span className="text-2xl">%</span></strong><p className="mt-1 text-sm text-muted">{results.length}문항 중 {correctCount}문항 정답</p></div><div className="mt-4 grid grid-cols-3 gap-2"><Metric value={correctCount} label="정답" className="bg-[#E8F6F1] text-[#26856B]" /><Metric value={incorrectCount} label="오답·미응답" className="bg-[#FFF0EE] text-[#E85A4F]" /><Metric value={formatElapsed(totalSeconds)} label="총 풀이시간" className="bg-[#F4F6F8]" /></div></section>
      <div className="flex gap-2">{([['all','전체'],['correct','정답'],['incorrect','오답']] as const).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`h-[34px] rounded-full border px-4 text-[13px] font-semibold ${filter === value ? "border-brand bg-brand" : "border-border bg-surface text-muted"}`}>{label}</button>)}</div>
      <p className="text-xs font-bold text-subtle">문항별 결과 ({visible.length})</p>
      <div className="space-y-2.5">{visible.map((result, index) => { const open = openQuestionId === result.id; return <article key={result.id} className="overflow-hidden rounded-card border border-border bg-surface"><button type="button" onClick={() => setOpenQuestionId(open ? null : result.id)} aria-expanded={open} className="flex min-h-[60px] w-full items-center gap-3 px-4 text-left"><span className={`grid size-8 place-items-center rounded-lg text-sm font-bold ${result.correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{index + 1}</span><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${result.correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{result.correct ? "정답" : result.answer ? "오답" : "미응답"}</span><span className="min-w-0 flex-1 truncate text-xs font-medium text-muted">내 답: {result.answer ?? "—"} · 정답: {result.correctAnswer} · {formatElapsed(result.elapsed)}</span><ChevronDown className={`text-subtle transition ${open ? "rotate-180" : ""}`} size={18} /></button>{open ? <div className="space-y-3 border-t border-divider p-4 text-sm leading-6"><p className="font-semibold">{result.stem}</p><div className="grid grid-cols-2 gap-2"><div className={`rounded-xl p-3 ${result.correct ? "bg-[#E8F6F1]" : "bg-[#FFF0EE]"}`}><span className="text-xs text-muted">내 답</span><p className={result.correct ? "text-[#26856B]" : "text-[#D64545]"}>{result.answer ? `${result.answer}. ${result.options[result.answer - 1]}` : "미응답"}</p></div><div className="rounded-xl bg-[#E8F6F1] p-3"><span className="text-xs text-muted">정답</span><p className="text-[#26856B]">{result.correctAnswer}. {result.options[result.correctAnswer - 1]}</p></div></div><div className="rounded-xl bg-[#F4F6F8] p-3"><span className="text-xs text-muted">해설 포인트</span><p className="mt-1 text-muted">{result.explanation}</p></div></div> : null}</article>; })}</div>
    </div>
  );
}

function Metric({ value, label, className }: { value: number | string; label: string; className: string }) { return <div className={`rounded-xl py-3 ${className}`}><strong className="text-lg">{value}</strong><p className="mt-1 text-[11px] text-muted">{label}</p></div>; }
