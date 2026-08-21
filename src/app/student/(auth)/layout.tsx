import { AuthShell } from "@/components/layout/auth-shell";

export default function StudentAuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
