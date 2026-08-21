"use client";
import { CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { FormField } from "@/components/ui/form-field";
import { useParentStore } from "@/features/parent/shared/parent.store";

export function ParentInviteCode() {
  const [code, setCode] = useState(""); const [message, setMessage] = useState<{ tone: "error"|"success"; text: string } | null>(null); const addTeacher = useParentStore((state) => state.addTeacher);
  function verify() { const value = code.trim().toUpperCase(); if (value === "TEACH-OLD") return setMessage({ tone: "error", text: "사용 기간이 만료된 초대 코드입니다." }); if (value === "TEACH-DUP") return setMessage({ tone: "error", text: "이미 등록된 강사의 초대 코드입니다." }); if (value !== "TEACH-KOR") return setMessage({ tone: "error", text: "유효하지 않은 초대 코드입니다." }); addTeacher({ id: "teacher-2", name: "최하늘 선생님", academy: "한빛국어학원" }); setMessage({ tone: "success", text: "최하늘 선생님의 관리 학부모로 등록되었습니다." }); }
  return <div className="space-y-4 p-5"><section className="rounded-card border border-border bg-surface p-5"><FormField label="초대 코드 입력" value={code} onChange={(event) => { setCode(event.target.value); setMessage(null); }} placeholder="TEACH-XXXX" error={message?.tone === "error" ? message.text : undefined} /><p className="mt-3 text-xs text-muted">강사 선생님이 제공한 전용 초대 코드를 입력하세요.</p></section><ActionButton disabled={!code.trim()} onClick={verify}>코드 확인하기</ActionButton>{message?.tone === "success" ? <div className="flex gap-2 rounded-xl bg-[#E8F6F1] p-3 text-sm text-[#26856B]"><CheckCircle2 size={19} className="shrink-0" />{message.text}</div> : null}<div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#EEF7FF] p-3 text-xs leading-5 text-muted"><Info size={17} className="shrink-0 text-action" />여러 강사 선생님의 초대 코드를 각각 등록할 수 있습니다.</div><p className="text-center text-[11px] text-subtle">테스트: TEACH-KOR · TEACH-OLD · TEACH-DUP</p></div>;
}
