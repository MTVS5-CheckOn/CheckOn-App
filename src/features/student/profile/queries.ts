"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentProfileGateway } from "@/features/student/profile/api";
import { queryKeys } from "@/lib/api/query-keys";

export const useStudentProfileQuery = () => useQuery({ queryKey: queryKeys.student.profile(), queryFn: () => studentProfileGateway.getProfile() });
export function useUpdateStudentNotificationsMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (enabled: boolean) => studentProfileGateway.updateNotifications(enabled), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.student.profile() }) }); }
export const useVerifyStudentInviteMutation = () => useMutation({ mutationFn: (code: string) => studentProfileGateway.verifyInvite(code) });
export function useRegisterStudentInviteMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (code: string) => studentProfileGateway.registerInvite(code), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.student.profile() }) }); }
