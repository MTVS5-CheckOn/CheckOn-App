"use client";

import { useQuery } from "@tanstack/react-query";
import { learningRecordGateway } from "@/features/student/records/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useLearningRecordsQuery() {
  return useQuery({ queryKey: queryKeys.student.records(), queryFn: () => learningRecordGateway.list() });
}

export function useLearningRecordQuery(recordId: string) {
  return useQuery({ queryKey: [...queryKeys.student.records(), recordId], queryFn: () => learningRecordGateway.get(recordId) });
}
