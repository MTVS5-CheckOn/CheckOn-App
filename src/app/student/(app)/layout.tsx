import { StudentShell } from "@/components/layout/student-shell";

export default function StudentAppLayout({ children }: LayoutProps<"/student">) {
  return <StudentShell>{children}</StudentShell>;
}
