import { Suspense } from "react";
import { QuestionComplete } from "@/features/student/questions/question-complete";
export default function Page() { return <Suspense fallback={<div className="p-5 text-sm text-muted">등록 결과를 확인하고 있어요.</div>}><QuestionComplete /></Suspense>; }
