"use client";
import { useQuery } from "@tanstack/react-query";
import { studentHomeGateway } from "@/features/student/home/api";
import { queryKeys } from "@/lib/api/query-keys";
export const useStudentHomeQuery = () => useQuery({ queryKey: queryKeys.student.home(), queryFn: () => studentHomeGateway.get() });
