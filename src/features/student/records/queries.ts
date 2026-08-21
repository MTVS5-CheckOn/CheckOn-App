"use client";

import { useQuery } from "@tanstack/react-query";
import { mockLearningRecordGateway } from "@/features/student/records/api";

export function useLearningRecordsQuery() {
  return useQuery({ queryKey: ["student", "learning-records"], queryFn: () => mockLearningRecordGateway.list() });
}

export function useLearningRecordQuery(recordId: string) {
  return useQuery({ queryKey: ["student", "learning-records", recordId], queryFn: () => mockLearningRecordGateway.get(recordId) });
}
