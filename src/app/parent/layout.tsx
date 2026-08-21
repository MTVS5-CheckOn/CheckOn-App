import { AppShell } from "@/components/layout/app-shell";
export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return <AppShell title="김민준" selectableTitle mode="parent">{children}</AppShell>;
}
