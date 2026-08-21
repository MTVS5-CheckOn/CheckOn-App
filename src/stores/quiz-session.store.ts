"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimerStatus = "idle" | "running" | "paused" | "submitted";
type QuizSessionState = {
  worksheetId: string | null; currentIndex: number; answers: Record<string, number>;
  elapsedSecondsByQuestion: Record<string, number>; timerStatus: TimerStatus;
  start: (worksheetId: string) => void; moveTo: (index: number) => void;
  selectAnswer: (questionId: string, answer: number) => void;
  addElapsedSeconds: (questionId: string, seconds: number) => void;
  pauseForQuestion: () => void; resume: () => void; submit: () => void; reset: () => void;
};
const initialState = { worksheetId: null, currentIndex: 0, answers: {}, elapsedSecondsByQuestion: {}, timerStatus: "idle" as TimerStatus };

export const useQuizSessionStore = create<QuizSessionState>()(persist((set) => ({
  ...initialState,
  start: (worksheetId) => set({ worksheetId, currentIndex: 0, timerStatus: "running" }),
  moveTo: (currentIndex) => set({ currentIndex }),
  selectAnswer: (questionId, answer) => set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  addElapsedSeconds: (questionId, seconds) => set((state) => ({ elapsedSecondsByQuestion: { ...state.elapsedSecondsByQuestion, [questionId]: (state.elapsedSecondsByQuestion[questionId] ?? 0) + seconds } })),
  pauseForQuestion: () => set({ timerStatus: "paused" }), resume: () => set({ timerStatus: "running" }),
  submit: () => set({ timerStatus: "submitted" }), reset: () => set(initialState),
}), { name: "checkon-quiz-session", partialize: ({ worksheetId, currentIndex, answers, elapsedSecondsByQuestion, timerStatus }) => ({ worksheetId, currentIndex, answers, elapsedSecondsByQuestion, timerStatus }) }));
