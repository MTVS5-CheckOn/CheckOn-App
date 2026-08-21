"use client";

import { Info, MessageCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useCancelConsultationMutation, useParentConsultationQuery } from "@/features/parent/api/queries";
import { ConsultationContextCard, ConsultationStatusChip } from "@/features/parent/consultations/consultation-ui";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ConsultationDetail({ consultationId }: { consultationId: string }) {
  const child = useSelectedChild();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: consultation, isLoading, isError, refetch } = useParentConsultationQuery(child?.studentId ?? "", consultationId);
  const cancelMutation = useCancelConsultationMutation(child?.studentId ?? "", consultationId);
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-32 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-48 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">상담 내역을 불러오지 못했어요.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!consultation) return <div className="p-8 text-center text-sm text-muted">상담 내역을 찾을 수 없습니다.</div>;
  const pending = consultation.status === "submitted" || consultation.status === "reviewing";

  return <div className="space-y-4 px-5 py-5">
    <section className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4"><div><p className="text-sm font-bold">{consultation.childName} 학생 상담</p><p className="mt-1 text-xs text-muted">{consultation.teacherName} · 앱 답변</p></div><ConsultationStatusChip status={consultation.status} /></section>
    {consultation.teacherAnswer ? <section><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-[#E8F6F1] text-[#26856B]"><MessageCircle size={16} /></span><h2 className="text-base font-bold">선생님 답변</h2></div><div className="mt-3 rounded-card border border-[#BFE6D9] bg-[#F2FBF8] p-5 text-sm leading-6 shadow-[var(--checkon-shadow-card)]"><p className="whitespace-pre-wrap">{consultation.teacherAnswer}</p><div className="mt-4 border-t border-[#D7EEE7] pt-3"><p className="text-xs font-semibold text-[#4F7D70]">{consultation.teacherName}</p><p className="mt-0.5 text-[11px] text-[#6F9187]">{consultation.answeredAt}</p></div></div></section> : pending ? <div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#F5FAFE] p-3 text-xs leading-5 text-muted"><Info size={17} className="mt-0.5 shrink-0 text-action" /><p>선생님이 요청을 확인하고 있어요. 답변이 등록되면 알림으로 알려드립니다.</p></div> : null}
    <section><h2 className="mb-2 text-sm font-bold">내가 보낸 상담 내용</h2><div className="rounded-card border border-border bg-surface p-5"><p className="whitespace-pre-wrap text-sm leading-6">{consultation.content}</p><p className="mt-3 text-[11px] text-subtle">{consultation.createdAt}</p></div></section>
    {consultation.context ? <ConsultationContextCard context={consultation.context} /> : null}
    {consultation.status === "submitted" ? <section>{cancelOpen ? <div className="rounded-card border border-[#FFD1CB] bg-[#FFF8F7] p-4"><p className="text-sm font-bold">상담 요청을 취소할까요?</p><p className="mt-1 text-xs text-muted">취소한 요청은 다시 되돌릴 수 없어요.</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setCancelOpen(false)} className="h-10 rounded-xl border border-border bg-surface text-sm font-semibold">계속 유지</button><button type="button" disabled={cancelMutation.isPending} onClick={async () => { try { await cancelMutation.mutateAsync(); setCancelOpen(false); } catch { return; } }} className="h-10 rounded-xl bg-[#E85A4F] text-sm font-semibold text-white">{cancelMutation.isPending ? "취소 중" : "요청 취소"}</button></div></div> : <button type="button" onClick={() => setCancelOpen(true)} className="mx-auto flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted"><XCircle size={17} />상담 요청 취소</button>}</section> : null}
  </div>;
}
