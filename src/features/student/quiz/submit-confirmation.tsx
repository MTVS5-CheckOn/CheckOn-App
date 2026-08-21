"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { useQuizQuery, useSubmitQuizMutation } from "@/features/student/quiz/queries";
import { useQuizSessionStore } from "@/stores/quiz-session.store";
import { useLearningRecordStore } from "@/features/student/records/learning-record.store";
import type { RecordArea } from "@/features/student/records/types";

export function SubmitConfirmation({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuizQuery(worksheetId);
  const submitMutation = useSubmitQuizMutation();
  const { answers, elapsedSecondsByQuestion, pauseForQuestion, submit, moveTo } = useQuizSessionStore();
  const saveRecord = useLearningRecordStore((state) => state.saveRecord);
  useEffect(() => { pauseForQuestion(); }, [pauseForQuestion]);
  const worksheet = data?.worksheet;
  const questions = data?.questions ?? [];
  const answered = questions.filter((question) => answers[question.id]).length;
  const unanswered = questions.length - answered;
  const totalSeconds = Object.values(elapsedSecondsByQuestion).reduce((sum, value) => sum + value, 0);
  if (isLoading) return <div className="p-5"><div className="h-96 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !worksheet) return <div className="p-8 text-center"><p className="text-sm font-bold">제출 정보를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const finish = async () => {
    const correctCount = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
    const record = {
      id: `submitted-${worksheetId}`, worksheetId, title: worksheet.title, date: "2026.08.21", month: "2026-08", area: worksheet.area as RecordArea,
      questionCount: questions.length, correctCount, elapsedSeconds: totalSeconds, weakness: correctCount === questions.length ? "복습 유지" : `${worksheet.area}·취약 유형`,
      weaknessDescription: correctCount === questions.length ? "모든 문항을 맞혔습니다. 정답 해설을 확인하며 풀이 근거를 유지해 보세요." : "오답 문항의 해설을 확인하고 같은 유형의 보완 문제를 추가로 풀어보세요.",
      trend: [{ label: "7/31", accuracy: 52 }, { label: "8/7", accuracy: 61 }, { label: "8/14", accuracy: 68 }, { label: "8/21", accuracy: Math.round(correctCount / questions.length * 100) }],
      questions: questions.map((question, index) => ({ id: `submitted-${worksheetId}-${question.id}`, number: index + 1, stem: question.stem, answer: answers[question.id] ?? 0, correctAnswer: question.correctAnswer, elapsedSeconds: elapsedSecondsByQuestion[question.id] ?? 0, explanation: question.explanation })),
    };
    try { await submitMutation.mutateAsync({ worksheetId, answers, elapsedSecondsByQuestion }); saveRecord(record); submit(); router.replace(routeBuilders.student.worksheetResults(worksheetId)); } catch { return; }
  };
  const reviewQuestion = (index: number) => { moveTo(index); router.push(routeBuilders.student.solveWorksheet(worksheetId)); };
  return (
    <div className="flex min-h-[calc(100dvh-76px)] items-center px-5 py-8">
      <section className="w-full rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]">
        <Check className="mx-auto" size={46} strokeWidth={2} /><h2 className="mt-3 text-xl font-extrabold">답안을 제출할까요?</h2><p className="mt-2 text-sm leading-6 text-subtle">{unanswered ? `${questions.length}문항 중 ${unanswered}문항이 미응답 상태입니다.` : `${questions.length}문항에 모두 답했습니다.`}<br />제출 후에는 답을 수정할 수 없습니다.</p>
        <dl className="my-5 border-y border-divider text-sm"><Row label="응답" value={`${answered} / ${questions.length}문항`} /><Row label="미응답" value={`${unanswered}문항`} danger={unanswered > 0} /><Row label="풀이 시간" value={formatElapsed(totalSeconds)} /></dl>
        {unanswered > 0 ? <div className="mb-4 rounded-xl bg-[#FFF5F4] p-3 text-left"><p className="text-xs font-bold text-[#D64545]">미응답 문항으로 이동</p><div className="mt-2 flex flex-wrap gap-2">{questions.map((question, index) => answers[question.id] ? null : <button key={question.id} onClick={() => reviewQuestion(index)} className="grid size-9 place-items-center rounded-lg border border-[#FFCBC6] bg-white text-xs font-bold text-[#D64545]">{index + 1}</button>)}</div></div> : null}
        {submitMutation.isError ? <p className="mb-3 text-xs font-semibold text-[#D64545]">답안을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}<ActionButton disabled={submitMutation.isPending} onClick={finish}>{submitMutation.isPending ? "제출 중..." : "제출하고 채점 보기"}</ActionButton><ActionButton className="mt-2" variant="ghost" onClick={() => router.push(routeBuilders.student.solveWorksheet(worksheetId))}>다시 확인하기</ActionButton>
      </section>
    </div>
  );
}

function Row({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="flex justify-between border-b border-divider py-3.5 last:border-b-0"><dt className="text-muted">{label}</dt><dd className={`font-bold ${danger ? "text-[#E85A4F]" : ""}`}>{value}</dd></div>; }
