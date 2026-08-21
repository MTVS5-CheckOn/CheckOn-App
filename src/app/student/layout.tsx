import { AppShell } from "@/components/layout/app-shell";
export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return <AppShell title="Check-On" mode="student">{children}</AppShell>;
}
