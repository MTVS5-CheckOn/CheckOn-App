import Image from "next/image";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionLink } from "@/components/ui/action-link";
import { ROUTES } from "@/config/routes";

export function StudentOnboarding() {
  return (
    <div className="min-h-dvh bg-app">
      <AuthAppBar title="학생 앱 시작" action={{ label: "건너뛰기", href: ROUTES.auth.studentLogin }} />
      <main className="space-y-5 px-5 py-5">
        <section className="relative min-h-[244px] overflow-hidden rounded-2xl bg-brand p-5 text-[#4C3024]">
          <span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/25" aria-hidden />
          <Image src="/brand/logo-graphic.svg" alt="Check-On 캐릭터 로고" width={72} height={46} priority />
          <p className="mt-4 text-[11px] font-bold tracking-[0.08em]">CHECK-ON STUDENT</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.3] tracking-[-0.5px]">풀고, 질문하고,<br />내 약점을 채워요</h2>
          <p className="mt-2 text-sm leading-6 text-[#694838]">학생 가입 후 학부모가 자녀 등록을 완료하면 학습이 열립니다.</p>
        </section>
        <div className="space-y-2">
          <ActionLink href={ROUTES.auth.studentLogin}>로그인</ActionLink>
          <ActionLink href={ROUTES.auth.studentSignupTerms} variant="secondary">학생 회원가입</ActionLink>
        </div>
      </main>
    </div>
  );
}
