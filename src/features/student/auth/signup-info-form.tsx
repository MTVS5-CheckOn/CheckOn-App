"use client";

import { Eye, EyeOff, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { FormField } from "@/components/ui/form-field";
import { SignupStepper } from "@/components/ui/signup-stepper";
import { ROUTES } from "@/config/routes";
import { studentSignupSchema, type StudentSignupValues } from "@/features/student/auth/schema";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useSignupDraftStore } from "@/features/student/auth/signup-draft.store";
import { useSignupMutation } from "@/features/auth/mutations";

const GRADES = ["고1", "고2", "고3", "N수생"] as const;

export function SignupInfoForm() {
  const router = useRouter();
  const completeSignup = useStudentAuthStore((state) => state.completeSignup);
  const clearSignupDraft = useSignupDraftStore((state) => state.clear);
  const signupMutation = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, control, setValue, setError, formState: { errors, isSubmitting } } = useForm<StudentSignupValues>({ mode: "onChange" });
  const values = useWatch({ control });
  const selectedGrade = values.grade;
  const canSubmit = Boolean((values.name?.trim().length ?? 0) >= 2 && values.grade && (values.password?.length ?? 0) >= 6 && values.password === values.passwordConfirm);

  const onSubmit = handleSubmit(async (values) => {
    const result = studentSignupSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "name" || field === "grade" || field === "password" || field === "passwordConfirm") setError(field, { message: issue.message });
      });
      return;
    }
    try { await signupMutation.mutateAsync({ role: "student", name: result.data.name, grade: result.data.grade, password: result.data.password }); completeSignup({ name: result.data.name, grade: result.data.grade }); clearSignupDraft(); router.push(ROUTES.auth.studentSignupComplete); } catch { setError("root", { message: "회원가입을 완료하지 못했습니다. 다시 시도해 주세요." }); }
  });

  return (
    <form onSubmit={onSubmit} className="flex min-h-dvh flex-col bg-app">
      <AuthAppBar title="학생 회원가입 · 정보" backHref={ROUTES.auth.studentSignupTerms} />
      <SignupStepper current={2} />
      <main className="flex-1 space-y-4 px-5 py-4">
        <FormField label="이름" placeholder="이름을 입력하세요" error={errors.name?.message} {...register("name")} />
        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">학년</legend>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((grade) => <button key={grade} type="button" onClick={() => setValue("grade", grade, { shouldValidate: true })} className={`h-11 rounded-xl border text-sm font-semibold ${selectedGrade === grade ? "border-brand bg-[#FFF0E5] text-[#B5572D]" : "border-border bg-surface text-muted"}`}>{grade}</button>)}
          </div>
          {errors.grade ? <p className="mt-1.5 text-xs text-[#D64545]">{errors.grade.message}</p> : null}
        </fieldset>
        <FormField label="비밀번호" type={showPassword ? "text" : "password"} placeholder="6자 이상 입력" error={errors.password?.message} trailing={<button type="button" className="grid size-8 place-items-center text-subtle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} {...register("password")} />
        <FormField label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력하세요" error={errors.passwordConfirm?.message} {...register("passwordConfirm")} />
        <div className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted"><Info className="mt-0.5 shrink-0 text-[#6EB5E9]" size={16} />학생 ID는 가입 완료 후 자동 발급됩니다.</div>
      </main>
      <div className="border-t border-divider bg-surface px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3">{errors.root?.message ? <p className="mb-2 text-center text-xs font-semibold text-[#D64545]">{errors.root.message}</p> : null}<ActionButton type="submit" disabled={!canSubmit || isSubmitting || signupMutation.isPending}>{signupMutation.isPending ? "가입 처리 중..." : "가입 완료"}</ActionButton></div>
    </form>
  );
}
