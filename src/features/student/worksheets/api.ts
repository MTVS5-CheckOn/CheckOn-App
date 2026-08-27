import { worksheetFixtures } from "@/features/student/worksheets/mock-data";
import type { Worksheet } from "@/features/student/worksheets/types";
import { env } from "@/config/env";
import { toWorksheet } from "@/features/student/api/adapters";
import { worksheetDetailSchema, worksheetPageSchema } from "@/features/student/api/schemas";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { pageQuery, type CursorPage } from "@/lib/api/types";
import { parseApiResponse } from "@/lib/api/validate";

export type ListQuery = { cursor?: string | null; limit?: number };

export interface WorksheetGateway {
  list(query?: ListQuery): Promise<CursorPage<Worksheet>>;
  get(assignmentId: string): Promise<Worksheet | null>;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 180));

const mockWorksheetGateway: WorksheetGateway = {
  async list() { await wait(); return { items: worksheetFixtures, nextCursor: null, hasNext: false }; },
  async get(assignmentId) { await wait(); return worksheetFixtures.find((worksheet) => worksheet.id === assignmentId) ?? null; },
};

const httpWorksheetGateway: WorksheetGateway = {
  list: async (query) => {
    const page = parseApiResponse(
      worksheetPageSchema,
      await apiRequest(`${endpoints.student.worksheets()}${pageQuery(query)}`),
      "student.worksheets",
    );
    return { ...page, items: page.items.map(toWorksheet) };
  },
  get: async (assignmentId) =>
    toWorksheet(parseApiResponse(worksheetDetailSchema, await apiRequest(endpoints.student.worksheet(assignmentId)), "student.worksheet")),
};

export const worksheetGateway = env.dataSource === "api" ? httpWorksheetGateway : mockWorksheetGateway;
