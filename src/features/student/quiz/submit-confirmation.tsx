"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { quizQuestionFixtures } from "@/features/student/quiz/mock-data";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

export function SubmitConfirmation({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { answers, elapsedSecondsByQuestion, pauseForQuestion, submit } = useQuizSessionStore();
  useEffect(() => { pauseForQuestion(); }, [pauseForQuestion]);
  const answered = quizQuestionFixtures.filter((question) => answers[question.id]).length;
  const unanswered = quizQuestionFixtures.length - answered;
  const totalSeconds = Object.values(elapsedSecondsByQuestion).reduce((sum, value) => sum + value, 0);
  const finish = () => { submit(); router.replace(routeBuilders.student.worksheetResults(worksheetId)); };
  return (
    <div className="flex min-h-[calc(100dvh-76px)] items-center px-5 py-8">
      <section className="w-full rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]">
        <Check className="mx-auto" size={46} strokeWidth={2} /><h2 className="mt-3 text-xl font-extrabold">답안을 제출할까요?</h2><p className="mt-2 text-sm leading-6 text-subtle">{unanswered ? `${quizQuestionFixtures.length}문항 중 ${unanswered}문항이 미응답 상태입니다.` : `${quizQuestionFixtures.length}문항에 모두 답했습니다.`}<br />제출 후에는 답을 수정할 수 없습니다.</p>
        <dl className="my-5 border-y border-divider text-sm"><Row label="응답" value={`${answered} / ${quizQuestionFixtures.length}문항`} /><Row label="미응답" value={`${unanswered}문항`} danger={unanswered > 0} /><Row label="풀이 시간" value={formatElapsed(totalSeconds)} /></dl>
        <ActionButton onClick={finish}>제출하고 채점 보기</ActionButton><ActionButton className="mt-2" variant="ghost" onClick={() => router.push(routeBuilders.student.solveWorksheet(worksheetId))}>다시 확인하기</ActionButton>
      </section>
    </div>
  );
}

function Row({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="flex justify-between border-b border-divider py-3.5 last:border-b-0"><dt className="text-muted">{label}</dt><dd className={`font-bold ${danger ? "text-[#E85A4F]" : ""}`}>{value}</dd></div>; }
