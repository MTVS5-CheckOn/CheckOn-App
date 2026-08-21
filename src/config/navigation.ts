import { BarChart3, ClipboardList, FileText, Home, MessageCircleQuestion, UserRound, type LucideIcon } from "lucide-react";
import { ROUTES, type AppRoute } from "@/config/routes";

export type NavigationItem = { label: string; href: AppRoute; icon: LucideIcon };
export const studentNavigation: readonly NavigationItem[] = [
  { label: "홈", href: ROUTES.student.home, icon: Home }, { label: "학습기록", href: ROUTES.student.records, icon: ClipboardList },
  { label: "질문", href: ROUTES.student.questions, icon: MessageCircleQuestion }, { label: "내 정보", href: ROUTES.student.profile, icon: UserRound },
];
export const parentNavigation: readonly NavigationItem[] = [
  { label: "홈", href: ROUTES.parent.home, icon: Home }, { label: "학습기록", href: ROUTES.parent.records, icon: ClipboardList },
  { label: "고급분석", href: ROUTES.parent.analysis, icon: BarChart3 }, { label: "보고서", href: ROUTES.parent.reports, icon: FileText },
  { label: "내 정보", href: ROUTES.parent.profile, icon: UserRound },
];
