import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudentAccountStatus = "inactive" | "active";

type StudentAuthState = {
  studentId: string;
  name: string;
  grade: string;
  status: StudentAccountStatus;
  completeSignup: (profile: { name: string; grade: string }) => void;
  activateForPreview: () => void;
  reset: () => void;
};

const INITIAL_STATE = {
  studentId: "STU-A41C",
  name: "김민준",
  grade: "고2",
  status: "active" as StudentAccountStatus,
};

export const useStudentAuthStore = create<StudentAuthState>()(persist((set) => ({
  ...INITIAL_STATE,
  completeSignup: (profile) => set({ ...profile, status: "inactive" }),
  activateForPreview: () => set({ status: "active" }),
  reset: () => set(INITIAL_STATE),
}), { name: "checkon-student-auth" }));
