import type { Metadata } from "next";
import { ParentHome } from "@/features/parent/home/parent-home";

export const metadata: Metadata = { title: "학부모 홈" };
export default function ParentHomePage() { return <ParentHome />; }
