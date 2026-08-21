import { Suspense } from "react";
import { ConsultationComplete } from "@/features/parent/consultations/consultation-complete";
export default function Page() { return <Suspense fallback={<div className="p-5 text-sm text-muted">상담 요청 결과를 확인하고 있어요.</div>}><ConsultationComplete /></Suspense>; }
