"use client";

import { useEffect } from "react";
import { useAttemptQuery, useStartAttemptMutation } from "@/features/student/quiz/queries";
import type { AttemptInProgress } from "@/features/student/quiz/types";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

/**
 * 학습지에 대한 attempt 를 시작하거나 재개한다.
 * 🔴 재개는 200, 신규는 201 — 둘 다 성공이다. 서버가 갖고 있는 답안이 그대로 복원된다.
 */
export function useQuizAttempt(assignmentId: string) {
  const { assignmentId: sessionAssignmentId, attemptId, startAttempt } = useQuizSessionStore();
  const startMutation = useStartAttemptMutation();
  const matches = sessionAssignmentId === assignmentId && Boolean(attemptId);

  useEffect(() => {
    if (!assignmentId || matches || startMutation.isPending) return;
    startMutation.mutate(assignmentId, {
      onSuccess: (attempt) =>
        startAttempt(attempt.assignmentId, attempt.attemptId, attempt.version, attempt.answers, attempt.activeElapsedSecondsByItem),
    });
    // startMutation 은 렌더마다 새 객체라 의존성에 넣지 않는다 — 넣으면 무한 재시작이 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, matches]);

  const attemptQuery = useAttemptQuery(matches ? attemptId : null);
  const attempt = attemptQuery.data;
  const inProgress = attempt && attempt.status === "IN_PROGRESS" ? (attempt as AttemptInProgress) : null;

  return {
    attemptId: matches ? attemptId : null,
    attempt,
    inProgress,
    // 채점이 끝난 attempt 면 결과 화면으로 보내야 한다.
    isScored: attempt?.status === "SCORED",
    isLoading: startMutation.isPending || attemptQuery.isLoading,
    isError: startMutation.isError || attemptQuery.isError,
    refetch: attemptQuery.refetch,
  };
}
