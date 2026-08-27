"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { useAttemptResultQuery } from "@/features/student/quiz/queries";
import { useQuizSessionStore } from "@/stores/quiz-session.store";
import { ROUTES, routeBuilders } from "@/config/routes";

type ResultFilter = "all" | "correct" | "incorrect";

export function QuizResults({ worksheetId }: { worksheetId: string }) {
  /**
   * 🔴 단일 출처: 서버 `getResult(attemptId)` 하나만 본다.
   * 세션 store 의 답안·경과시간이나 학습기록 store 를 섞지 않는다.
   * 섞는 순간 화면이 서버 채점과 다른 값을 말하기 시작한다.
   */
  const { assignmentId, attemptId } = useQuizSessionStore();
  const matchedAttemptId = assignmentId === worksheetId ? attemptId : null;
  const { data: result, isLoading, isError, error, refetch } = useAttemptResultQuery(matchedAttemptId);
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (isLoading) return <div className="p-5"><div className="h-96 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;

  // 🔴 미제출 attempt 는 404 다. 오류 화면이 아니라 "아직 제출 전" 빈 상태로 그린다.
  const notSubmitted = !matchedAttemptId || (isError && (error as { status?: number } | null)?.status === 404);
  if (notSubmitted) {
    return (
      <div className="px-5 py-10 text-center" role="status">
        <h2 className="text-lg font-bold">아직 채점 결과가 없어요</h2>
        <p className="mt-2 text-sm leading-6 text-muted">학습지를 모두 푼 뒤 답안을 제출하면<br />선생님 채점 결과를 확인할 수 있습니다.</p>
        <Link href={routeBuilders.student.solveWorksheet(worksheetId)} className="mt-5 flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold">문제 풀기 시작</Link>
      </div>
    );
  }

  if (isError || !result) return <div className="p-8 text-center"><p className="text-sm font-bold">채점 결과를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;

  // 🔴 서버가 준 correctCount·itemCount·accuracyRate 를 그대로 쓴다. 다시 세지 않는다.
  const { correctCount, itemCount, accuracyRate, totalActiveElapsedSeconds } = result;
  const incorrectCount = itemCount - correctCount;
  // 🔴 accuracyRate 는 0~1 이다. ×100 은 표시 계층에서 한 번만.
  const accuracyPercent = Math.round(accuracyRate * 100);
  const visible = result.items.filter((item) => filter === "all" || (filter === "correct" ? item.correct : !item.correct));

  return (
    <div className="space-y-3 px-5 py-5">
      <section className="rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]"><div className="rounded-2xl bg-[#FFF1E7] py-2"><strong className="text-5xl font-extrabold">{accuracyPercent}<span className="text-2xl">%</span></strong><p className="mt-1 text-sm text-muted">{itemCount}문항 중 {correctCount}문항 정답</p></div><div className="mt-4 grid grid-cols-3 gap-2"><Metric value={correctCount} label="정답" className="bg-[#E8F6F1] text-[#26856B]" /><Metric value={incorrectCount} label="오답·미응답" className="bg-[#FFF0EE] text-[#E85A4F]" /><Metric value={formatElapsed(totalActiveElapsedSeconds)} label="총 풀이시간" className="bg-[#F4F6F8]" /></div></section>
      <div className="flex gap-2">{([['all','전체'],['correct','정답'],['incorrect','오답']] as const).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`h-[34px] rounded-full border px-4 text-[13px] font-semibold ${filter === value ? "border-brand bg-brand" : "border-border bg-surface text-muted"}`}>{label}</button>)}</div>
      <p className="text-xs font-bold text-subtle">문항별 결과 ({visible.length})</p>
      {visible.length === 0 ? <p className="rounded-card border border-border bg-surface px-5 py-10 text-center text-sm text-muted">해당하는 문항이 없어요.</p> : null}
      <div className="space-y-2.5">{visible.map((item) => { const open = openItemId === item.itemId; const selectedText = item.selectedNo ? item.options.find((option) => option.no === item.selectedNo)?.text : null; const correctText = item.options.find((option) => option.no === item.correctNo)?.text ?? ""; return <article key={item.itemId} className="overflow-hidden rounded-card border border-border bg-surface"><button type="button" onClick={() => setOpenItemId(open ? null : item.itemId)} aria-expanded={open} className="flex min-h-[60px] w-full items-center gap-3 px-4 text-left"><span className={`grid size-8 place-items-center rounded-lg text-sm font-bold ${item.correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{item.ordinal}</span><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${item.correct ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF0EE] text-[#E85A4F]"}`}>{item.correct ? "정답" : item.selectedNo ? "오답" : "미응답"}</span><span className="min-w-0 flex-1 truncate text-xs font-medium text-muted">내 답: {item.selectedNo ?? "—"} · 정답: {item.correctNo} · {formatElapsed(item.activeElapsedSeconds)}</span><ChevronDown className={`text-subtle transition ${open ? "rotate-180" : ""}`} size={18} /></button>{open ? <div className="space-y-3 border-t border-divider p-4 text-sm leading-6"><p className="font-semibold">{item.stem}</p><div className="grid grid-cols-2 gap-2"><div className={`rounded-xl p-3 ${item.correct ? "bg-[#E8F6F1]" : "bg-[#FFF0EE]"}`}><span className="text-xs text-muted">내 답</span><p className={item.correct ? "text-[#26856B]" : "text-[#D64545]"}>{selectedText ? `${item.selectedNo}. ${selectedText}` : "미응답"}</p></div><div className="rounded-xl bg-[#E8F6F1] p-3"><span className="text-xs text-muted">정답</span><p className="text-[#26856B]">{item.correctNo}. {correctText}</p></div></div><div className="rounded-xl bg-[#F4F6F8] p-3"><span className="text-xs text-muted">해설 포인트</span><p className="mt-1 text-muted">{item.explanation}</p></div></div> : null}</article>; })}</div>
      <Link href={ROUTES.student.records} className="flex h-[52px] items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold">학습기록에서 다시 보기</Link>
    </div>
  );
}

function Metric({ value, label, className }: { value: string | number; label: string; className: string }) {
  return <div className={`rounded-xl py-3 ${className}`}><strong className="block text-lg font-extrabold">{value}</strong><span className="text-[11px]">{label}</span></div>;
}
