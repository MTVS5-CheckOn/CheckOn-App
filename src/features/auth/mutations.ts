"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authGateway, type LoginInput, type SignupInput } from "@/features/auth/api";
export const useLoginMutation = () => useMutation({ mutationFn: (input: LoginInput) => authGateway.login(input) });
export const useSignupMutation = () => useMutation({ mutationFn: (input: SignupInput) => authGateway.signup(input) });
export function useLogoutMutation() { const client = useQueryClient(); return useMutation({ mutationFn: () => authGateway.logout(), onSuccess: () => client.clear() }); }
