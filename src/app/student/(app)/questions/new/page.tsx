import { Suspense } from "react";
import { NewQuestionForm } from "@/features/student/questions/new-question-form";
export default function Page() { return <Suspense fallback={<div className="p-5 text-sm text-muted">질문 작성 화면을 준비하고 있어요.</div>}><NewQuestionForm /></Suspense>; }
