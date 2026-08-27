"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimerStatus = "idle" | "running" | "paused" | "submitted";

type QuizSessionState = {
  assignmentId: string | null;
  /** 서버가 만든 attempt. 답안·채점의 단일 출처다. */
  attemptId: string | null;
  /** optimistic lock. progress 요청의 baseVersion 에 넣는다. */
  version: number;
  /** 클라이언트 단조 증가 시퀀스. 같은 값 재전송을 서버가 멱등 처리한다. */
  clientSequence: number;
  currentIndex: number;
  /** 🔴 키는 itemId(UUID) 다. `q1` 같은 문자열이 아니다. */
  answers: Record<string, number>;
  elapsedSecondsByItem: Record<string, number>;
  /** 아직 서버에 반영되지 않은 delta. 600 초 상한으로 잘린 나머지도 여기 남는다. */
  pendingElapsedDelta: Record<string, number>;
  timerStatus: TimerStatus;
  startAttempt: (assignmentId: string, attemptId: string, version: number, answers: Record<string, number>, elapsed: Record<string, number>) => void;
  moveTo: (index: number) => void;
  selectAnswer: (itemId: string, answer: number) => void;
  addElapsedSeconds: (itemId: string, seconds: number) => void;
  takePendingDelta: () => Record<string, number>;
  restorePendingDelta: (delta: Record<string, number>) => void;
  nextSequence: () => number;
  setVersion: (version: number) => void;
  pauseForQuestion: () => void;
  resume: () => void;
  submit: () => void;
  reset: () => void;
};

const initialState = {
  assignmentId: null,
  attemptId: null,
  version: 0,
  clientSequence: 0,
  currentIndex: 0,
  answers: {},
  elapsedSecondsByItem: {},
  pendingElapsedDelta: {},
  timerStatus: "idle" as TimerStatus,
};

export const useQuizSessionStore = create<QuizSessionState>()(persist((set, get) => ({
  ...initialState,

  // 서버가 준 attempt 로 세션을 맞춘다. 재개면 서버에 저장된 답안이 그대로 복원된다.
  startAttempt: (assignmentId, attemptId, version, answers, elapsed) => set({
    ...initialState,
    assignmentId,
    attemptId,
    version,
    answers,
    elapsedSecondsByItem: elapsed,
    timerStatus: "running",
  }),

  moveTo: (currentIndex) => set({ currentIndex }),
  selectAnswer: (itemId, answer) => set((state) => ({ answers: { ...state.answers, [itemId]: answer } })),

  addElapsedSeconds: (itemId, seconds) => set((state) => ({
    elapsedSecondsByItem: { ...state.elapsedSecondsByItem, [itemId]: (state.elapsedSecondsByItem[itemId] ?? 0) + seconds },
    pendingElapsedDelta: { ...state.pendingElapsedDelta, [itemId]: (state.pendingElapsedDelta[itemId] ?? 0) + seconds },
  })),

  takePendingDelta: () => {
    const delta = get().pendingElapsedDelta;
    set({ pendingElapsedDelta: {} });
    return delta;
  },

  // 🔴 상한(600초)으로 잘려 남은 delta 를 되돌려 넣는다. 조용히 버리지 않는다.
  restorePendingDelta: (delta) => set((state) => {
    const merged = { ...state.pendingElapsedDelta };
    for (const [itemId, seconds] of Object.entries(delta)) merged[itemId] = (merged[itemId] ?? 0) + seconds;
    return { pendingElapsedDelta: merged };
  }),

  nextSequence: () => {
    const next = get().clientSequence + 1;
    set({ clientSequence: next });
    return next;
  },

  setVersion: (version) => set({ version }),
  pauseForQuestion: () => set({ timerStatus: "paused" }),
  resume: () => set({ timerStatus: "running" }),
  submit: () => set({ timerStatus: "submitted" }),
  reset: () => set(initialState),
}), {
  // 🔴 -v2 로 올린다. 답안 키가 `q1` 에서 itemId(UUID) 로 바뀌어 옛 키가 섞이면 안 된다.
  name: "checkon-quiz-session-v2",
  partialize: ({ assignmentId, attemptId, version, clientSequence, currentIndex, answers, elapsedSecondsByItem, pendingElapsedDelta, timerStatus }) =>
    ({ assignmentId, attemptId, version, clientSequence, currentIndex, answers, elapsedSecondsByItem, pendingElapsedDelta, timerStatus }),
}));
