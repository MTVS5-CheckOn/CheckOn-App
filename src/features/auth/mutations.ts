"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authGateway, type LoginInput, type SignupInput } from "@/features/auth/api";
import { queryKeys } from "@/lib/api/query-keys";

export const useLoginMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authGateway.login(input),
    onSuccess: () => {
      // 이전 세션이나 로그인 전 401 결과가 새 계정 화면에 남지 않게 한다.
      client.removeQueries({ queryKey: queryKeys.session() });
      client.removeQueries({ queryKey: queryKeys.student.all });
      client.removeQueries({ queryKey: queryKeys.parent.all });
    },
  });
};
export const useSignupMutation = () => useMutation({ mutationFn: (input: SignupInput) => authGateway.signup(input) });
export function useLogoutMutation() { const client = useQueryClient(); return useMutation({ mutationFn: () => authGateway.logout(), onSuccess: () => client.clear() }); }
