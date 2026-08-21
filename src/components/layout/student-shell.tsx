"use client";

import { usePathname } from "next/navigation";
import { AppBar } from "@/components/layout/app-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ROUTES, routeBuilders } from "@/config/routes";

type StudentChrome = { title: string; backHref?: string; action?: { label: string; href: string }; bottomNavigation: boolean; notification?: boolean };

function resolveChrome(pathname: string): StudentChrome {
  const worksheetMatch = pathname.match(/^\/student\/worksheets\/([^/]+)/);
  const worksheetId = worksheetMatch?.[1];
  if (worksheetId && pathname.endsWith("/solve/question")) return { title: "문제 질문 작성", action: { label: "취소", href: routeBuilders.student.solveWorksheet(worksheetId) }, bottomNavigation: false };
  if (worksheetId && pathname.endsWith("/solve")) return { title: "문제 풀이", action: { label: "종료", href: routeBuilders.student.worksheet(worksheetId) }, bottomNavigation: false };
  if (worksheetId && pathname.endsWith("/submit")) return { title: "답안 제출 확인", action: { label: "닫기", href: routeBuilders.student.solveWorksheet(worksheetId) }, bottomNavigation: false };
  if (worksheetId && pathname.endsWith("/results")) return { title: "채점 결과", action: { label: "학습기록", href: ROUTES.student.records }, bottomNavigation: false };
  if (worksheetId) return { title: "학습지 상세", backHref: ROUTES.student.worksheets, bottomNavigation: false };
  if (pathname === ROUTES.student.worksheets) return { title: "학습지 목록", bottomNavigation: true };
  return { title: "Check-On", bottomNavigation: true, notification: pathname === ROUTES.student.home };
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chrome = resolveChrome(pathname);
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[390px] bg-app shadow-[0_0_40px_rgb(32_41_57/12%)]">
      <AppBar title={chrome.title} backHref={chrome.backHref} action={chrome.action} hasNotification={chrome.notification} />
      <main className={`min-h-[calc(100dvh-76px)] ${chrome.bottomNavigation ? "pb-[calc(80px+env(safe-area-inset-bottom))]" : "pb-[calc(84px+env(safe-area-inset-bottom))]"}`}>{children}</main>
      {chrome.bottomNavigation ? <BottomNavigation mode="student" /> : null}
    </div>
  );
}
