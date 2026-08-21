"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConnectedTeacher = { id: string; name: string; academy: string; subject: string };
type ProfileState = {
  teachers: ConnectedTeacher[];
  notificationsEnabled: boolean;
  addTeacher: (teacher: ConnectedTeacher) => void;
  toggleNotifications: () => void;
  setNotifications: (enabled: boolean) => void;
};

const DEFAULT_TEACHER: ConnectedTeacher = { id: "teacher-1", name: "박지은 선생님", academy: "한울국어학원", subject: "문학·독서 담당" };

export const useStudentProfileStore = create<ProfileState>()(persist((set) => ({
  teachers: [DEFAULT_TEACHER],
  notificationsEnabled: true,
  addTeacher: (teacher) => set((state) => state.teachers.some((item) => item.id === teacher.id) ? state : { teachers: [...state.teachers, teacher] }),
  toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
}), { name: "checkon-student-profile" }));
