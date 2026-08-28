"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppBar } from "@/components/layout/app-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useSelectedChild } from "@/features/parent/shared/parent.store";
import { useParentNotificationsQuery, useParentProfileQuery } from "@/features/parent/api/queries";
import { useParentStore } from "@/features/parent/shared/parent.store";

type ParentChrome = { title: string; backHref?: string; bottomNavigation: boolean; notification?: boolean; selectable?: boolean; action?: { label: string; href: string } };

function resolveChrome(pathname: string, childName: string): ParentChrome {
  if (pathname === ROUTES.parent.home) return { title: childName, selectable: true, notification: true, bottomNavigation: true };
  if (/^\/parent\/records\/[^/]+$/.test(pathname)) return { title: "학습기록 상세", backHref: ROUTES.parent.records, bottomNavigation: false };
  if (pathname === ROUTES.parent.records) return { title: "자녀 학습기록", bottomNavigation: true };
  if (/^\/parent\/analysis\/[^/]+$/.test(pathname)) return { title: "취약 영역 상세", backHref: ROUTES.parent.analysis, bottomNavigation: false };
  if (pathname === ROUTES.parent.analysis) return { title: "고급 분석", bottomNavigation: true };
  if (/^\/parent\/reports\/[^/]+\/pdf$/.test(pathname)) {
    const reportId = pathname.split("/")[3];
    return { title: "PDF 보고서", backHref: routeBuilders.parent.report(reportId), bottomNavigation: false };
  }
  if (/^\/parent\/reports\/[^/]+$/.test(pathname)) return { title: "보고서 상세", backHref: ROUTES.parent.reports, bottomNavigation: false };
  if (pathname === ROUTES.parent.reports) return { title: "월별 보고서", bottomNavigation: true };
  if (pathname === routeBuilders.parent.confirmConsultation()) return { title: "상담 요청 확인", backHref: routeBuilders.parent.newConsultation(), bottomNavigation: false };
  if (pathname === "/parent/consultations/complete") return { title: "상담 요청 완료", bottomNavigation: false };
  if (pathname === routeBuilders.parent.newConsultation()) return { title: "상담 요청", backHref: ROUTES.parent.consultations, bottomNavigation: false };
  if (/^\/parent\/consultations\/[^/]+$/.test(pathname)) return { title: "상담 상세", backHref: ROUTES.parent.consultations, bottomNavigation: false };
  if (pathname === ROUTES.parent.consultations) return { title: "상담 내역", backHref: ROUTES.parent.home, bottomNavigation: false, action: { label: "상담 요청", href: routeBuilders.parent.newConsultation() } };
  if (pathname === routeBuilders.parent.childRegister()) return { title: "자녀 등록", backHref: ROUTES.parent.profile, bottomNavigation: false };
  if (pathname === routeBuilders.parent.inviteCode()) return { title: "초대 코드 등록", backHref: ROUTES.parent.profile, bottomNavigation: false };
  if (pathname === ROUTES.parent.notifications) return { title: "알림", backHref: ROUTES.parent.home, bottomNavigation: false };
  if (pathname === ROUTES.parent.profile) return { title: "내 정보", bottomNavigation: true };
  return { title: "Check-On", bottomNavigation: false };
}

export function ParentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const child = useSelectedChild();
  const hydrateProfile = useParentStore((state) => state.hydrateProfile);
  const isAuthRoute = pathname === ROUTES.auth.parentLogin || pathname === ROUTES.auth.parentSignup;
  // 로그인 전 401 요청이 캐시에 남으면 로그인 후에도 자녀 목록을 못 받아 홈 조회가 막힌다.
  const profileQuery = useParentProfileQuery({ enabled: !isAuthRoute });
  const notificationsQuery = useParentNotificationsQuery({ enabled: !isAuthRoute });
  useEffect(() => { if (profileQuery.data) hydrateProfile(profileQuery.data); }, [hydrateProfile, profileQuery.data]);
  if (isAuthRoute) return <>{children}</>;
  const chrome = resolveChrome(pathname, child?.name ?? "자녀 선택");
  const hasUnreadNotification = notificationsQuery.data?.some((notification) => !notification.read) ?? false;
  return <div className="relative mx-auto min-h-dvh w-full max-w-[390px] bg-app shadow-[0_0_40px_rgb(32_41_57/12%)]">
    <AppBar title={chrome.title} selectableTitle={chrome.selectable} hasNotification={chrome.notification} hasUnreadNotification={hasUnreadNotification} notificationHref={ROUTES.parent.notifications} backHref={chrome.backHref} action={chrome.action} />
    <main className={`min-h-[calc(100dvh-76px)] ${chrome.bottomNavigation ? "pb-[calc(80px+env(safe-area-inset-bottom))]" : ""}`}>{children}</main>
    {chrome.bottomNavigation ? <BottomNavigation mode="parent" /> : null}
  </div>;
}
