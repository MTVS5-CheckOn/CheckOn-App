import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section">;
export function Card({ className = "", ...props }: CardProps) {
  return <section className={`rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)] ${className}`} {...props} />;
}
