"use client";

import { useQuery } from "@tanstack/react-query";
import { worksheetGateway } from "@/features/student/worksheets/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useWorksheetsQuery() {
  return useQuery({ queryKey: queryKeys.student.worksheets(), queryFn: () => worksheetGateway.list() });
}

export function useWorksheetQuery(worksheetId: string) {
  return useQuery({ queryKey: queryKeys.student.worksheet(worksheetId), queryFn: () => worksheetGateway.get(worksheetId) });
}
