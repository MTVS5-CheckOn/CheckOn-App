"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { formatElapsed } from "@/features/student/quiz/format-time";
import { useSubmitAttemptMutation } from "@/features/student/quiz/queries";
import { useQuizAttempt } from "@/features/student/quiz/use-quiz-attempt";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

export function SubmitConfirmation({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { attemptId, inProgress, isLoading, isError, refetch } = useQuizAttempt(worksheetId);
  const submitMutation = useSubmitAttemptMutation(attemptId);
  const { answers, elapsedSecondsByItem, version, pauseForQuestion, submit, moveTo, takePendingDelta } = useQuizSessionStore();

  useEffect(() => { pauseForQuestion(); }, [pauseForQuestion]);

  const questions = inProgress?.items ?? [];
  const answered = questions.filter((question) => answers[question.itemId]).length;
  const unanswered = questions.length - answered;
  const totalSeconds = Object.values(elapsedSecondsByItem).reduce((sum, value) => sum + value, 0);

  if (isLoading) return <div className="p-5"><div className="h-96 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !attemptId) return <div className="p-8 text-center"><p className="text-sm font-bold">제출 정보를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;

  /**
   * 🔴 여기서 채점하지 않는다.
   *
   * 정답 판정을 프론트가 하면 미제출 상태에서 정답이 노출된다 — 백엔드 절대 규칙 4
   * (미제출 attempt 응답에서 정답·해설·정오 필드를 뺀다)가 무의미해진다.
   * 제출 요청만 보내고, 결과는 결과 화면이 서버 `getResult(attemptId)` 에서 읽는다.
   * 로컬 학습기록 저장도 하지 않는다 — 서버가 학습기록의 단일 출처다.
   */
  const finish = async () => {
    try {
      await submitMutation.mutateAsync({ baseVersion: version, answers, activeElapsedSecondsDelta: takePendingDelta() });
      submit();
      router.replace(routeBuilders.student.worksheetResults(worksheetId));
    } catch { return; }
  };

  const reviewQuestion = (index: number) => { moveTo(index); router.push(routeBuilders.student.solveWorksheet(worksheetId)); };

  return (
    <div className="flex min-h-[calc(100dvh-76px)] items-center px-5 py-8">
      <section className="w-full rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]">
        <Check className="mx-auto" size={46} strokeWidth={2} /><h2 className="mt-3 text-xl font-extrabold">답안을 제출할까요?</h2><p className="mt-2 text-sm leading-6 text-subtle">{unanswered ? `${questions.length}문항 중 ${unanswered}문항이 미응답 상태입니다.` : `${questions.length}문항에 모두 답했습니다.`}<br />제출 후에는 답을 수정할 수 없습니다.</p>
        <dl className="my-5 border-y border-divider text-sm"><Row label="응답" value={`${answered} / ${questions.length}문항`} /><Row label="미응답" value={`${unanswered}문항`} danger={unanswered > 0} /><Row label="풀이 시간" value={formatElapsed(totalSeconds)} /></dl>
        {unanswered > 0 ? <div className="mb-4 rounded-xl bg-[#FFF5F4] p-3 text-left"><p className="text-xs font-bold text-[#D64545]">미응답 문항으로 이동</p><div className="mt-2 flex flex-wrap gap-2">{questions.map((question, index) => answers[question.itemId] ? null : <button key={question.itemId} onClick={() => reviewQuestion(index)} className="grid size-9 place-items-center rounded-lg border border-[#FFCBC6] bg-white text-xs font-bold text-[#D64545]">{index + 1}</button>)}</div></div> : null}
        {submitMutation.isError ? <p className="mb-3 text-xs font-semibold text-[#D64545]">답안을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}<ActionButton disabled={submitMutation.isPending} onClick={finish}>{submitMutation.isPending ? "제출 중..." : "제출하고 채점 보기"}</ActionButton><ActionButton className="mt-2" variant="ghost" onClick={() => router.push(routeBuilders.student.solveWorksheet(worksheetId))}>다시 확인하기</ActionButton>
      </section>
    </div>
  );
}

function Row({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="flex justify-between border-b border-divider py-3.5 last:border-b-0"><dt className="text-muted">{label}</dt><dd className={`font-bold ${danger ? "text-[#E85A4F]" : ""}`}>{value}</dd></div>; }
