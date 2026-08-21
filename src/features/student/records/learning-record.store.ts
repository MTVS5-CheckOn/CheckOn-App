"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LearningRecord } from "@/features/student/records/types";

type LearningRecordState = {
  submittedRecords: LearningRecord[];
  saveRecord: (record: LearningRecord) => void;
};

export const useLearningRecordStore = create<LearningRecordState>()(persist((set) => ({
  submittedRecords: [],
  saveRecord: (record) => set((state) => ({ submittedRecords: [record, ...state.submittedRecords.filter((item) => item.worksheetId !== record.worksheetId)] })),
}), { name: "checkon-submitted-learning-records" }));
