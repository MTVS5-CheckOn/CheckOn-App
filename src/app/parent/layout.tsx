import { ParentShell } from "@/components/layout/parent-shell";
export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return <ParentShell>{children}</ParentShell>;
}
