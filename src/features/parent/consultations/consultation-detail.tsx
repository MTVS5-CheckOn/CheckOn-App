"use client";

import { MessageCircle, XCircle } from "lucide-react";
import { useParentConsultationQuery } from "@/features/parent/api/queries";
import { consultationCancellationSupported } from "@/lib/api/endpoints";
import { ConsultationContextCard, ConsultationStatusChip } from "@/features/parent/consultations/consultation-ui";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ConsultationDetail({ consultationId }: { consultationId: string }) {
  const child = useSelectedChild();
  const { data: consultation, isLoading, isError, refetch } = useParentConsultationQuery(child?.studentId ?? "", consultationId);
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-32 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-48 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">상담 내역을 불러오지 못했어요.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!consultation) return <div className="p-8 text-center text-sm text-muted">상담 내역을 찾을 수 없습니다.</div>;
  const pending = consultation.status === "submitted" || consultation.status === "reviewing";
  const teacherMessages = consultation.messages.filter((message) => message.authorRole === "teacher");

  return <div className="space-y-4 px-5 py-5">
    <section className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4"><div><p className="text-sm font-bold">{consultation.childName} 학생 상담</p><p className="mt-1 text-xs text-muted">{consultation.teacherName} · 앱 답변</p></div><ConsultationStatusChip status={consultation.status} /></section>
    {/* 🔴 강사가 답해야 채워진다. status WAITING/SUBMITTED 에 messages: [] 는 정상이고 오류가 아니다. */}
    {teacherMessages.length > 0
      ? <section><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-[#E8F6F1] text-[#26856B]"><MessageCircle size={16} /></span><h2 className="text-base font-bold">선생님 답변</h2></div><div className="mt-3 space-y-3">{teacherMessages.map((message) => <div key={message.id} className="rounded-card border border-[#BFE6D9] bg-[#F2FBF8] p-5 text-sm leading-6 shadow-[var(--checkon-shadow-card)]"><p className="whitespace-pre-wrap">{message.content}</p><div className="mt-4 border-t border-[#D7EEE7] pt-3"><p className="text-xs font-semibold text-[#4F7D70]">{consultation.teacherName}</p><p className="mt-0.5 text-[11px] text-[#6F9187]">{message.publishedAt}</p></div></div>)}</div></section>
      : <section className="rounded-card border border-border bg-surface px-5 py-10 text-center" role="status"><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#EEF4FF] text-action"><MessageCircle size={20} /></span><p className="mt-3 text-sm font-bold">{pending ? "선생님이 요청을 확인하고 있어요" : "아직 등록된 답변이 없어요"}</p><p className="mt-1 text-xs leading-5 text-muted">{pending ? "답변이 등록되면 알림으로 알려드립니다." : "선생님이 답변을 발행하면 이곳에 표시됩니다."}</p></section>}
    <section><h2 className="mb-2 text-sm font-bold">내가 보낸 상담 내용</h2><div className="rounded-card border border-border bg-surface p-5"><p className="whitespace-pre-wrap text-sm leading-6">{consultation.content}</p><p className="mt-3 text-[11px] text-subtle">{consultation.createdAt}</p></div></section>
    {consultation.context ? <ConsultationContextCard context={consultation.context} /> : null}
    {/*
      🔴 상담 취소는 백엔드 미구현이다 (MB-09 정책 미확정,
      ParentConsultationController.java:78 TODO). 계약에 경로는 있지만 컨트롤러가 열려 있지 않다.
      화면은 남기되 요청을 보내지 않는다 — 눌러서 실패하는 버튼보다 이유를 밝히는 편이 낫다.
    */}
    {consultation.status === "submitted" && !consultationCancellationSupported
      ? <p className="flex items-center justify-center gap-1.5 text-center text-xs text-subtle"><XCircle size={15} />상담 요청 취소는 준비 중입니다. 학원으로 문의해 주세요.</p>
      : null}
  </div>;
}
