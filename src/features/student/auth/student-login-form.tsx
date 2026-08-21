"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { ActionLink } from "@/components/ui/action-link";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/config/routes";
import { studentLoginSchema, type StudentLoginValues } from "@/features/student/auth/schema";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useLoginMutation } from "@/features/auth/mutations";

export function StudentLoginForm() {
  const router = useRouter();
  const status = useStudentAuthStore((state) => state.status);
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isValid } } = useForm<StudentLoginValues>({ mode: "onChange" });

  const onSubmit = handleSubmit(async (values) => {
    const result = studentLoginSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "studentId" || field === "password") setError(field, { message: issue.message });
      });
      return;
    }
    try { const session = await loginMutation.mutateAsync({ role: "student", loginId: result.data.studentId, password: result.data.password }); router.push(session.accountStatus === "active" && status === "active" ? ROUTES.student.home : ROUTES.auth.studentActivationPending); } catch { setError("root", { message: "로그인에 실패했습니다. 입력 정보를 확인해 주세요." }); }
  });

  return (
    <div className="min-h-dvh bg-app">
      <AuthAppBar title="로그인" action={{ label: "도움말" }} />
      <main className="space-y-3 px-5 py-5">
        <section className="relative overflow-hidden rounded-2xl bg-brand p-5 text-[#4C3024]">
          <span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/25" aria-hidden />
          <p className="text-[11px] font-bold tracking-[0.08em]">STUDENT LOGIN</p>
          <h2 className="mt-2 text-[22px] font-extrabold">다시 만나서 반가워요</h2>
          <p className="mt-1 text-sm leading-6 text-[#694838]">학생 ID로 로그인하세요. 활성 계정은 바로 학습이 시작됩니다.</p>
        </section>
        <form onSubmit={onSubmit} className="space-y-3 rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]">
          <h3 className="mb-4 text-base font-bold">학생 로그인</h3>
          <FormField label="학생 ID" placeholder="STU-XXXX 또는 계정 ID" error={errors.studentId?.message} {...register("studentId")} />
          <FormField
            label="비밀번호"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            error={errors.password?.message}
            trailing={<button type="button" className="grid size-8 place-items-center text-subtle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            {...register("password")}
          />
          {errors.root?.message ? <p className="text-xs font-semibold text-[#D64545]">{errors.root.message}</p> : null}<ActionButton type="submit" disabled={!isValid || isSubmitting || loginMutation.isPending}>{loginMutation.isPending ? "로그인 중..." : "로그인"}</ActionButton>
          <ActionLink href={ROUTES.auth.studentSignupTerms} variant="secondary">학생 회원가입</ActionLink>
          <p className="pt-1 text-center text-xs text-subtle">학생 ID 찾기 · 비밀번호 재설정</p>
        </form>
      </main>
    </div>
  );
}
