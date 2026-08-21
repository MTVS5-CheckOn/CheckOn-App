import { worksheetFixtures } from "@/features/student/worksheets/mock-data";
import type { Worksheet } from "@/features/student/worksheets/types";

export interface WorksheetGateway {
  list(): Promise<Worksheet[]>;
  get(worksheetId: string): Promise<Worksheet | null>;
}

export const mockWorksheetGateway: WorksheetGateway = {
  async list() { await new Promise((resolve) => setTimeout(resolve, 180)); return worksheetFixtures; },
  async get(worksheetId) { await new Promise((resolve) => setTimeout(resolve, 180)); return worksheetFixtures.find((worksheet) => worksheet.id === worksheetId) ?? null; },
};
