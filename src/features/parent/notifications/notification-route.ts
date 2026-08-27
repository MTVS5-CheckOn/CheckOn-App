import { ROUTES, routeBuilders } from "@/config/routes";
import type { ParentNotification } from "@/features/parent/model/types";

/** 백엔드 target.resourceId를 실제 상세 리소스 경로로 변환한다. */
export function parentNotificationHref(notification: ParentNotification): string | null {
  const resourceId = notification.target?.resourceId;

  switch (notification.type) {
    case "report":
      return resourceId ? routeBuilders.parent.report(resourceId) : null;
    case "consultation":
      return resourceId ? routeBuilders.parent.consultation(resourceId) : null;
    case "learning":
      return resourceId ? routeBuilders.parent.record(resourceId) : null;
    case "child":
      return ROUTES.parent.profile;
    case "question":
      // QUESTION_ANSWERED는 학생용 어휘다. 학부모 상세 경로는 계약에 없다.
      return null;
  }
}
