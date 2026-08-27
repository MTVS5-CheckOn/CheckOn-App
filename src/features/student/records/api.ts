import { learningRecordFixtures } from "@/features/student/records/mock-data";
import type { LearningRecord } from "@/features/student/records/types";
import { env } from "@/config/env";
import { toStudentRecord, toStudentRecordDetail } from "@/features/student/api/adapters";
import { learningRecordDetailSchema, studentRecordPageSchema } from "@/features/student/api/schemas";
import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { pageQuery, type CursorPage } from "@/lib/api/types";
import { parseApiResponse } from "@/lib/api/validate";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export type ListQuery = { cursor?: string | null; limit?: number };

export interface LearningRecordGateway {
  list(query?: ListQuery): Promise<CursorPage<LearningRecord>>;
  get(recordId: string): Promise<LearningRecord | undefined>;
}

const mockLearningRecordGateway: LearningRecordGateway = {
  async list() { await wait(180); return { items: learningRecordFixtures, nextCursor: null, hasNext: false }; },
  async get(recordId) { await wait(180); return learningRecordFixtures.find((record) => record.id === recordId); },
};

const httpLearningRecordGateway: LearningRecordGateway = {
  list: async (query) => {
    const page = parseApiResponse(
      studentRecordPageSchema,
      await apiRequest(`${endpoints.student.learningRecords()}${pageQuery(query)}`),
      "student.records",
    );
    return { ...page, items: page.items.map(toStudentRecord) };
  },
  get: async (recordId) =>
    toStudentRecordDetail(parseApiResponse(
      learningRecordDetailSchema,
      await apiRequest(endpoints.student.learningRecord(recordId)),
      "student.record",
    )),
};

export const learningRecordGateway = env.dataSource === "api" ? httpLearningRecordGateway : mockLearningRecordGateway;
