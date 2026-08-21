"use client";

import { useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { authGateway } from "@/features/auth/api";
import { queryKeys } from "@/lib/api/query-keys";

export const useStudentActivationQuery = () => useQuery({
  queryKey: queryKeys.student.activation(),
  queryFn: () => authGateway.getStudentActivationStatus(),
  refetchInterval: env.dataSource === "api" ? 5_000 : false,
});
