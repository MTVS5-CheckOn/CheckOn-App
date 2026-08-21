"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { SignupStepper } from "@/components/ui/signup-stepper";
import { ROUTES } from "@/config/routes";

type TermKey = "service" | "privacy" | "notification";
const TERMS: { key: TermKey; label: string; required: boolean }[] = [
  { key: "service", label: "[필수] 서비스 이용약관", required: true },
  { key: "privacy", label: "[필수] 개인정보 수집·이용 동의", required: true },
  { key: "notification", label: "[선택] 학습 알림 수신 동의", required: false },
];

export function SignupTerms() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<TermKey, boolean>>({ service: false, privacy: false, notification: false });
  const requiredChecked = checked.service && checked.privacy;
  const allChecked = Object.values(checked).every(Boolean);
  const setAll = () => setChecked({ service: !allChecked, privacy: !allChecked, notification: !allChecked });

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <AuthAppBar title="학생 회원가입 · 약관" action={{ label: "닫기", href: ROUTES.auth.studentLogin }} />
      <SignupStepper current={1} />
      <main className="flex-1 px-5 py-4">
        <section className="rounded-card border border-border bg-surface px-4 shadow-[var(--checkon-shadow-card)]">
          <h2 className="py-4 text-base font-bold">서비스 이용 동의</h2>
          <TermRow checked={requiredChecked} label="필수 약관에 모두 동의합니다" onChange={() => setChecked((value) => ({ ...value, service: !requiredChecked, privacy: !requiredChecked }))} />
          {TERMS.map((term) => <TermRow key={term.key} checked={checked[term.key]} label={term.label} onChange={() => setChecked((value) => ({ ...value, [term.key]: !value[term.key] }))} />)}
          <button type="button" onClick={setAll} className="mb-4 text-xs text-action">{allChecked ? "전체 동의 해제" : "선택 항목까지 전체 동의"}</button>
        </section>
      </main>
      <div className="border-t border-divider bg-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3">
        <ActionButton disabled={!requiredChecked} onClick={() => router.push(ROUTES.auth.studentSignupInfo)}>동의하고 다음</ActionButton>
      </div>
    </div>
  );
}

function TermRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 border-t border-divider first:border-t-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${checked ? "bg-brand" : "bg-[#F0F2F5] text-subtle"}`} aria-hidden>{checked ? <Check size={16} strokeWidth={3} /> : <span className="size-3.5 rounded-full border border-[#C5CEDA]" />}</span>
      <span className="text-sm text-muted">{label}</span>
    </label>
  );
}
