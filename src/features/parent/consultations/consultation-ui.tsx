import { BarChart3, ClipboardList, FileText } from "lucide-react";
import type { ConsultationContext, ConsultationStatus } from "@/features/parent/consultations/types";
import { consultationStatusLabel } from "@/features/parent/consultations/types";

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  submitted: "bg-[#FFF0EE] text-[#D85B31]",
  reviewing: "bg-[#FFF8D8] text-[#846800]",
  answered: "bg-[#E8F6F1] text-[#26856B]",
  closed: "bg-[#EEF4FF] text-action",
  cancelled: "bg-app text-muted",
};

export function ConsultationStatusChip({ status }: { status: ConsultationStatus }) {
  return <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>{consultationStatusLabel(status)}</span>;
}

export function ConsultationContextCard({ context, removable, onRemove }: { context: ConsultationContext; removable?: boolean; onRemove?: () => void }) {
  const Icon = context.type === "record" ? ClipboardList : context.type === "analysis" ? BarChart3 : FileText;
  return <section className="rounded-card border border-[#BFDDF0] bg-[#F5FAFE] p-4">
    <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-info-soft text-action"><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-action">관련 학습 자료</p><h3 className="mt-1 text-sm font-bold">{context.label}</h3>{context.detail ? <p className="mt-1 text-xs leading-5 text-muted">{context.detail}</p> : null}</div>{removable ? <button type="button" onClick={onRemove} className="min-h-9 shrink-0 text-xs font-semibold text-muted">삭제</button> : null}</div>
  </section>;
}
