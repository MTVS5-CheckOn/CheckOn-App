import { describe, expect, it } from "vitest";
import type { ParentNotification } from "@/features/parent/model/types";
import { parentNotificationHref } from "@/features/parent/notifications/notification-route";

const notification = (type: ParentNotification["type"], resourceId: string | null = "resource-1"): ParentNotification => ({
  id: "notification-1",
  type,
  title: "알림",
  body: "",
  createdAt: "2026.08.28",
  read: false,
  target: { studentId: "student-1", resourceId },
});

describe("학부모 알림 target 경로", () => {
  it.each([
    ["report", "/parent/reports/resource-1"],
    ["consultation", "/parent/consultations/resource-1"],
    ["learning", "/parent/records/resource-1"],
    ["child", "/parent/profile"],
  ] as const)("%s 알림을 실제 상세 경로로 연결한다", (type, expected) => {
    expect(parentNotificationHref(notification(type))).toBe(expected);
  });

  it("상세 리소스가 없으면 잘못된 경로를 만들지 않는다", () => {
    expect(parentNotificationHref(notification("report", null))).toBeNull();
  });

  it("학부모 경로가 없는 학생 질문 알림은 이동시키지 않는다", () => {
    expect(parentNotificationHref(notification("question"))).toBeNull();
  });
});
