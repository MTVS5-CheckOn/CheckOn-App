"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { useSaveProgressMutation } from "@/features/student/quiz/queries";
import { useQuizAttempt } from "@/features/student/quiz/use-quiz-attempt";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

export function QuizSolver({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { attemptId, inProgress, isLoading, isError, refetch } = useQuizAttempt(worksheetId);
  const { currentIndex, answers, elapsedSecondsByItem, timerStatus, moveTo, selectAnswer, addElapsedSeconds, pauseForQuestion, restorePendingDelta, setVersion, resume } = useQuizSessionStore();
  const saveProgress = useSaveProgressMutation(attemptId);
  const questions = inProgress?.items ?? [];
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1));
  const question = questions[safeIndex];
  const selectedAnswer = question ? answers[question.itemId] : undefined;

  useEffect(() => { if (inProgress) resume(); }, [inProgress, resume]);

  // autosave — 이탈 후 돌아와도 서버에 저장된 답안이 복원되도록 주기적으로 보낸다.
  useEffect(() => {
    if (!attemptId || !inProgress) return;
    const interval = window.setInterval(() => {
      const state = useQuizSessionStore.getState();
      const delta = state.takePendingDelta();
      if (Object.keys(delta).length === 0 && Object.keys(state.answers).length === 0) return;
      saveProgress.mutate(
        { baseVersion: state.version, clientSequence: state.nextSequence(), currentItemId: question?.itemId ?? null, answers: state.answers, activeElapsedSecondsDelta: delta },
        {
          onSuccess: (result) => setVersion(result.version),
          // 🔴 실패한 delta 를 버리지 않는다. 다음 요청으로 넘긴다.
          onError: () => restorePendingDelta(delta),
        },
      );
    }, 10_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, inProgress, question?.itemId]);
  useEffect(() => {
    if (timerStatus !== "running" || !question) return;
    const interval = window.setInterval(() => {
      if (useQuizSessionStore.getState().timerStatus === "running") addElapsedSeconds(question.itemId, 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [addElapsedSeconds, question, timerStatus]);

  if (isLoading) return <div className="space-y-3 p-5"><div className="h-12 animate-pulse bg-[#E9EDF2]" /><div className="h-64 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !question) return <div className="p-8 text-center"><p className="text-sm font-bold">문제를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;

  const goQuestion = () => { pauseForQuestion(); router.push(routeBuilders.student.worksheetQuestion(worksheetId)); };
  const goNext = () => safeIndex === questions.length - 1 ? router.push(routeBuilders.student.submitWorksheet(worksheetId)) : moveTo(safeIndex + 1);

  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col">
      <div className="border-b border-divider bg-surface">
        <div className="flex h-[52px] items-center justify-between px-5 text-sm font-bold"><span className="text-action">{safeIndex + 1} / {questions.length}</span><time className="text-lg text-[#D96534]">{formatElapsed(elapsedSecondsByItem[question.itemId] ?? 0)}</time></div>
        <div className="h-1 bg-[#E8EBEF]"><span className="block h-full bg-brand transition-[width]" style={{ width: `${((safeIndex + 1) / questions.length) * 100}%` }} /></div>
      </div>
      <main className="flex-1 space-y-3 px-5 pb-44 pt-5">
        {question.passage ? <section className="whitespace-pre-line rounded-card border border-border bg-surface p-4 text-sm leading-7 text-muted">{question.passage}</section> : null}
        <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><p className="text-xs font-bold text-[#D96534]">{question.ordinal}번 문항</p><h2 className="mt-3 text-[17px] font-extrabold leading-7">{question.stem}</h2></section>
        <fieldset className="space-y-2.5"><legend className="sr-only">답안 선택</legend>{question.options.map((option) => { const selected = option.no === selectedAnswer; return <label key={option.no} className={`flex min-h-[60px] cursor-pointer items-center rounded-[14px] border px-4 text-[15px] leading-6 ${selected ? "border-brand bg-[#FFF6F0] font-semibold" : "border-border bg-surface"}`}><input type="radio" name={question.itemId} value={option.no} checked={selected} onChange={() => selectAnswer(question.itemId, option.no)} className="sr-only" /><span className="mr-2 font-bold">{option.no}.</span>{option.text}</label>; })}</fieldset>
      </main>
      <div className="sticky bottom-0 z-20 space-y-2 border-t border-divider bg-surface/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgb(32_41_57/6%)] backdrop-blur">
        <ActionButton variant="ghost" onClick={goQuestion}>이 문제 질문</ActionButton>
        <div className="grid grid-cols-2 gap-2"><ActionButton variant="ghost" disabled={safeIndex === 0} onClick={() => moveTo(safeIndex - 1)}>이전 문제</ActionButton><ActionButton onClick={goNext}>{safeIndex === questions.length - 1 ? "답안 제출" : "다음 문제"}</ActionButton></div>
      </div>
    </div>
  );
}
