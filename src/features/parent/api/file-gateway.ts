import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createIdempotencyKey, idempotencyHeaders } from "@/lib/api/idempotency";
import { reportFileAccessSchema } from "@/features/parent/api/schemas";
import type { ReportFileAccessDto } from "@/features/parent/api/dto";
import { parseApiResponse } from "@/lib/api/validate";

export interface ReportFileGateway {
  /**
   * 보고서 PDF 접근권을 발급받는다.
   * 🔴 `url` 은 수명이 짧은 signed URL 이다 — **캐시하지 않는다.**
   * `expiresAt` 이 지나면 이 함수를 다시 불러 재발급받는다.
   */
  requestAccess(studentId: string, reportId: string): Promise<ReportFileAccessDto>;
  /** signed URL 로 파일을 가져온다. 🔴 Authorization 헤더를 붙이지 않는다 — URL 자체가 권한이다. */
  fetchFile(access: ReportFileAccessDto): Promise<Blob>;
}

const httpReportFileGateway: ReportFileGateway = {
  requestAccess: async (studentId, reportId) =>
    parseApiResponse(
      reportFileAccessSchema,
      await apiRequest(endpoints.parent.reportFileAccess(studentId, reportId), {
        method: "POST",
        headers: idempotencyHeaders(createIdempotencyKey()),
      }),
      "parent.reportFileAccess",
    ),

  // 🔴 JSON apiRequest 를 쓰지 않는다. 응답이 PDF 바이너리이고 인증도 다르다.
  fetchFile: async (access) => {
    const response = await fetch(access.url, { method: "GET" });
    if (!response.ok) throw new Error(`PDF 를 불러오지 못했습니다 (${response.status}).`);
    return response.blob();
  },
};

const mockReportFileGateway: ReportFileGateway = {
  async requestAccess() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      url: "/reports/CheckOn-parent-report-2026-08.pdf",
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      contentType: "application/pdf",
      pageCount: 7,
    };
  },
  async fetchFile() {
    return new Blob([], { type: "application/pdf" });
  },
};

export const reportFileGateway = env.dataSource === "api" ? httpReportFileGateway : mockReportFileGateway;

/** 만료됐는지. 발급 직후라도 시계 차이를 감안해 5초 여유를 둔다. */
export function isAccessExpired(access: ReportFileAccessDto) {
  return new Date(access.expiresAt).getTime() - 5_000 <= Date.now();
}
