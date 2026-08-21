"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateConsultationRequest } from "@/features/parent/api/types";
import type { ConsultationDraft, ParentConsultation } from "@/features/parent/consultations/types";

const INITIAL_CONSULTATIONS: ParentConsultation[] = [
  {
    id: "consultation-1",
    studentId: "STU-A41C",
    childName: "김민준",
    teacherName: "박지은 선생님",
    content: "8월 보고서를 기준으로 독서 영역을 어떤 순서로 보완하면 좋을지 궁금합니다.",
    responseMethod: "app",
    context: { type: "report", id: "r1", label: "2026년 8월 월별 보고서", detail: "독서 · 개념/지식 정답률 43%" },
    status: "answered",
    createdAt: "2026.08.20 10:14",
    updatedAt: "2026.08.20 16:30",
    teacherAnswer: "이번 달에는 독서 개념어를 먼저 정리한 뒤, 짧은 지문에서 근거 문장을 찾는 연습을 진행하려고 합니다. 다음 학습지부터 보완 문항을 함께 제공하겠습니다.",
    answeredAt: "2026.08.20 16:30",
  },
];

type ConsultationState = {
  consultations: ParentConsultation[];
  draft: ConsultationDraft | null;
  setDraft: (draft: ConsultationDraft) => void;
  clearDraft: () => void;
  addConsultation: (input: CreateConsultationRequest, childName: string, teacherName: string) => ParentConsultation;
  cancelConsultation: (id: string) => void;
};

const nowLabel = () => {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}.${value("month")}.${value("day")} ${value("hour")}:${value("minute")}`;
};

export const useParentConsultationStore = create<ConsultationState>()(persist((set) => ({
  consultations: INITIAL_CONSULTATIONS,
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
  addConsultation: (input, childName, teacherName) => {
    const createdAt = nowLabel();
    const consultation: ParentConsultation = {
      ...input,
      id: `consultation-${Date.now()}`,
      childName,
      teacherName,
      status: "submitted",
      createdAt,
      updatedAt: createdAt,
    };
    set((state) => ({ consultations: [consultation, ...state.consultations] }));
    return consultation;
  },
  cancelConsultation: (id) => set((state) => ({
    consultations: state.consultations.map((item) => item.id === id && item.status === "submitted"
      ? { ...item, status: "cancelled", updatedAt: nowLabel() }
      : item),
  })),
}), { name: "checkon-parent-consultations" }));
