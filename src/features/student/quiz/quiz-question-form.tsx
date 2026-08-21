"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { routeBuilders } from "@/config/routes";
import { quizQuestionFixtures } from "@/features/student/quiz/mock-data";
import { useQuizSessionStore } from "@/stores/quiz-session.store";

export function QuizQuestionForm({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const { currentIndex, pauseForQuestion, resume } = useQuizSessionStore();
  const [content, setContent] = useState("");
  const question = quizQuestionFixtures[currentIndex] ?? quizQuestionFixtures[0];

  useEffect(() => { pauseForQuestion(); return () => resume(); }, [pauseForQuestion, resume]);
  const submit = () => { if (content.trim().length < 5) return; router.push(routeBuilders.student.solveWorksheet(worksheetId)); };

  return (
    <div className="px-5 py-5">
      <p className="rounded-xl border border-brand bg-[#FFF6F0] px-4 py-3 text-sm text-[#9A4F2D]">질문을 작성하는 동안 풀이 타이머가 일시정지됩니다.</p>
      <section className="mt-4 rounded-card border border-border bg-surface p-4"><p className="text-xs font-bold text-[#D96534]">질문할 문제 · {currentIndex + 1}번</p><h2 className="mt-2 text-[17px] font-extrabold leading-7">{question.stem}</h2></section>
      <section className="mt-4 rounded-card border border-border bg-surface p-4 shadow-[var(--checkon-shadow-card)]"><label htmlFor="question-content" className="font-bold">궁금한 점</label><textarea id="question-content" value={content} onChange={(event) => setContent(event.target.value.slice(0, 500))} placeholder="궁금한 점을 자세히 적어주세요. 선생님께 전달됩니다." className="mt-3 h-36 w-full resize-none rounded-xl border border-border p-3 text-sm leading-6 outline-none focus:border-action" /><p className="mt-1 text-right text-xs text-subtle">{content.length}/500</p></section>
      <ActionButton className="mt-3" disabled={content.trim().length < 5} onClick={submit}>선생님께 질문 보내기</ActionButton>
    </div>
  );
}
