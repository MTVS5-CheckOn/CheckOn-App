import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <Card className="min-h-[89px] p-4"><p className="text-xs text-muted">{label}</p><p className={`mt-1 text-[22px] font-bold leading-[33px] ${emphasis ? "text-action" : "text-ink"}`}>{value}</p></Card>;
}
