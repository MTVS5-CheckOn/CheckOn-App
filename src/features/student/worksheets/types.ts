export type WorksheetStatus = "new" | "in_progress" | "completed";

export type Worksheet = {
  id: string;
  title: string;
  description: string;
  area: "문학" | "독서" | "화법과작문" | "언어·매체";
  questionCount: number;
  estimatedMinutes: number;
  status: WorksheetStatus;
  accuracy?: number;
  reviewedByTeacher: boolean;
};
