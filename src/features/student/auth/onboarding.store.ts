"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = { currentStep: number; setCurrentStep: (step: number) => void };

export const useOnboardingStore = create<OnboardingState>()(persist((set) => ({
  currentStep: 0,
  setCurrentStep: (currentStep) => set({ currentStep }),
}), { name: "checkon-student-onboarding" }));
