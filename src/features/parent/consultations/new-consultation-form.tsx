"use client";

import { Info, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { useParentConsultationStore } from "@/features/parent/consultations/consultation.store";
import { ConsultationContextCard } from "@/features/parent/consultations/consultation-ui";
import type { ConsultationContext, ConsultationDraft } from "@/features/parent/consultations/types";
import { useParentStore, useSelectedChild } from "@/features/parent/shared/parent.store";

const formSchema = z.object({
  studentId: z.string().min(1, "자녀를 선택해 주세요."),
  /**
   * 🔴 계약 CreateConsultationRequest 의 required 필드다.
   * 화면이 수집하지 않으면 400 이 된다 — 임의로 첫 강사를 넣지 않고 학부모가 고르게 한다.
   */
  teacherId: z.string().min(1, "담당 선생님을 선택해 주세요."),
  content: z.string().trim().min(10, "상담 내용을 10자 이상 입력해 주세요.").max(2000, "상담 내용은 2,000자까지 입력할 수 있어요."),
});
type FormValues = z.infer<typeof formSchema>;

function contextFromSearch(searchParams: ReturnType<typeof useSearchParams>): ConsultationContext | undefined {
  const type = searchParams.get("contextType");
  const id = searchParams.get("contextId");
  const label = searchParams.get("contextLabel");
  if ((type !== "record" && type !== "analysis" && type !== "report") || !id || !label) return undefined;
  return { type, id, label, detail: searchParams.get("contextDetail") ?? undefined };
}

export function NewConsultationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChild = useSelectedChild();
  const { children, teachers } = useParentStore();
  const { draft, setDraft } = useParentConsultationStore();
  const [context, setContext] = useState<ConsultationContext | undefined>(() => contextFromSearch(searchParams) ?? draft?.context);
  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: { studentId: draft?.studentId ?? selectedChild?.studentId ?? "", teacherId: draft?.teacherId ?? "", content: draft?.content ?? "" },
  });
  const content = useWatch({ control, name: "content" }) ?? "";

  const submit = (values: FormValues) => {
    const result = formSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => setError(issue.path[0] as keyof FormValues, { message: issue.message }));
      return;
    }
    const nextDraft: ConsultationDraft = { ...result.data, context };
    setDraft(nextDraft);
    router.push(routeBuilders.parent.confirmConsultation());
  };

  return <form onSubmit={handleSubmit(submit)} className="space-y-4 px-5 py-5">
    {context ? <ConsultationContextCard context={context} removable onRemove={() => setContext(undefined)} /> : null}
    <section className="rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]">
      <label className="text-sm font-bold">상담할 자녀<select {...register("studentId")} className="mt-2 h-[52px] w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-action">{children.map((child) => <option key={child.id} value={child.studentId}>{child.name} · {child.grade}</option>)}</select></label>
      {errors.studentId ? <p className="mt-1.5 text-xs text-[#D64545]">{errors.studentId.message}</p> : null}
      <label className="mt-4 block text-sm font-bold">담당 선생님<select {...register("teacherId")} className="mt-2 h-[52px] w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-action"><option value="">선생님을 선택하세요</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>
      {/* 🔴 등록된 선생님이 없으면 상담을 만들 수 없다. 임의 기본값을 넣지 않고 안내한다. */}
      {teachers.length === 0 ? <p className="mt-1.5 text-xs text-muted">등록된 선생님이 없어요. 내 정보에서 초대 코드를 먼저 등록해 주세요.</p> : null}
      {errors.teacherId ? <p className="mt-1.5 text-xs text-[#D64545]">{errors.teacherId.message}</p> : null}
    </section>
    <section className="rounded-card border border-border bg-surface p-4"><label htmlFor="consultation-content" className="text-sm font-bold">상담 내용</label><textarea id="consultation-content" {...register("content")} maxLength={2000} placeholder="자녀의 학습 상황과 궁금한 점을 자세히 적어주세요." className={`mt-3 h-44 w-full resize-none rounded-xl border p-3 text-sm leading-6 outline-none focus:border-action ${errors.content ? "border-[#E85A4F]" : "border-border"}`} /><div className="mt-1 flex justify-between gap-3"><span className="text-xs text-[#D64545]">{errors.content?.message}</span><span className="ml-auto text-xs text-subtle">{content.length}/2,000</span></div></section>
    <section className="rounded-card border border-border bg-surface p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-info-soft text-action"><MessageCircle size={18} /></span><div><p className="text-sm font-bold">앱으로 답변받기</p><p className="mt-0.5 text-xs text-muted">선생님 답변이 등록되면 알림으로 알려드려요.</p></div></div></section>
    <div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#F5FAFE] p-3 text-xs leading-5 text-muted"><Info size={17} className="mt-0.5 shrink-0 text-action" /><p>상담 내용은 접수 후 자동 분류되어 담당 선생님께 전달됩니다. 긴급한 내용은 학원으로 직접 연락해 주세요.</p></div>
    <ActionButton type="submit">입력 내용 확인하기</ActionButton>
  </form>;
}
