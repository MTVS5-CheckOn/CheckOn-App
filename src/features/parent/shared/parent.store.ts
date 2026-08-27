"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ParentChild = { id: string; studentId: string; name: string; grade: string; active: boolean };
/** 🔴 `academy` 는 계약(TeacherSummary)에 없다. 백엔드에 원본이 없어 지어내지 않는다. */
export type ParentTeacher = { id: string; name: string; subject: string | null };

type ParentState = {
  children: ParentChild[];
  selectedChildId: string | null;
  teachers: ParentTeacher[];
  notificationsEnabled: boolean;
  selectChild: (id: string) => void;
  addChild: (child: ParentChild) => void;
  addTeacher: (teacher: ParentTeacher) => void;
  setNotifications: (enabled: boolean) => void;
  hydrateProfile: (profile: { children: ParentChild[]; teachers: ParentTeacher[]; notificationsEnabled: boolean }) => void;
  reset: () => void;
};

const DEFAULT_CHILD: ParentChild = { id: "student-1", studentId: "STU-A41C", name: "김민준", grade: "고2", active: true };
const DEFAULT_TEACHER: ParentTeacher = { id: "teacher-1", name: "박지은 선생님", subject: null };

export const useParentStore = create<ParentState>()(persist((set) => ({
  children: [DEFAULT_CHILD],
  selectedChildId: DEFAULT_CHILD.id,
  teachers: [DEFAULT_TEACHER],
  notificationsEnabled: true,
  selectChild: (id) => set({ selectedChildId: id }),
  addChild: (child) => set((state) => state.children.some((item) => item.studentId === child.studentId)
    ? state
    : { children: [...state.children, child], selectedChildId: child.id }),
  addTeacher: (teacher) => set((state) => state.teachers.some((item) => item.id === teacher.id)
    ? state
    : { teachers: [...state.teachers, teacher] }),
  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
  hydrateProfile: (profile) => set((state) => ({ ...profile, selectedChildId: profile.children.some((child) => child.id === state.selectedChildId) ? state.selectedChildId : profile.children[0]?.id ?? null })),
  reset: () => set({ children: [DEFAULT_CHILD], selectedChildId: DEFAULT_CHILD.id, teachers: [DEFAULT_TEACHER], notificationsEnabled: true }),
}), { name: "checkon-parent-profile" }));

export function useSelectedChild() {
  return useParentStore((state) => state.children.find((child) => child.id === state.selectedChildId) ?? state.children[0]);
}
