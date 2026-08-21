"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionGateway, type CreateQuestionInput } from "@/features/student/questions/api";
const allKey = ["student", "questions"] as const;
export const useQuestionsQuery = () => useQuery({ queryKey: allKey, queryFn: () => questionGateway.list() });
export const useQuestionQuery = (id: string) => useQuery({ queryKey: [...allKey, id], queryFn: () => questionGateway.get(id), enabled: Boolean(id) });
export function useCreateQuestionMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateQuestionInput) => questionGateway.create(input), onSuccess: () => client.invalidateQueries({ queryKey: allKey }) }); }
export function useFollowUpMutation(id: string) { const client = useQueryClient(); return useMutation({ mutationFn: (content: string) => questionGateway.addFollowUp(id, content), onSuccess: () => client.invalidateQueries({ queryKey: allKey }) }); }
