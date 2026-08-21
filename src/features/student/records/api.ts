import { learningRecordFixtures } from "@/features/student/records/mock-data";
import type { LearningRecord } from "@/features/student/records/types";

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const mockLearningRecordGateway = {
  async list(): Promise<LearningRecord[]> {
    await wait(180);
    return learningRecordFixtures;
  },
  async get(recordId: string): Promise<LearningRecord | undefined> {
    await wait(180);
    return learningRecordFixtures.find((record) => record.id === recordId);
  },
};
