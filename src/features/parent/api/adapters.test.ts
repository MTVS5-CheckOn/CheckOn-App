import { describe, expect, it } from "vitest";
import {
  areaLabel,
  consultationStatusOf,
  notificationTypeOf,
  toParentAnalysis,
  toParentConsultationDetail,
  toParentHome,
  toParentRecord,
  toParentRecordDetail,
  toParentReport,
  toPercent,
  typeLabel,
} from "@/features/parent/api/adapters";

const teacher = { teacherId: "t1", displayName: "박지은 선생님", subject: null };

describe("계약 → 도메인 adapter", () => {
  it("🔴 accuracyRate 는 0~1 이다. ×100 은 adapter 에서 한 번만 한다", () => {
    expect(toPercent(0.68)).toBe(68);
    expect(toPercent(1)).toBe(100);
    expect(toPercent(null)).toBeNull();
  });

  it("모르는 enum 값에도 죽지 않고 중립 표시로 떨어진다", () => {
    expect(areaLabel("reading")).toBe("독서");
    expect(areaLabel("한번도_본_적_없는_영역")).toBe("기타");
    expect(typeLabel(null)).toBe("기타");
    expect(consultationStatusOf("SERVER_가_새로_추가한_상태")).toBe("submitted");
    expect(notificationTypeOf("NEW_KIND")).toBe("learning");
  });

  it("대문자 enum 을 화면 소문자 상태로 옮긴다", () => {
    expect(consultationStatusOf("ANSWERED")).toBe("answered");
    expect(consultationStatusOf("CANCELLED")).toBe("cancelled");
    expect(notificationTypeOf("REPORT_PUBLISHED")).toBe("report");
  });

  it("학습기록 요약을 도메인으로 옮긴다", () => {
    const record = toParentRecord({
      recordId: "r1", title: "독서 비문학", occurredAt: "2026-08-18T02:00:00Z",
      itemCount: 15, correctCount: 12, accuracyRate: 0.8, areaTag: "reading",
      totalActiveElapsedSeconds: 1695,
    });
    expect(record.id).toBe("r1");
    expect(record.accuracy).toBe(80);
    expect(record.wrongCount).toBe(3);
    expect(record.area).toBe("독서");
    // 🔴 목록 응답에 추이가 없다. 지어내지 않고 빈 배열이어야 한다.
    expect(record.trend).toEqual([]);
  });

  it("🔴 보고서가 없으면 빈 값이고 오류가 아니다", () => {
    const home = toParentHome({
      child: { studentId: "s1", studentPublicId: "STU-A", name: "김민준", activationStatus: "ACTIVE" },
      metrics: [{ key: "MONTHLY_ACCURACY", status: "AVAILABLE", value: 0.68, unit: "RATIO" }],
      latestReport: null,
      recentRecords: [],
    });
    expect(home.report.id).toBe("");
    expect(home.recent).toEqual([]);
    expect(home.metrics[0].value).toBe("68%");
  });

  it("🔴 status 가 AVAILABLE 이 아니면 0 으로 채우지 않고 — 로 둔다", () => {
    const home = toParentHome({
      child: { studentId: "s1", studentPublicId: "STU-A", name: "김민준", activationStatus: "ACTIVE" },
      metrics: [{ key: "SOLVED_COUNT", status: "NO_DATA", value: null, unit: null }],
    });
    expect(home.metrics[0].value).toBe("—");
  });

  it("🔴 hasPdf 가 없거나 false 면 false 다 (계약상 정상 상태)", () => {
    const report = toParentReport({
      reportId: "rep1", reportMonth: "2026-08", status: "PUBLISHED",
      publishedAt: "2026-08-19T01:00:00Z", teacher,
    });
    expect(report.hasPdf).toBe(false);
    expect(report.year).toBe(2026);
    expect(report.month).toBe(8);
    // 🔴 academyName 은 계약에 없다. 강사 이름만 쓴다.
    expect(report.teacher).toBe("박지은 선생님");
  });

  it("🔴 강사 답변 전에는 messages 가 빈 배열이고 정상이다", () => {
    const consultation = toParentConsultationDetail({
      consultationId: "c1", studentId: "s1", teacherId: "t1", status: "SUBMITTED",
      createdAt: "2026-08-20T01:14:00Z", content: "질문입니다", messages: [],
    });
    expect(consultation.messages).toEqual([]);
    expect(consultation.status).toBe("submitted");
    expect(consultation.teacherId).toBe("t1");
  });

  it("🔴 값이 없는 분석은 빈 배열로 떨어진다 — 0 으로 채우지 않는다", () => {
    const analysis = toParentAnalysis({
      month: "2026-08",
      overall: { status: "NO_DATA", accuracyRate: null, scoredCount: null },
      accuracyTrend: [{ month: "2026-07", accuracyRate: null, status: "INSUFFICIENT" }],
      areaScores: [{ areaTag: "reading", accuracyRate: null, scoredCount: 0, status: "NO_DATA" }],
      weaknessRanking: [],
      primaryWeakness: null,
    });
    expect(analysis.areaScores).toEqual([]);
    expect(analysis.accuracyTrend).toEqual([]);
    expect(analysis.weaknessRanking).toEqual([]);
    expect(analysis.primaryWeakness.area).toBe("");
  });

  it("AVAILABLE 인 항목만 추려 도메인으로 옮긴다", () => {
    const analysis = toParentAnalysis({
      month: "2026-08",
      overall: { status: "AVAILABLE", accuracyRate: 0.68, scoredCount: 37 },
      areaScores: [
        { areaTag: "reading", accuracyRate: 0.43, scoredCount: 12, status: "AVAILABLE" },
        { areaTag: "literature", accuracyRate: null, scoredCount: 1, status: "INSUFFICIENT" },
      ],
      weaknessRanking: [{ areaTag: "reading", typeTag: "concept", status: "AVAILABLE", accuracyRate: 0.43, scoredCount: 12 }],
    });
    expect(analysis.accuracy).toBe(68);
    expect(analysis.gradedQuestionCount).toBe(37);
    expect(analysis.areaScores).toEqual([{ area: "독서", score: 43 }]);
    expect(analysis.weaknessRanking[0]).toMatchObject({ rank: 1, area: "독서", skill: "개념 이해", accuracy: 43 });
  });

  it("🔴 trend 는 실제 집계 결과만 — 결측 구간은 버린다", () => {
    const record = toParentRecordDetail({
      recordId: "r1", title: "독서", occurredAt: "2026-08-18T02:00:00Z",
      itemCount: 2, correctCount: 1, accuracyRate: 0.5,
      items: [{ itemId: "i1", correct: true }, { itemId: "i2", correct: false }],
      weakness: { status: "NO_DATA" },
      trend: [
        { month: "2026-07", accuracyRate: 0.4, status: "AVAILABLE" },
        { month: "2026-06", accuracyRate: null, status: "NO_DATA" },
      ],
    });
    expect(record.trend).toEqual([{ label: "2026-07", accuracy: 40 }]);
    expect(record.detail.insight).toBe("");
  });
});
