"use client";

import { useQuery } from "@tanstack/react-query";
import { mockWorksheetGateway } from "@/features/student/worksheets/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useWorksheetsQuery() {
  return useQuery({ queryKey: queryKeys.student.worksheets(), queryFn: () => mockWorksheetGateway.list() });
}

export function useWorksheetQuery(worksheetId: string) {
  return useQuery({ queryKey: queryKeys.student.worksheet(worksheetId), queryFn: () => mockWorksheetGateway.get(worksheetId) });
}
