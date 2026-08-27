"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { env } from "@/config/env";

/**
 * 🔴 계약 어휘를 그대로 쓴다.
 * · `studentId`       — **UUID**. API 경로 `/children/{studentId}/...` 가 요구하는 값이다.
 * · `studentPublicId` — `STU-B52D9K`. 사용자에게 보여주고 자녀 등록에 입력하는 값이다.
 *
 * 예전에는 domain `studentId` 가 공개 ID 를 담고 있어서, 화면이 그걸 API 경로에 넣어
 * 400 `type mismatch` 가 났다. mock gateway 는 id 를 무시해서 드러나지 않았다.
 * 같은 단어가 두 뜻을 갖지 않게 이름을 계약에 맞췄다.
 */
export type ParentChild = { studentId: string; studentPublicId: string; name: string; grade: string; active: boolean };
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

const DEFAULT_CHILD: ParentChild = { studentId: "student-1", studentPublicId: "STU-A41C", name: "김민준", grade: "고2", active: true };
const DEFAULT_TEACHER: ParentTeacher = { id: "teacher-1", name: "박지은 선생님", subject: null };

/**
 * 🔴 API 모드에서는 mock 자녀로 시작하지 않는다.
 * 시작값이 있으면 프로필이 도착하기 전에 그 가짜 id 로 자녀별 조회가 나가서
 * 400 `type mismatch` 가 한 번 번쩍인다. 비워 두면 `useSelectedChild()` 가
 * undefined 라 쿼리가 `enabled:false` 로 막히고, 프로필 도착 후 서버 값으로 채워진다.
 */
const INITIAL_CHILDREN: ParentChild[] = env.dataSource === "api" ? [] : [DEFAULT_CHILD];
const INITIAL_TEACHERS: ParentTeacher[] = env.dataSource === "api" ? [] : [DEFAULT_TEACHER];

export const useParentStore = create<ParentState>()(persist((set) => ({
  children: INITIAL_CHILDREN,
  selectedChildId: INITIAL_CHILDREN[0]?.studentId ?? null,
  teachers: INITIAL_TEACHERS,
  notificationsEnabled: true,
  selectChild: (id) => set({ selectedChildId: id }),
  addChild: (child) => set((state) => state.children.some((item) => item.studentId === child.studentId)
    ? state
    : { children: [...state.children, child], selectedChildId: child.studentId }),
  addTeacher: (teacher) => set((state) => state.teachers.some((item) => item.id === teacher.id)
    ? state
    : { teachers: [...state.teachers, teacher] }),
  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
  hydrateProfile: (profile) => set((state) => ({ ...profile, selectedChildId: profile.children.some((child) => child.studentId === state.selectedChildId) ? state.selectedChildId : profile.children[0]?.studentId ?? null })),
  reset: () => set({ children: INITIAL_CHILDREN, selectedChildId: INITIAL_CHILDREN[0]?.studentId ?? null, teachers: INITIAL_TEACHERS, notificationsEnabled: true }),
}), {
  // 🔴 -v2: 예전 저장분은 studentId 에 공개 ID 가 들어 있어 그대로 쓰면 400 이 난다. 버린다.
  name: "checkon-parent-profile-v2",
}));

export function useSelectedChild() {
  return useParentStore((state) => state.children.find((child) => child.studentId === state.selectedChildId) ?? state.children[0]);
}
