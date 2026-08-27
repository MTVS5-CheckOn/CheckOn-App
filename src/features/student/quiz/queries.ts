"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { quizGateway } from "@/features/student/quiz/api";
import type { AttemptProgressRequest, AttemptSubmitRequest } from "@/features/student/quiz/types";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { queryKeys } from "@/lib/api/query-keys";

export const useAttemptQuery = (attemptId: string | null) => useQuery({
  queryKey: queryKeys.student.attempt(attemptId ?? ""),
  queryFn: () => quizGateway.getAttempt(attemptId!),
  enabled: Boolean(attemptId),
});

/** 🔴 미제출 attempt 는 404 다. 로컬에서 채점해 채우지 않는다. */
export const useAttemptResultQuery = (attemptId: string | null, enabled = true) => useQuery({
  queryKey: queryKeys.student.attemptResult(attemptId ?? ""),
  queryFn: () => quizGateway.getResult(attemptId!),
  enabled: Boolean(attemptId) && enabled,
  retry: false,
});

/**
 * attempt 시작. 재개는 200, 신규는 201 — 둘 다 성공이다.
 * 🔴 키를 mutationFn 안에서 만들지 않는다. 재시도마다 새 키가 나가면 attempt 가 두 개 생긴다.
 */
export function useStartAttemptMutation() {
  const keyRef = useRef<string | null>(null);
  return useMutation({
    mutationFn: (assignmentId: string) => {
      keyRef.current ??= createIdempotencyKey();
      return quizGateway.startAttempt(assignmentId, keyRef.current);
    },
    onSuccess: () => { keyRef.current = null; },
  });
}

export function useSaveProgressMutation(attemptId: string | null) {
  return useMutation({
    mutationFn: (request: AttemptProgressRequest) => quizGateway.saveProgress(attemptId!, request),
  });
}

/**
 * 제출.
 * 🔴 Idempotency-Key 를 **mutation 시작 시점에 1회** 만들어 ref 에 잡아둔다.
 * mutationFn 안에서 만들면 사용자 재클릭·재시도마다 새 키가 나가 서버가 두 번 채점한다.
 * 버튼 disabled 만으로는 부족하다 — 키가 방어선이다. 성공하면 ref 를 비운다.
 */
export function useSubmitAttemptMutation(attemptId: string | null) {
  const client = useQueryClient();
  const keyRef = useRef<string | null>(null);
  return useMutation({
    mutationFn: (request: AttemptSubmitRequest) => {
      keyRef.current ??= createIdempotencyKey();
      return quizGateway.submit(attemptId!, request, keyRef.current);
    },
    onSuccess: async () => {
      keyRef.current = null;
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.student.records() }),
        client.invalidateQueries({ queryKey: queryKeys.student.attemptResult(attemptId ?? "") }),
      ]);
    },
  });
}

/** 테스트가 재시도 간 키 동일성을 단언할 수 있도록 노출한다. */
export const __testing = { createIdempotencyKey };
