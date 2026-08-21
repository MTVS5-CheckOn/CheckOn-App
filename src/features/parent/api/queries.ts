"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentGateway } from "@/features/parent/api/gateway";
import type { ChildRegistrationRequest, InviteRegistrationRequest } from "@/features/parent/api/types";
import { queryKeys } from "@/lib/api/query-keys";

export const useParentHomeQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.home(studentId), queryFn: () => parentGateway.getHome(studentId), enabled: Boolean(studentId) });
export const useParentRecordsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.records(studentId), queryFn: () => parentGateway.listRecords(studentId), enabled: Boolean(studentId) });
export const useParentRecordQuery = (studentId: string, recordId: string) => useQuery({ queryKey: queryKeys.parent.record(studentId, recordId), queryFn: () => parentGateway.getRecord(studentId, recordId), enabled: Boolean(studentId && recordId) });
export const useParentAnalysisQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.analysis(studentId), queryFn: () => parentGateway.getAnalysis(studentId), enabled: Boolean(studentId) });
export const useParentReportsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.reports(studentId), queryFn: () => parentGateway.listReports(studentId), enabled: Boolean(studentId) });
export const useParentReportQuery = (studentId: string, reportId: string) => useQuery({ queryKey: queryKeys.parent.report(studentId, reportId), queryFn: () => parentGateway.getReport(studentId, reportId), enabled: Boolean(studentId && reportId) });

export function useRegisterChildMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: ChildRegistrationRequest) => parentGateway.registerChild(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.all }) });
}

export function useVerifyChildMutation() {
  return useMutation({ mutationFn: (studentId: string) => parentGateway.verifyChild(studentId) });
}

export function useRegisterInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: InviteRegistrationRequest) => parentGateway.registerInvite(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.all }) });
}
