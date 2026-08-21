"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SignupTermKey = "service" | "privacy" | "notification";
type SignupDraftState = {
  terms: Record<SignupTermKey, boolean>;
  setTerm: (term: SignupTermKey, checked: boolean) => void;
  setAllTerms: (checked: boolean) => void;
  clear: () => void;
};
const EMPTY_TERMS = { service: false, privacy: false, notification: false };

export const useSignupDraftStore = create<SignupDraftState>()(persist((set) => ({
  terms: EMPTY_TERMS,
  setTerm: (term, checked) => set((state) => ({ terms: { ...state.terms, [term]: checked } })),
  setAllTerms: (checked) => set({ terms: { service: checked, privacy: checked, notification: checked } }),
  clear: () => set({ terms: EMPTY_TERMS }),
}), { name: "checkon-student-signup-draft" }));
