"use client";
import { CheckCircle2, Info, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/config/routes";
import { useParentStore } from "@/features/parent/shared/parent.store";

export function ChildRegistration() {
  const [studentId, setStudentId] = useState(""); const [error, setError] = useState(""); const [step, setStep] = useState<"input"|"confirm"|"complete">("input"); const addChild = useParentStore((state) => state.addChild);
  function verify() { const code = studentId.trim().toUpperCase(); if (code === "STU-TAKEN") return setError("이미 다른 학부모 계정에 등록된 학생입니다."); if (code !== "STU-B52D") return setError("학생 정보를 찾을 수 없습니다. ID를 다시 확인해 주세요."); setError(""); setStep("confirm"); }
  function register() { addChild({ id: "student-2", studentId: "STU-B52D", name: "김서준", grade: "고1", active: true }); setStep("complete"); }
  if (step === "complete") return <div className="px-5 py-20 text-center"><CheckCircle2 size={56} className="mx-auto text-[#26856B]" /><h2 className="mt-5 text-xl font-bold">자녀 등록이 완료됐어요</h2><p className="mt-2 text-sm leading-6 text-muted">김서준 학생의 계정이 활성화되었습니다.<br />이제 학습 현황을 확인할 수 있어요.</p><Link href={ROUTES.parent.home} className="mt-8 flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold">홈에서 확인하기</Link></div>;
  if (step === "confirm") return <div className="space-y-4 p-5"><section className="rounded-card border border-border bg-surface p-5"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-brand"><UserRound /></span><div><p className="text-xs text-muted">등록할 학생</p><h2 className="mt-1 text-lg font-bold">김서준 · 고1</h2><p className="text-xs text-muted">STU-B52D · 현재 비활성</p></div></div></section><div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-[#7C6210]"><Info size={17} className="shrink-0" />등록하면 학생 계정이 즉시 활성화되며 다른 학부모 계정에는 등록할 수 없습니다.</div><ActionButton onClick={register}>이 학생을 자녀로 등록</ActionButton><ActionButton variant="secondary" onClick={() => setStep("input")}>다시 확인하기</ActionButton></div>;
  return <div className="space-y-4 p-5"><section className="rounded-card border border-border bg-surface p-5"><FormField label="학생 ID 입력" value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="STU-XXXX" error={error} /><p className="mt-3 text-xs text-muted">학생 앱에서 발급된 학생 ID를 입력하세요.</p></section><div className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted"><Info size={17} className="shrink-0 text-action" />한 학생은 한 학부모 계정에만 등록할 수 있습니다.</div><ActionButton disabled={!studentId.trim()} onClick={verify}>학생 확인하기</ActionButton><p className="text-center text-[11px] text-subtle">테스트 ID: STU-B52D · 중복 확인: STU-TAKEN</p></div>;
}
