"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { quizQuestionFixtures } from "@/features/student/quiz/mock-data";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

export function QuizSolver({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { currentIndex, answers, elapsedSecondsByQuestion, timerStatus, start, moveTo, selectAnswer, addElapsedSeconds, pauseForQuestion } = useQuizSessionStore();
  const question = quizQuestionFixtures[currentIndex] ?? quizQuestionFixtures[0];
  const selectedAnswer = answers[question.id];

  useEffect(() => { start(worksheetId); }, [start, worksheetId]);
  useEffect(() => {
    if (timerStatus !== "running") return;
    const interval = window.setInterval(() => {
      if (useQuizSessionStore.getState().timerStatus === "running") addElapsedSeconds(question.id, 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [addElapsedSeconds, question.id, timerStatus]);

  const goQuestion = () => { pauseForQuestion(); router.push(routeBuilders.student.worksheetQuestion(worksheetId)); };
  const goNext = () => currentIndex === quizQuestionFixtures.length - 1 ? router.push(routeBuilders.student.submitWorksheet(worksheetId)) : moveTo(currentIndex + 1);

  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col">
      <div className="border-b border-divider bg-surface">
        <div className="flex h-[52px] items-center justify-between px-5 text-sm font-bold"><span className="text-action">{currentIndex + 1} / {quizQuestionFixtures.length}</span><time className="text-lg text-[#D96534]">{formatElapsed(elapsedSecondsByQuestion[question.id] ?? 0)}</time></div>
        <div className="h-1 bg-[#E8EBEF]"><span className="block h-full bg-brand" style={{ width: `${((currentIndex + 1) / quizQuestionFixtures.length) * 100}%` }} /></div>
      </div>
      <main className="flex-1 space-y-3 px-5 py-5">
        {question.passage ? <section className="whitespace-pre-line rounded-card border border-border bg-surface p-4 text-sm leading-7 text-muted">{question.passage}</section> : null}
        <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><p className="text-xs font-bold text-[#D96534]">{question.area} · {question.skill}</p><h2 className="mt-3 text-[17px] font-extrabold leading-7">{question.stem}</h2></section>
        <fieldset className="space-y-2.5"><legend className="sr-only">답안 선택</legend>{question.options.map((option, index) => { const answer = index + 1; const selected = answer === selectedAnswer; return <label key={option} className={`flex min-h-[60px] cursor-pointer items-center rounded-[14px] border px-4 text-[15px] leading-6 ${selected ? "border-brand bg-[#FFF6F0] font-semibold" : "border-border bg-surface"}`}><input type="radio" name={question.id} value={answer} checked={selected} onChange={() => selectAnswer(question.id, answer)} className="sr-only" /><span className="mr-2 font-bold">{answer}.</span>{option}</label>; })}</fieldset>
      </main>
      <div className="sticky bottom-0 space-y-2 border-t border-divider bg-surface px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
        <ActionButton variant="ghost" onClick={goQuestion}>이 문제 질문</ActionButton>
        <div className="grid grid-cols-2 gap-2"><ActionButton variant="ghost" disabled={currentIndex === 0} onClick={() => moveTo(currentIndex - 1)}>이전 문제</ActionButton><ActionButton onClick={goNext}>{currentIndex === quizQuestionFixtures.length - 1 ? "답안 제출" : "다음 문제"}</ActionButton></div>
      </div>
    </div>
  );
}
