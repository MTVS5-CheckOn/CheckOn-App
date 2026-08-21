"use client";

import { CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { SignupStepper } from "@/components/ui/signup-stepper";
import { ROUTES } from "@/config/routes";
import { StudentIdCard } from "@/features/student/auth/student-id-card";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";

export function SignupComplete() {
  const router = useRouter();
  const studentId = useStudentAuthStore((state) => state.studentId);
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <AuthAppBar title="학생 회원가입 · 완료" />
      <SignupStepper current={3} />
      <main className="flex-1 px-5 py-10 text-center">
        <CheckCircle2 className="mx-auto text-[#2F9075]" size={64} strokeWidth={1.6} />
        <h2 className="mb-5 mt-4 text-[22px] font-extrabold">학생 가입이 완료됐어요!</h2>
        <StudentIdCard studentId={studentId} />
        <div className="mt-5 flex items-start gap-2 rounded-card border border-border bg-surface p-4 text-left text-sm leading-6 text-muted"><Info className="mt-1 shrink-0 text-[#6EB5E9]" size={17} />아직 학습 기능은 잠겨 있어요. 학부모 앱에서 이 학생 ID로 자녀 등록을 완료하면 학습이 시작됩니다.</div>
      </main>
      <div className="border-t border-divider bg-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3"><ActionButton onClick={() => router.push(ROUTES.auth.studentActivationPending)}>학생 ID 확인했어요</ActionButton></div>
    </div>
  );
}
