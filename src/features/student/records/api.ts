import { learningRecordFixtures } from "@/features/student/records/mock-data";
import type { LearningRecord } from "@/features/student/records/types";
import { env } from "@/config/env";
import { apiRequest } from "@/lib/api/client";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export interface LearningRecordGateway {
  list(): Promise<LearningRecord[]>;
  get(recordId: string): Promise<LearningRecord | undefined>;
}

const mockLearningRecordGateway: LearningRecordGateway = {
  async list(): Promise<LearningRecord[]> {
    await wait(180);
    return learningRecordFixtures;
  },
  async get(recordId: string): Promise<LearningRecord | undefined> {
    await wait(180);
    return learningRecordFixtures.find((record) => record.id === recordId);
  },
};

const httpLearningRecordGateway: LearningRecordGateway = {
  list: () => apiRequest("/v1/students/me/learning-records"),
  get: (recordId) => apiRequest(`/v1/students/me/learning-records/${recordId}`),
};

export const learningRecordGateway = env.dataSource === "api" ? httpLearningRecordGateway : mockLearningRecordGateway;
