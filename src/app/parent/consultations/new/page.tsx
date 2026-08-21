import { Suspense } from "react";
import { NewConsultationForm } from "@/features/parent/consultations/new-consultation-form";
export default function Page() { return <Suspense fallback={<div className="p-5 text-sm text-muted">상담 요청 화면을 준비하고 있어요.</div>}><NewConsultationForm /></Suspense>; }
