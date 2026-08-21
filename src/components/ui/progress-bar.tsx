export function ProgressBar({ value, tone = "action" }: { value: number; tone?: "action" | "ink" }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return <div className="h-1.5 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}><div className={`h-full rounded-full ${tone === "action" ? "bg-action" : "bg-[#79523D]"}`} style={{ width: `${safeValue}%` }} /></div>;
}
