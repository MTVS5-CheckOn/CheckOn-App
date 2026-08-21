"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES, routeBuilders } from "@/config/routes";

export function QuestionComplete() {
  const params = useSearchParams();
  const questionId = params.get("questionId");
  const returnTo = params.get("returnTo");
  return <div className="flex min-h-[calc(100dvh-76px)] items-center px-5 py-8"><section className="w-full rounded-card border border-border bg-surface p-6 text-center shadow-[var(--checkon-shadow-card)]"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8F6F1] text-[#26856B]"><CheckCircle2 size={36} /></span><h2 className="mt-4 text-xl font-extrabold">질문을 등록했어요</h2><p className="mt-2 text-sm leading-6 text-muted">선생님의 답변이 등록되면 알림으로 알려드릴게요.</p>{returnTo ? <Link href={returnTo} className="mt-6 flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold">문제 계속 풀기</Link> : null}<Link href={questionId ? routeBuilders.student.question(questionId) : ROUTES.student.questions} className={`flex h-[52px] items-center justify-center rounded-xl border border-[#BFDDF0] text-sm font-bold text-action ${returnTo ? "mt-2" : "mt-6"}`}>등록한 질문 보기</Link></section></div>;
}
