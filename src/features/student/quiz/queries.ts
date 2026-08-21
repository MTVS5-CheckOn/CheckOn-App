"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizGateway, type QuizSubmission } from "@/features/student/quiz/api";
import { queryKeys } from "@/lib/api/query-keys";

export const useQuizQuery = (worksheetId: string) => useQuery({ queryKey: [...queryKeys.student.worksheet(worksheetId), "quiz"], queryFn: () => quizGateway.get(worksheetId), enabled: Boolean(worksheetId) });
export function useSubmitQuizMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (input: QuizSubmission) => quizGateway.submit(input), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.student.records() }) }); }
