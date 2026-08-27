"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentGateway } from "@/features/parent/api/gateway";
import type { ChildRegistrationRequest, CreateConsultationRequest, InviteRegistrationRequest } from "@/features/parent/api/types";
import { queryKeys } from "@/lib/api/query-keys";

export const useParentHomeQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.home(studentId), queryFn: () => parentGateway.getHome(studentId), enabled: Boolean(studentId) });
export const useParentRecordsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.records(studentId), queryFn: () => parentGateway.listRecords(studentId), select: (page) => page.items, enabled: Boolean(studentId) });
export const useParentRecordQuery = (studentId: string, recordId: string) => useQuery({ queryKey: queryKeys.parent.record(studentId, recordId), queryFn: () => parentGateway.getRecord(studentId, recordId), enabled: Boolean(studentId && recordId) });
export const useParentAnalysisQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.analysis(studentId), queryFn: () => parentGateway.getAnalysis(studentId), enabled: Boolean(studentId) });
export const useParentReportsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.reports(studentId), queryFn: () => parentGateway.listReports(studentId), select: (page) => page.items, enabled: Boolean(studentId) });
export const useParentReportQuery = (studentId: string, reportId: string) => useQuery({ queryKey: queryKeys.parent.report(studentId, reportId), queryFn: () => parentGateway.getReport(studentId, reportId), enabled: Boolean(studentId && reportId) });
export const useParentProfileQuery = () => useQuery({ queryKey: queryKeys.parent.profile(), queryFn: () => parentGateway.getProfile() });
export const useParentNotificationsQuery = () => useQuery({ queryKey: queryKeys.parent.notifications(), queryFn: () => parentGateway.listNotifications(), select: (page) => page.items });
export const useParentConsultationsQuery = (studentId: string) => useQuery({ queryKey: queryKeys.parent.consultations(studentId), queryFn: () => parentGateway.listConsultations(studentId), select: (page) => page.items, enabled: Boolean(studentId) });
export const useParentConsultationQuery = (studentId: string, consultationId: string) => useQuery({ queryKey: queryKeys.parent.consultation(studentId, consultationId), queryFn: () => parentGateway.getConsultation(studentId, consultationId), enabled: Boolean(studentId && consultationId) });

export function useCreateConsultationMutation(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConsultationRequest) => parentGateway.createConsultation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.consultations(studentId) }),
  });
}

/**
 * 🔴 상담 취소는 **백엔드 미구현**이다 (MB-09 정책 미확정,
 * ParentConsultationController.java:78 `TODO(MB-09)`).
 * 계약(member-api.yaml:1259)에는 경로가 있지만 컨트롤러가 열려 있지 않다.
 * 화면은 만들되 호출하지 않는다 — `consultationCancellationSupported` 가 false 인 동안
 * 이 훅은 존재하지 않는다. 되살릴 때 endpoints.parent.consultationCancellation 을 쓴다.
 */

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
  return useMutation({ mutationFn: (studentPublicId: string) => parentGateway.verifyChild(studentPublicId) });
}

export function useRegisterInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: InviteRegistrationRequest) => parentGateway.registerInvite(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.parent.all }) });
}
