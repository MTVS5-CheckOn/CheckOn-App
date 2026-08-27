import { areaLabel, toDisplayDate, toPercent, toShortDate } from "@/features/parent/api/adapters";
import type {
  StudentHomeDto,
  StudentProfileDto,
  StudentQuestionDetailDto,
  StudentQuestionDto,
  StudentRecordDetailDto,
  StudentRecordDto,
  WorksheetDetailDto,
  WorksheetDto,
} from "@/features/student/api/dto";
import type { StudentHomeResponse } from "@/features/student/home/model";
import type { LearningRecord, RecordArea } from "@/features/student/records/types";
import type { StudentProfileResponse } from "@/features/student/profile/types";
import type { StudentQuestion } from "@/features/student/questions/types";
import type { Worksheet, WorksheetStatus } from "@/features/student/worksheets/types";

/** 🔴 enum 변환은 map 상수 하나로. 모르는 값은 throw 하지 않고 중립값으로 떨어뜨린다. */
const WORKSHEET_STATUS: Record<string, WorksheetStatus> = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

const QUESTION_STATUS: Record<string, StudentQuestion["status"]> = {
  WAITING: "waiting",
  ANSWERED: "answered",
  FOLLOW_UP: "answered",
};

export function toWorksheet(dto: WorksheetDto | WorksheetDetailDto): Worksheet {
  return {
    id: dto.assignmentId,
    title: dto.title,
    description: "description" in dto ? dto.description ?? "" : "",
    area: areaLabel(dto.areaTag) as Worksheet["area"],
    questionCount: dto.itemCount,
    estimatedMinutes: dto.estimatedMinutes ?? 0,
    status: WORKSHEET_STATUS[dto.status] ?? "new",
    // 🔴 COMPLETED 일 때만 온다. 0 으로 채우면 "정답률 0%" 로 보인다 — undefined 로 둔다.
    accuracy: dto.accuracyRate == null ? undefined : toPercent(dto.accuracyRate) ?? undefined,
    reviewedByTeacher: Boolean(dto.teacher),
  };
}

export function toStudentHome(dto: StudentHomeDto): StudentHomeResponse {
  return {
    studentName: dto.studentName,
    continuing: dto.continuing ? toWorksheet(dto.continuing) : null,
    todayWorksheets: dto.todayWorksheets.map(toWorksheet),
    // 🔴 status 가 AVAILABLE 이 아니면 약점이 확정되지 않은 것이다. 지어내지 않는다.
    weakness: dto.weakness && dto.weakness.status === "AVAILABLE"
      ? { area: areaLabel(dto.weakness.areaTag), accuracy: toPercent(dto.weakness.accuracyRate) }
      : null,
  };
}

export function toStudentRecord(dto: StudentRecordDto): LearningRecord {
  return {
    id: dto.recordId,
    worksheetId: dto.assignmentId ?? "",
    title: dto.title,
    date: toShortDate(dto.occurredAt),
    month: dto.month ?? dto.occurredAt.slice(0, 7),
    area: areaLabel(dto.areaTag) as RecordArea,
    questionCount: dto.itemCount,
    correctCount: dto.correctCount,
    elapsedSeconds: dto.totalActiveElapsedSeconds ?? 0,
    // 🔴 목록에는 약점 판정과 문항이 없다. 상세에서만 온다 — 빈 값으로 둔다.
    weakness: "",
    weaknessDescription: "",
    trend: [],
    questions: [],
  };
}

export function toStudentRecordDetail(dto: StudentRecordDetailDto): LearningRecord {
  // 🔴 실제 백엔드는 items 대신 itemIds 만 보내기도 한다(계약은 required).
  //    문항 본문이 없으면 문항별 목록을 그릴 수 없다 — 없는 것을 계산해 채우지 않는다.
  const weaknessStatus = dto.weakness?.status ?? dto.weaknessStatus ?? null;
  const available = weaknessStatus === "AVAILABLE";
  return {
    ...toStudentRecord(dto),
    weakness: available ? areaLabel(dto.weakness?.areaTag) : "",
    weaknessDescription: available ? dto.weakness?.description ?? "" : "",
    trend: (dto.trend ?? [])
      .filter((point) => point.status === "AVAILABLE" && point.accuracyRate != null)
      .map((point) => ({ label: point.month, accuracy: toPercent(point.accuracyRate) ?? 0 })),
    // 🔴 정답·해설은 서버가 준 것만 쓴다. 로컬에서 판정하지 않는다.
    questions: (dto.items ?? []).map((item, index) => ({
      id: item.itemId,
      number: item.itemNo ?? index + 1,
      stem: item.stem ?? "",
      answer: item.selectedNo ?? 0,
      correctAnswer: item.correctNo ?? 0,
      elapsedSeconds: item.activeElapsedSeconds ?? 0,
      explanation: item.explanation ?? "",
    })),
  };
}

export function toStudentProfile(dto: StudentProfileDto): StudentProfileResponse {
  return {
    studentId: dto.studentPublicId,
    name: dto.name,
    grade: `고${dto.grade}`,
    status: dto.activationStatus === "ACTIVE" ? "active" : "inactive",
    // 🔴 academy 는 계약에 없다. subject 도 현재 항상 null 이다.
    teachers: dto.teachers.map((teacher) => ({
      id: teacher.teacherId,
      name: teacher.displayName,
      subject: teacher.subject ?? null,
    })),
    notificationsEnabled: dto.notificationsEnabled,
  };
}

export function toStudentQuestion(dto: StudentQuestionDto): StudentQuestion {
  return {
    id: dto.questionId,
    worksheetId: dto.assignmentId ?? "",
    worksheetTitle: dto.worksheetTitle ?? "",
    questionNumber: dto.itemOrdinal ?? 0,
    title: dto.title,
    content: "",
    status: QUESTION_STATUS[dto.status] ?? "waiting",
    createdAt: toDisplayDate(dto.createdAt),
    answeredAt: dto.answeredAt ? toDisplayDate(dto.answeredAt) : undefined,
    // 🔴 목록에는 메시지가 없다. 빈 배열이 정상이다.
    messages: [],
  };
}

export function toStudentQuestionDetail(dto: StudentQuestionDetailDto): StudentQuestion {
  return {
    ...toStudentQuestion(dto),
    content: dto.content,
    messages: dto.messages.map((message) => ({
      id: message.messageId,
      authorRole: message.authorRole === "TEACHER" ? "teacher" : "student",
      content: message.content,
      publishedAt: toDisplayDate(message.publishedAt),
    })),
  };
}
