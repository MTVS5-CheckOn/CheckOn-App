"use client";

import { Info, Send } from "lucide-react";
import { useState } from "react";
import { useFollowUpMutation, useQuestionQuery } from "@/features/student/questions/queries";

export function QuestionDetail({ questionId }: { questionId: string }) {
  const { data: question, isLoading, isError, refetch } = useQuestionQuery(questionId);
  const followUpMutation = useFollowUpMutation(questionId);
  const [followUp, setFollowUp] = useState("");
  const [sent, setSent] = useState(false);
  if (isLoading) return <div className="p-5"><div className="h-60 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">질문을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!question) return <div className="p-8 text-center text-sm text-muted">질문을 찾을 수 없습니다.</div>;
  const send = async () => { const content = followUp.trim(); if (content.length < 5) return; try { await followUpMutation.mutateAsync(content); setFollowUp(""); setSent(true); } catch { return; } };
  const teacherMessages = question.messages.filter((message) => message.authorRole === "teacher");
  const studentMessages = question.messages.filter((message) => message.authorRole === "student");
  return <div className="space-y-4 px-5 py-5">
    <p className="text-xs text-subtle">{question.worksheetTitle} · {question.questionNumber}번</p>
    <section><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-action">내 질문</h2><time className="text-xs text-subtle">{question.createdAt}</time></div><div className="mt-2 rounded-card border border-border bg-surface p-4 text-sm leading-6 shadow-[var(--checkon-shadow-card)]">{question.content}</div></section>
    {/* 🔴 강사가 답해야 채워진다. status WAITING 에 messages: [] 는 정상이고 오류가 아니다. */}
    {teacherMessages.length > 0
      ? teacherMessages.map((message) => <section key={message.id}><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-[#26856B]">선생님 답변</h2><time className="text-xs text-subtle">{message.publishedAt}</time></div><div className="mt-2 rounded-card border border-[#BFE6D9] bg-[#F2FBF8] p-4 text-sm leading-6">{message.content}</div></section>)
      : <div className="flex gap-2 rounded-card border border-border bg-surface p-4 text-xs leading-5 text-muted" role="status"><Info size={17} className="shrink-0 text-[#6EB5E9]" />선생님이 답변 준비 중이에요. 답변이 완료되면 알림으로 알려드립니다.</div>}
    {studentMessages.map((message) => <section key={message.id}><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-action">추가 질문</h2><time className="text-xs text-subtle">{message.publishedAt}</time></div><div className="mt-2 rounded-card border border-border bg-surface p-4 text-sm leading-6">{message.content}</div></section>)}
    {teacherMessages.length > 0 ? <section className="rounded-card border border-border bg-surface p-4"><label htmlFor="follow-up" className="text-sm font-bold">답변에 추가로 질문하기</label><textarea id="follow-up" value={followUp} onChange={(event) => { setSent(false); setFollowUp(event.target.value.slice(0, 300)); }} placeholder="궁금한 내용을 추가로 적어주세요." className="mt-3 h-24 w-full resize-none rounded-xl border border-border p-3 text-sm outline-none focus:border-action" /><div className="mt-2 flex items-center justify-between"><span className="text-xs text-subtle">{followUpMutation.isError ? "전송하지 못했습니다. 다시 시도해 주세요." : sent ? "추가 질문을 전송했어요." : `${followUp.length}/300`}</span><button onClick={send} disabled={followUp.trim().length < 5 || followUpMutation.isPending} className="inline-flex h-9 items-center gap-1 rounded-lg bg-action px-3 text-xs font-semibold text-white disabled:bg-[#E5E9EF] disabled:text-subtle"><Send size={15} />{followUpMutation.isPending ? "전송 중" : "보내기"}</button></div></section> : null}
  </div>;
}
