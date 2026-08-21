import type { ComponentPropsWithoutRef } from "react";

type BadgeTone = "neutral" | "warning" | "info" | "danger";
const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-app text-muted", warning: "bg-warning-soft text-[#92720A]",
  info: "bg-[#EEF4FF] text-action", danger: "bg-[#FEEDEC] text-[#D64545]",
};
export function Badge({ className = "", tone = "neutral", ...props }: ComponentPropsWithoutRef<"span"> & { tone?: BadgeTone }) {
  return <span className={`inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold ${toneClass[tone]} ${className}`} {...props} />;
}
