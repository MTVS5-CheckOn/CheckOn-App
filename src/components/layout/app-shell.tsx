import { AppBar } from "@/components/layout/app-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

export function AppShell({ title, mode, children, selectableTitle = false }: { title: string; mode: "student" | "parent"; children: React.ReactNode; selectableTitle?: boolean }) {
  return <div className="relative mx-auto min-h-dvh w-full max-w-[390px] bg-app shadow-[0_0_40px_rgb(32_41_57/12%)]"><AppBar title={title} selectableTitle={selectableTitle} hasNotification /><main className="min-h-[calc(100dvh-76px)] pb-[calc(80px+env(safe-area-inset-bottom))]">{children}</main><BottomNavigation mode={mode} /></div>;
}
