"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function StudentIdCard({ studentId }: { studentId: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(studentId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="rounded-card border border-border bg-surface p-5 text-center shadow-[var(--checkon-shadow-card)]">
      <p className="text-xs text-muted">내 학생 ID</p>
      <strong className="mt-3 block text-[28px] font-extrabold tracking-[0.12em]">{studentId}</strong>
      <button type="button" onClick={copy} className="mx-auto mt-3 flex h-10 items-center gap-1.5 rounded-full border border-action px-4 text-sm font-semibold text-action">
        {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "복사했어요" : "ID 복사하기"}
      </button>
    </section>
  );
}
