"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentGateway } from "@/features/parent/api/gateway";
import type { ChildRegistrationRequest, CreateConsultationRequest, InviteRegistrationRequest } from "@/features/parent/api/types";
import { queryKeys } from "@/lib/api/query-keys";

export const useParentHomeQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.home(studentId), queryFn: () => parentGateway.getHome(studentId), enabled: Boolean(studentId) });
export const useParentRecordsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.records(studentId), queryFn: () => parentGateway.listRecords(studentId), enabled: Boolean(studentId) });
export const useParentRecordQuery = (studentId: string, recordId: string) => useQuery({ queryKey: queryKeys.parent.record(studentId, recordId), queryFn: () => parentGateway.getRecord(studentId, recordId), enabled: Boolean(studentId && recordId) });
export const useParentAnalysisQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.analysis(studentId), queryFn: () => parentGateway.getAnalysis(studentId), enabled: Boolean(studentId) });
export const useParentReportsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.reports(studentId), queryFn: () => parentGateway.listReports(studentId), enabled: Boolean(studentId) });
export const useParentReportQuery = (studentId: string, reportId: string) => useQuery({ queryKey: queryKeys.parent.report(studentId, reportId), queryFn: () => parentGateway.getReport(studentId, reportId), enabled: Boolean(studentId && reportId) });
export const useParentProfileQuery = () => useQuery({ queryKey: queryKeys.parent.profile(), queryFn: () => parentGateway.getProfile() });
export const useParentNotificationsQuery = () => useQuery({ queryKey: queryKeys.parent.notifications(), queryFn: () => parentGateway.listNotifications() });
export const useParentConsultationsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.consultations(studentId), queryFn: () => parentGateway.listConsultations(studentId), enabled: Boolean(studentId) });
export const useParentConsultationQuery = (studentId: string, consultationId: string) => useQuery({ queryKey: queryKeys.parent.consultation(studentId, consultationId), queryFn: () => parentGateway.getConsultation(studentId, consultationId), enabled: Boolean(studentId && consultationId) });

export function useCreateConsultationMutation(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConsultationRequest) => parentGateway.createConsultation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.consultations(studentId) }),
  });
}

export function useCancelConsultationMutation(studentId: string, consultationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => parentGateway.cancelConsultation(studentId, consultationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.parent.consultations(studentId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.parent.consultation(studentId, consultationId) }),
      ]);
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (notificationId: string) => parentGateway.markNotificationRead(notificationId), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.notifications() }) });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => parentGateway.markAllNotificationsRead(), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.notifications() }) });
}

export function useUpdateParentNotificationsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => parentGateway.updateNotificationPreference(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.profile() }),
  });
}

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
