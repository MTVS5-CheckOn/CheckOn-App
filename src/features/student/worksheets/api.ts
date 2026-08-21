import { worksheetFixtures } from "@/features/student/worksheets/mock-data";
import type { Worksheet } from "@/features/student/worksheets/types";
import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";

export interface WorksheetGateway {
  list(): Promise<Worksheet[]>;
  get(worksheetId: string): Promise<Worksheet | null>;
}

const mockWorksheetGateway: WorksheetGateway = {
  async list() { await new Promise((resolve) => setTimeout(resolve, 180)); return worksheetFixtures; },
  async get(worksheetId) { await new Promise((resolve) => setTimeout(resolve, 180)); return worksheetFixtures.find((worksheet) => worksheet.id === worksheetId) ?? null; },
};

const httpWorksheetGateway: WorksheetGateway = {
  list: () => apiRequest("/v1/students/me/worksheets"),
  get: (worksheetId) => apiRequest(`/v1/students/me/worksheets/${worksheetId}`),
};

export const worksheetGateway = env.dataSource === "api" ? httpWorksheetGateway : mockWorksheetGateway;
