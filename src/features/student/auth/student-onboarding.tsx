"use client";

import Image from "next/image";
import { AuthAppBar } from "@/components/layout/auth-app-bar";
import { ActionButton } from "@/components/ui/action-button";
import { ActionLink } from "@/components/ui/action-link";
import { ROUTES } from "@/config/routes";
import { useOnboardingStore } from "@/features/student/auth/onboarding.store";

const SLIDES = [
  { eyebrow: "CHECK-ON STUDENT", title: <>풀고, 질문하고,<br />내 약점을 채워요</>, description: "학생 가입 후 학부모가 자녀 등록을 완료하면 학습이 열립니다." },
  { eyebrow: "PERSONAL WORKSHEET", title: <>내 약점에 맞춘<br />학습지를 풀어요</>, description: "문항별 풀이 시간과 답안을 기록해 취약한 국어 영역을 찾아드려요." },
  { eyebrow: "ASK & REVIEW", title: <>질문하고 해설을 보며<br />확실하게 복습해요</>, description: "풀이 중 선생님께 질문하고 채점 후 정답과 오답 해설을 모두 확인할 수 있어요." },
] as const;

export function StudentOnboarding() {
  const current = Math.min(useOnboardingStore((state) => state.currentStep), SLIDES.length - 1);
  const setCurrent = useOnboardingStore((state) => state.setCurrentStep);
  const slide = SLIDES[current];
  const last = current === SLIDES.length - 1;
  return (
    <div className="min-h-dvh bg-app">
      <AuthAppBar title="학생 앱 시작" action={{ label: "건너뛰기", href: ROUTES.auth.studentLogin }} />
      <main className="space-y-5 px-5 py-5">
        <section className="relative min-h-[286px] overflow-hidden rounded-2xl bg-brand p-5 text-[#4C3024]" aria-live="polite">
          <span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/25" aria-hidden />
          <Image src="/brand/logo-graphic.svg" alt="Check-On 캐릭터 로고" width={72} height={46} priority />
          <p className="mt-4 text-[11px] font-bold tracking-[0.08em]">{slide.eyebrow}</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.3] tracking-[-0.5px]">{slide.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#694838]">{slide.description}</p>
        </section>
        <div className="flex justify-center gap-2" aria-label={`온보딩 ${current + 1}/${SLIDES.length}`}>{SLIDES.map((_, index) => <button key={index} onClick={() => setCurrent(index)} aria-label={`${index + 1}번째 안내`} aria-current={current === index ? "step" : undefined} className={`h-2 rounded-full transition-[width,background-color] ${current === index ? "w-7 bg-[#D96534]" : "w-2 bg-[#D8DEE7]"}`} />)}</div>
        {last ? <div className="space-y-2"><ActionLink href={ROUTES.auth.studentLogin}>로그인</ActionLink><ActionLink href={ROUTES.auth.studentSignupTerms} variant="secondary">학생 회원가입</ActionLink></div> : <div className="grid grid-cols-2 gap-2"><ActionButton variant="ghost" disabled={current === 0} onClick={() => setCurrent(Math.max(0, current - 1))}>이전</ActionButton><ActionButton onClick={() => setCurrent(Math.min(SLIDES.length - 1, current + 1))}>다음</ActionButton></div>}
      </main>
    </div>
  );
}
