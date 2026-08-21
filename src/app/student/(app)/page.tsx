import type { Metadata } from "next";
import { StudentHome } from "@/features/student/home/student-home";

export const metadata: Metadata = { title: "학생 홈" };
export default function StudentHomePage() { return <StudentHome />; }
