"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { useQuizAttempt } from "@/features/student/quiz/use-quiz-attempt";
import { useWorksheetQuery } from "@/features/student/worksheets/queries";
import { useQuizSessionStore } from "@/stores/quiz-session.store";
import { useCreateQuestionMutation } from "@/features/student/questions/queries";

export function QuizQuestionForm({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { inProgress, isLoading, isError, refetch } = useQuizAttempt(worksheetId);
  const { data: worksheet } = useWorksheetQuery(worksheetId);
  const { currentIndex, pauseForQuestion, resume } = useQuizSessionStore();
  const [content, setContent] = useState("");
  const createQuestion = useCreateQuestionMutation();
  const question = inProgress?.items[currentIndex] ?? inProgress?.items[0];

  useEffect(() => { pauseForQuestion(); return () => resume(); }, [pauseForQuestion, resume]);
  if (isLoading) return <div className="p-5"><div className="h-72 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !question) return <div className="p-8 text-center"><p className="text-sm font-bold">문제 정보를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const submit = async () => { const value = content.trim(); if (value.length < 5) return; try { const created = await createQuestion.mutateAsync({ worksheetId, worksheetTitle: worksheet?.title ?? "", questionNumber: currentIndex + 1, title: `${currentIndex + 1}번 문항 질문`, content: value }); router.push(routeBuilders.student.questionComplete(created.id, routeBuilders.student.solveWorksheet(worksheetId))); } catch { return; } };

  return (
    <div className="px-5 py-5">
      <p className="rounded-xl border border-brand bg-[#FFF6F0] px-4 py-3 text-sm text-[#9A4F2D]">질문을 작성하는 동안 풀이 타이머가 일시정지됩니다.</p>
      <section className="mt-4 rounded-card border border-border bg-surface p-4"><p className="text-xs font-bold text-[#D96534]">질문할 문제 · {currentIndex + 1}번</p><h2 className="mt-2 text-[17px] font-extrabold leading-7">{question.stem}</h2></section>
      <section className="mt-4 rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><label htmlFor="question-content" className="font-bold">궁금한 점</label><textarea id="question-content" value={content} onChange={(event) => setContent(event.target.value.slice(0, 500))} placeholder="궁금한 점을 자세히 적어주세요. 선생님께 전달됩니다." className="mt-3 h-36 w-full resize-none rounded-xl border border-border p-3 text-sm leading-6 outline-none focus:border-action" /><p className="mt-1 text-right text-xs text-subtle">{content.length}/500</p></section>
      {createQuestion.isError ? <p className="mt-3 text-xs font-semibold text-[#D64545]">질문을 전송하지 못했습니다. 다시 시도해 주세요.</p> : null}<ActionButton className="mt-3" disabled={content.trim().length < 5 || createQuestion.isPending} onClick={submit}>{createQuestion.isPending ? "질문 전송 중..." : "선생님께 질문 보내기"}</ActionButton>
    </div>
  );
}
