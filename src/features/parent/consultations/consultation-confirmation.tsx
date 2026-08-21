"use client";

import { Check, Info, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { useCreateConsultationMutation } from "@/features/parent/api/queries";
import { useParentConsultationStore } from "@/features/parent/consultations/consultation.store";
import { ConsultationContextCard } from "@/features/parent/consultations/consultation-ui";
import { useParentStore } from "@/features/parent/shared/parent.store";

export function ConsultationConfirmation() {
  const router = useRouter();
  const { draft, clearDraft } = useParentConsultationStore();
  const children = useParentStore((state) => state.children);
  const child = children.find((item) => item.studentId === draft?.studentId);
  const mutation = useCreateConsultationMutation(draft?.studentId ?? "");

  if (!draft) return <div className="px-5 py-12 text-center"><p className="text-sm font-bold">확인할 상담 내용이 없어요.</p><p className="mt-2 text-xs text-muted">상담 내용을 먼저 작성해 주세요.</p><Link href={routeBuilders.parent.newConsultation()} className="mt-5 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold">상담 작성하기</Link></div>;

  const submit = async () => {
    try {
      const consultation = await mutation.mutateAsync(draft);
      clearDraft();
      router.replace(routeBuilders.parent.consultationComplete(consultation.id));
    } catch { return; }
  };

  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]"><span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-[#9A4F2D]"><Check size={26} strokeWidth={2.5} /></span><h2 className="mt-3 text-lg font-bold">이 내용으로 상담을 요청할까요?</h2><p className="mt-2 text-xs leading-5 text-muted">요청 후에도 선생님이 확인하기 전에는<br />상담 내역에서 취소할 수 있어요.</p></section>
    {draft.context ? <ConsultationContextCard context={draft.context} /> : null}
    <section className="rounded-card border border-border bg-surface p-5"><dl className="space-y-4 text-sm"><Row label="자녀" value={`${child?.name ?? "자녀"} · ${child?.grade ?? ""}`} /><Row label="답변 방식" value="앱으로 답변" /></dl><div className="my-4 h-px bg-divider" /><p className="text-xs font-semibold text-muted">상담 내용</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{draft.content}</p></section>
    <div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#F5FAFE] p-3 text-xs leading-5 text-muted"><Info size={17} className="mt-0.5 shrink-0 text-action" /><p>담당 선생님이 요청 내용을 직접 확인하고 앱으로 답변합니다.</p></div>
    {mutation.isError ? <p className="text-center text-xs font-semibold text-[#D64545]">상담 요청을 전송하지 못했어요. 다시 시도해 주세요.</p> : null}
    <div className="grid grid-cols-[0.8fr_1.2fr] gap-2"><ActionButton type="button" variant="secondary" onClick={() => router.back()}>수정하기</ActionButton><ActionButton type="button" onClick={submit} disabled={mutation.isPending}><MessageCircle size={17} className="mr-1.5" />{mutation.isPending ? "전송 중..." : "상담 요청 보내기"}</ActionButton></div>
  </div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3"><dt className="text-muted">{label}</dt><dd className="ml-auto text-right font-semibold">{value}</dd></div>; }
