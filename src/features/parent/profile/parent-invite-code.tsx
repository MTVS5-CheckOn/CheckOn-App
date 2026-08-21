"use client";
import { CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { FormField } from "@/components/ui/form-field";
import { useRegisterInviteMutation } from "@/features/parent/api/queries";
import { useParentStore } from "@/features/parent/shared/parent.store";

export function ParentInviteCode() {
  const [code, setCode] = useState(""); const [message, setMessage] = useState<{ tone: "error"|"success"; text: string } | null>(null); const addTeacher = useParentStore((state) => state.addTeacher); const mutation = useRegisterInviteMutation();
  async function verify() { try { const teacher = await mutation.mutateAsync({ code: code.trim().toUpperCase() }); addTeacher(teacher); setMessage({ tone: "success", text: `${teacher.name}의 관리 학부모로 등록되었습니다.` }); } catch (caught) { setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "초대 코드를 확인하지 못했습니다." }); } }
  return <div className="space-y-4 p-5"><section className="rounded-card border border-border bg-surface p-5"><FormField label="초대 코드 입력" value={code} onChange={(event) => { setCode(event.target.value); setMessage(null); mutation.reset(); }} placeholder="TEACH-XXXX" error={message?.tone === "error" ? message.text : undefined} /><p className="mt-3 text-xs text-muted">강사 선생님이 제공한 전용 초대 코드를 입력하세요.</p></section><ActionButton disabled={!code.trim() || mutation.isPending} onClick={verify}>{mutation.isPending ? "코드 확인 중..." : "코드 확인하기"}</ActionButton>{message?.tone === "success" ? <div className="flex gap-2 rounded-xl bg-[#E8F6F1] p-3 text-sm text-[#26856B]"><CheckCircle2 size={19} className="shrink-0" />{message.text}</div> : null}<div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#EEF7FF] p-3 text-xs leading-5 text-muted"><Info size={17} className="shrink-0 text-action" />여러 강사 선생님의 초대 코드를 각각 등록할 수 있습니다.</div><p className="text-center text-[11px] text-subtle">테스트: TEACH-KOR · TEACH-OLD · TEACH-DUP</p></div>;
}
