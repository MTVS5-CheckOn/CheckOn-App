"use client";

import { Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { useCreateQuestionMutation } from "@/features/student/questions/queries";
import { useWorksheetsQuery } from "@/features/student/worksheets/queries";

export function NewQuestionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: worksheets = [], isLoading, isError, refetch } = useWorksheetsQuery();
  const initialWorksheetId = searchParams.get("worksheetId") ?? worksheets[0]?.id ?? "";
  const [worksheetId, setWorksheetId] = useState(initialWorksheetId);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [content, setContent] = useState("");
  const mutation = useCreateQuestionMutation();
  const worksheet = useMemo(() => worksheets.find((item) => item.id === worksheetId) ?? worksheets[0], [worksheetId, worksheets]);
  if (isLoading) return <div className="p-5"><div className="h-72 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !worksheet) return <div className="p-8 text-center"><p className="text-sm font-bold">학습지 정보를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const submit = async () => { const value = content.trim(); if (value.length < 5) return; try { const question = await mutation.mutateAsync({ worksheetId: worksheet.id, worksheetTitle: worksheet.title, questionNumber, title: `${questionNumber}번 문항 질문`, content: value }); router.replace(routeBuilders.student.questionComplete(question.id)); } catch { return; } };
  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><label className="text-sm font-bold">질문할 학습지<select value={worksheet.id} onChange={(event) => setWorksheetId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-action">{worksheets.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="mt-4 block text-sm font-bold">문항 번호<select value={questionNumber} onChange={(event) => setQuestionNumber(Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-action">{Array.from({ length: worksheet.questionCount }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}번</option>)}</select></label></section>
    <section className="rounded-card border border-border bg-surface p-4"><label htmlFor="new-question" className="text-sm font-bold">궁금한 점</label><textarea id="new-question" value={content} onChange={(event) => setContent(event.target.value.slice(0, 500))} placeholder="궁금한 점을 자세히 적어주세요. 선생님께 전달됩니다." className="mt-3 h-40 w-full resize-none rounded-xl border border-border p-3 text-sm leading-6 outline-none focus:border-action" /><p className="mt-1 text-right text-xs text-subtle">{content.length}/500</p></section>
    <div className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted"><Info size={16} className="shrink-0 text-[#6EB5E9]" />질문은 담당 강사 선생님께 직접 전달됩니다.</div>
    {mutation.isError ? <p className="text-xs font-semibold text-[#D64545]">질문을 전송하지 못했습니다. 다시 시도해 주세요.</p> : null}<ActionButton disabled={content.trim().length < 5 || mutation.isPending} onClick={submit}>{mutation.isPending ? "질문 전송 중..." : "선생님께 질문 보내기"}</ActionButton>
  </div>;
}
