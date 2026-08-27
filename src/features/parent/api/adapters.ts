import type { z } from "zod";
import type {
  childSchema,
  consultationDetailSchema,
  consultationSchema,
  learningRecordDetailSchema,
  learningRecordSummarySchema,
  notificationSchema,
  parentAnalysisSchema,
  parentHomeSchema,
  parentProfileSchema,
  reportDetailSchema,
  reportSummarySchema,
  weaknessCellSchema,
} from "@/features/parent/api/schemas";
import type {
  ParentAnalysisResponse,
  ParentHomeResponse,
  ParentNotification,
  ParentProfileResponse,
  ParentRecord,
  ParentReport,
} from "@/features/parent/model/types";
import type { ConsultationStatus, ParentConsultation } from "@/features/parent/consultations/types";

/**
 * 🔴 enum 변환은 이 파일의 map 상수 하나로만 한다.
 * 모르는 값은 throw 하지 않고 "UNKNOWN" 계열로 떨어뜨린다 —
 * 서버가 enum 을 추가했을 때 앱이 죽으면 안 된다.
 */
const AREA_LABELS: Record<string, string> = {
  language: "언어·매체",
  media: "언어·매체",
  literature: "문학",
  reading: "독서",
  speech_writing: "화법과작문",
};

const TYPE_LABELS: Record<string, string> = {
  fact: "사실적 이해",
  infer: "추론적 이해",
  critic: "비판적 이해",
  concept: "개념 이해",
  apply: "적용",
};

const CONSULTATION_STATUS: Record<string, ConsultationStatus> = {
  SUBMITTED: "submitted",
  REVIEWING: "reviewing",
  ANSWERED: "answered",
  CLOSED: "closed",
  CANCELLED: "cancelled",
};

const NOTIFICATION_TYPES: Record<string, ParentNotification["type"]> = {
  REPORT_PUBLISHED: "report",
  CONSULTATION_ANSWERED: "consultation",
  QUESTION_ANSWERED: "consultation",
  LEARNING_SUBMITTED: "learning",
  CHILD_LINKED: "learning",
};

export const areaLabel = (tag: string | null | undefined) => (tag ? AREA_LABELS[tag] ?? "기타" : "기타");
export const typeLabel = (tag: string | null | undefined) => (tag ? TYPE_LABELS[tag] ?? "기타" : "기타");
export const consultationStatusOf = (value: string): ConsultationStatus => CONSULTATION_STATUS[value] ?? "submitted";
export const notificationTypeOf = (value: string): ParentNotification["type"] => NOTIFICATION_TYPES[value] ?? "learning";

/** 🔴 accuracyRate 는 0~1 이다. ×100 은 여기서 한 번만 한다. */
export const toPercent = (rate: number | null | undefined) => (rate == null ? null : Math.round(rate * 100));

const pad = (value: number) => String(value).padStart(2, "0");

/** RFC 3339 instant → 화면용 `MM.DD`. 서버는 UTC 로 준다. */
export function toShortDate(instant: string) {
  const date = new Date(instant);
  return Number.isNaN(date.getTime()) ? "" : `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

export function toDisplayDate(instant: string) {
  const date = new Date(instant);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function toElapsed(seconds: number | null | undefined) {
  if (seconds == null) return "";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}분`;
}

type RecordSummaryDto = z.infer<typeof learningRecordSummarySchema>;
type RecordDetailDto = z.infer<typeof learningRecordDetailSchema>;
type HomeDto = z.infer<typeof parentHomeSchema>;
type AnalysisDto = z.infer<typeof parentAnalysisSchema>;
type ReportSummaryDto = z.infer<typeof reportSummarySchema>;
type ReportDetailDto = z.infer<typeof reportDetailSchema>;
type ProfileDto = z.infer<typeof parentProfileSchema>;
type NotificationDto = z.infer<typeof notificationSchema>;
type ConsultationDto = z.infer<typeof consultationSchema>;
type ConsultationDetailDto = z.infer<typeof consultationDetailSchema>;
type ChildDto = z.infer<typeof childSchema>;
type WeaknessDto = z.infer<typeof weaknessCellSchema>;

export function toParentRecord(dto: RecordSummaryDto): ParentRecord {
  const accuracy = toPercent(dto.accuracyRate) ?? 0;
  return {
    id: dto.recordId,
    date: toShortDate(dto.occurredAt),
    month: dto.month ?? dto.occurredAt.slice(0, 7),
    area: areaLabel(dto.areaTag) as ParentRecord["area"],
    title: dto.title,
    questionCount: dto.itemCount,
    accuracy,
    elapsed: toElapsed(dto.totalActiveElapsedSeconds),
    wrongCount: Math.max(0, dto.itemCount - dto.correctCount),
    // 🔴 목록 응답에 추이가 없다. 상세에서만 온다 — 지어내지 않고 빈 배열로 둔다.
    trend: [],
    detail: emptyRecordDetail(dto),
  };
}

/**
 * 🔴 목록 DTO 에 없는 상세 값은 지어내지 않는다.
 * 서버가 주는 것만 채우고 나머지는 빈 문자열·0 으로 두되, 화면은 상세 조회 결과를 쓴다.
 */
function emptyRecordDetail(dto: RecordSummaryDto): ParentRecord["detail"] {
  return {
    totalTime: toElapsed(dto.totalActiveElapsedSeconds),
    wrongTypeSummary: "",
    overtimeQuestionSummary: "",
    baselineAccuracy: 0,
    correctCount: dto.correctCount,
    reviewCount: 0,
    repeatedMistakeCount: 0,
    insight: "",
    skillResults: [],
  };
}

export function toParentRecordDetail(dto: RecordDetailDto): ParentRecord {
  const base = toParentRecord(dto);
  const wrongItems = dto.items.filter((item) => item.correct === false);
  return {
    ...base,
    trend: (dto.trend ?? [])
      .filter((point) => point.status === "AVAILABLE" && point.accuracyRate != null)
      .map((point) => ({ label: point.month, accuracy: toPercent(point.accuracyRate) ?? 0 })),
    detail: {
      ...base.detail,
      wrongTypeSummary: wrongItems.length ? `${wrongItems.length}문항 오답` : "",
      overtimeQuestionSummary: "",
      correctCount: dto.correctCount,
      // 🔴 계약에 원본이 없는 값은 채우지 않는다. 화면이 빈 상태를 그린다.
      insight: dto.weakness.status === "AVAILABLE" ? dto.weakness.description ?? "" : "",
      skillResults: dto.items.length
        ? [{
            skill: typeLabel(dto.weakness.typeTag),
            accuracy: toPercent(dto.accuracyRate),
            questionCount: dto.itemCount,
            status: dto.weakness.status === "AVAILABLE" ? "weak" : "insufficient",
          }]
        : [],
    },
  };
}

const METRIC_LABELS: Record<string, string> = {
  MONTHLY_ACCURACY: "정답률",
  SOLVED_COUNT: "풀이 문항",
  AVERAGE_DURATION_SEC: "학습 시간",
  WEAKNESS_DELTA_PP: "약점 개선도",
};

/** 🔴 status 가 AVAILABLE 이 아니면 값이 없다. 0 으로 채우지 않고 "—" 로 둔다. */
function metricValue(metric: HomeDto["metrics"][number]) {
  if (metric.status !== "AVAILABLE" || metric.value == null) return "—";
  switch (metric.unit) {
    case "RATIO": return `${toPercent(metric.value)}%`;
    case "SECONDS": return `${Math.round(metric.value / 60)}분`;
    case "PERCENTAGE_POINT": return `${metric.value > 0 ? "+" : ""}${metric.value}%p`;
    default: return `${metric.value}문항`;
  }
}

export function toParentHome(dto: HomeDto): ParentHomeResponse {
  return {
    // 🔴 이름이 없으면 빈 문자열. 화면이 그 자리를 렌더링하지 않는다.
    student: { id: dto.child.studentId, name: dto.child.name ?? "", period: "" },
    metrics: dto.metrics.map((metric) => ({
      label: METRIC_LABELS[metric.key] ?? metric.key,
      value: metricValue(metric),
      emphasis: metric.key === "WEAKNESS_DELTA_PP",
    })),
    // 🔴 보고서는 강사가 발행해야 생긴다. 없으면 빈 값이고 오류가 아니다.
    report: dto.latestReport
      ? {
          id: dto.latestReport.reportId,
          month: dto.latestReport.reportMonth,
          title: `${dto.latestReport.teacher.displayName}이 발행한 월별 보고서`,
          issuedAt: toDisplayDate(dto.latestReport.publishedAt),
        }
      : { id: "", month: "", title: "", issuedAt: "" },
    recent: (dto.recentRecords ?? []).map(toParentRecord),
  };
}

export function toParentAnalysis(dto: AnalysisDto): ParentAnalysisResponse {
  const available = dto.overall.status === "AVAILABLE";
  const weakness = dto.primaryWeakness ?? dto.weaknessRanking[0] ?? null;
  return {
    accuracy: available ? toPercent(dto.overall.accuracyRate) ?? 0 : 0,
    // 🔴 계약에 baseline(비교군 평균) 원본이 없다. 0 으로 두고 화면이 표시하지 않는다.
    baselineAccuracy: 0,
    weaknessImprovement: weakness?.improvement?.status === "AVAILABLE" ? weakness.improvement.accuracyDeltaPp ?? 0 : 0,
    comparisonMonth: "",
    analysisAsOf: dto.calculatedAt ? toDisplayDate(dto.calculatedAt) : "",
    gradedQuestionCount: dto.overall.scoredCount ?? 0,
    reviewQuestionCount: 0,
    repeatedMistakeCount: 0,
    areaScores: (dto.areaScores ?? [])
      .filter((score) => score.status === "AVAILABLE" && score.accuracyRate != null)
      .map((score) => ({ area: areaLabel(score.areaTag), score: toPercent(score.accuracyRate) ?? 0 })),
    accuracyTrend: (dto.accuracyTrend ?? [])
      .filter((point) => point.status === "AVAILABLE" && point.accuracyRate != null)
      .map((point) => ({ label: point.month, accuracy: toPercent(point.accuracyRate) ?? 0 })),
    // 🔴 아래 넷은 계약에 원본이 없다. 빈 배열로 두고 화면이 빈 상태를 그린다.
    weeklySummary: [],
    difficultyDistribution: [],
    misconceptionSummary: [],
    weaknessRanking: dto.weaknessRanking
      .filter((cell) => cell.status === "AVAILABLE")
      .map((cell, index) => ({
        rank: index + 1,
        area: areaLabel(cell.areaTag),
        skill: typeLabel(cell.typeTag),
        accuracy: toPercent(cell.accuracyRate) ?? 0,
        questionCount: cell.scoredCount ?? 0,
        gapFromBaseline: cell.improvement?.accuracyDeltaPp ?? 0,
        status: cell.status === "AVAILABLE" ? "confirmed" : "watch",
      })),
    primaryWeakness: toPrimaryWeakness(weakness),
  };
}

function toPrimaryWeakness(cell: WeaknessDto | null): ParentAnalysisResponse["primaryWeakness"] {
  if (!cell) {
    // 🔴 약점이 확정되지 않은 상태. 지어내지 않고 빈 값으로 둔다.
    return {
      area: "", skill: "", score: 0, description: "", studyFrequency: "", averageTime: "",
      evidenceQuestionCount: 0, previousMonthScore: 0, repeatedMistakeCount: 0,
      misconception: "", linkedWeaknesses: [], nextAction: "",
    };
  }
  return {
    area: areaLabel(cell.areaTag),
    skill: typeLabel(cell.typeTag),
    score: toPercent(cell.accuracyRate) ?? 0,
    description: "",
    studyFrequency: "",
    averageTime: "",
    evidenceQuestionCount: cell.scoredCount ?? 0,
    previousMonthScore: toPercent(cell.improvement?.previousAccuracyRate) ?? 0,
    repeatedMistakeCount: 0,
    misconception: "",
    linkedWeaknesses: [],
    nextAction: "",
  };
}

export function toParentReport(dto: ReportSummaryDto): ParentReport {
  const [year, month] = dto.reportMonth.split("-");
  return {
    id: dto.reportId,
    year: Number(year),
    month: Number(month),
    studentName: "",
    // 🔴 TeacherSummary 에 academyName 이 없다. 이름만 쓴다.
    teacher: dto.teacher.displayName,
    issuedAt: toDisplayDate(dto.publishedAt),
    isNew: false,
    studyPeriod: "",
    summary: {
      accuracy: 0, weaknessImprovement: 0, priorityArea: "",
      comparisonMonth: "", gradedQuestionCount: 0, repeatedMistakeCount: 0,
    },
    teacherComment: "",
    sections: [],
    // 🔴 PDF 는 아직 연결되지 않았다. 계약상 false 가 정상이다.
    hasPdf: dto.hasPdf ?? false,
  };
}

/**
 * 🔴 보고서 **상세**는 `sections` 를 준다(계약 ReportDetail required).
 * 요약 adapter 로만 옮기면 서버가 보낸 분석 항목을 통째로 버리고
 * 화면이 "표시할 항목이 없습니다"라는 **거짓 빈 상태**를 그린다.
 */
export function toParentReportDetail(dto: ReportDetailDto): ParentReport {
  return {
    ...toParentReport(dto),
    sections: dto.sections.map((section) => ({
      title: section.title ?? section.kind,
      // status 가 AVAILABLE 이 아니면 body 대신 미산출 사유를 보여준다.
      description: section.status === "AVAILABLE" ? section.body ?? "" : section.unproducedReason ?? "",
      status: section.status === "AVAILABLE" ? "available" : "insufficient",
    })),
  };
}

export function toParentProfile(dto: ProfileDto): ParentProfileResponse {
  return {
    id: dto.parentId,
    name: dto.name,
    maskedPhone: "",
    notificationsEnabled: dto.notificationsEnabled,
    children: dto.children.map(toChild),
    // 🔴 academy 는 계약에 없다. 이름과 과목만 쓴다(과목도 현재 항상 null).
    teachers: dto.teachers.map((teacher) => ({
      id: teacher.teacherId,
      name: teacher.displayName,
      subject: teacher.subject ?? null,
    })),
  };
}

export function toChild(dto: ChildDto) {
  return {
    id: dto.studentId,
    studentId: dto.studentPublicId,
    // 🔴 이름이 없으면 빈 문자열로 두고 화면이 그 자리를 렌더링하지 않는다. 지어내지 않는다.
    name: dto.name ?? "",
    grade: dto.grade == null ? "" : `고${dto.grade}`,
    active: dto.activationStatus === "ACTIVE",
  };
}

export function toParentNotification(dto: NotificationDto): ParentNotification {
  return {
    id: dto.notificationId,
    type: notificationTypeOf(dto.type),
    title: dto.title,
    body: dto.body ?? "",
    createdAt: toDisplayDate(dto.createdAt),
    read: dto.read,
  };
}

export function toParentConsultation(dto: ConsultationDto): ParentConsultation {
  return {
    id: dto.consultationId,
    studentId: dto.studentId,
    teacherId: dto.teacherId,
    childName: dto.childName ?? "",
    teacherName: dto.teacherName ?? "",
    content: "",
    context: undefined,
    status: consultationStatusOf(dto.status),
    createdAt: toDisplayDate(dto.createdAt),
    updatedAt: toDisplayDate(dto.updatedAt ?? dto.createdAt),
    answeredAt: dto.answeredAt ? toDisplayDate(dto.answeredAt) : undefined,
    // 🔴 목록에는 메시지가 없다. 빈 배열이 정상이다.
    messages: [],
  };
}

export function toParentConsultationDetail(dto: ConsultationDetailDto): ParentConsultation {
  return {
    ...toParentConsultation(dto),
    content: dto.content,
    // 🔴 강사가 답해야 채워진다. status WAITING/SUBMITTED 에 messages: [] 가 정상이다.
    messages: dto.messages.map((message) => ({
      id: message.messageId,
      authorRole: message.authorRole === "TEACHER" ? "teacher" : "parent",
      content: message.content,
      publishedAt: toDisplayDate(message.publishedAt),
    })),
  };
}
