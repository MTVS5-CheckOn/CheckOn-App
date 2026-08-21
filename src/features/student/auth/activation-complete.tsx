"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { ROUTES } from "@/config/routes";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";

export function ActivationComplete() {
  const router = useRouter();
  const { name, grade } = useStudentAuthStore();
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <AuthAppBar title="계정 활성화 완료" />
      <main className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-[#EAF8F3] text-[#2F9075]"><CheckCircle2 size={44} strokeWidth={1.7} /></span>
        <h2 className="mt-6 text-2xl font-extrabold">이제 학습을 시작할 수 있어요!</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{name} · {grade}<br />학부모 자녀 등록이 완료되어 모든 학습 기능이 열렸습니다.</p>
        <ActionButton className="mt-8" onClick={() => router.replace(ROUTES.student.home)}>학생 홈으로 이동</ActionButton>
      </main>
    </div>
  );
}
