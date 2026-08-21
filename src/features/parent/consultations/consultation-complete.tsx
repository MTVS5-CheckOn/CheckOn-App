"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useParentConsultationQuery } from "@/features/parent/api/queries";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ConsultationComplete() {
  const consultationId = useSearchParams().get("consultationId") ?? "";
  const child = useSelectedChild();
  const { data: consultation } = useParentConsultationQuery(child?.studentId ?? "", consultationId);
  return <div className="flex min-h-[calc(100dvh-76px)] flex-col px-5 pb-5"><div className="flex flex-1 flex-col items-center justify-center py-10 text-center"><span className="grid size-16 place-items-center rounded-full bg-[#E8F6F1] text-[#26856B]"><Check size={34} strokeWidth={2.5} /></span><h2 className="mt-5 text-xl font-bold">상담 요청이 전달됐어요</h2><p className="mt-2 text-sm leading-6 text-muted">담당 선생님이 확인한 후<br />앱으로 답변해 드릴게요.</p>{consultation ? <section className="mt-7 w-full rounded-card border border-border bg-surface p-4 text-left"><dl className="space-y-3 text-sm"><Row label="자녀" value={consultation.childName} /><Row label="답변 방식" value="앱으로 답변" /><Row label="요청 일시" value={consultation.createdAt} /></dl></section> : null}</div><div className="space-y-2"><Link href={consultationId ? routeBuilders.parent.consultation(consultationId) : ROUTES.parent.consultations} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-bold text-[#4C3024]">상담 내역 보기</Link><Link href={ROUTES.parent.home} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-[15px] font-bold text-[#2F6FA7]">홈으로</Link></div></div>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3"><dt className="text-muted">{label}</dt><dd className="ml-auto text-right font-semibold">{value}</dd></div>; }
