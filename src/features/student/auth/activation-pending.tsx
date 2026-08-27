"use client";

import { Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { ROUTES } from "@/config/routes";
import { StudentIdCard } from "@/features/student/auth/student-id-card";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useStudentActivationQuery } from "@/features/auth/queries";
import { env } from "@/config/env";

const STEPS = [
  "학부모가 Check-On 앱에서 회원가입을 합니다.",
  "학부모 앱 → 내 정보 → 자녀 등록에서 학생 ID를 입력합니다.",
  "등록 완료 후 학생 계정이 자동으로 활성화됩니다.",
];

export function ActivationPending() {
  const router = useRouter();
  const { studentId, activateForPreview, reset } = useStudentAuthStore();
  const activationQuery = useStudentActivationQuery();
  useEffect(() => { if (activationQuery.data?.status === "ACTIVE") router.replace(ROUTES.auth.studentActivationComplete); }, [activationQuery.data?.status, router]);
  const logout = () => { reset(); router.push(ROUTES.auth.studentLogin); };
  return (
    <div className="min-h-dvh bg-app">
      <AuthAppBar title="Check-On" action={{ label: "로그아웃", onClick: logout }} />
      <main className="space-y-4 px-5 py-5">
        <section className="flex items-center gap-4 rounded-card border border-border bg-surface p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-action"><Clock3 size={25} /></span>
          <div><h2 className="font-bold">계정 활성화 대기 중</h2><p className="mt-1 text-sm text-muted">학부모님의 자녀 등록을 기다리고 있어요.</p></div>
        </section>
        <StudentIdCard studentId={activationQuery.data?.studentPublicId ?? studentId} />
        <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
          <h2 className="mb-4 font-bold">자녀 등록 방법</h2>
          <ol className="space-y-4">{STEPS.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold">{index + 1}</span><span>{step}</span></li>)}</ol>
        </section>
        {activationQuery.isError ? <div className="rounded-xl border border-[#FFCBC6] bg-[#FFF5F4] p-3 text-xs text-[#D64545]">활성화 상태를 확인하지 못했어요. <button onClick={() => activationQuery.refetch()} className="font-bold underline">다시 확인</button></div> : null}
        {env.dataSource === "mock" ? <ActionButton variant="ghost" onClick={() => { activateForPreview(); activationQuery.refetch(); }}>(미리보기) 활성화 완료</ActionButton> : null}
      </main>
    </div>
  );
}
