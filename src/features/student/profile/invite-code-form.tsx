"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ROUTES } from "@/config/routes";
import { useRegisterStudentInviteMutation, useVerifyStudentInviteMutation } from "@/features/student/profile/queries";
import type { InviteVerificationResponse } from "@/features/student/profile/types";
import { ApiError } from "@/lib/api/errors";

export function InviteCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<InviteVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verifyMutation = useVerifyStudentInviteMutation();
  const registerMutation = useRegisterStudentInviteMutation();
  const verify = async () => { setError(null); setVerification(null); try { setVerification(await verifyMutation.mutateAsync(code.trim())); } catch (reason) { setError(reason instanceof ApiError || reason instanceof Error ? reason.message : "초대 코드를 확인하지 못했습니다."); } };
  const connect = async () => { if (!verification) return; setError(null); try { await registerMutation.mutateAsync(verification.code); } catch (reason) { setError(reason instanceof Error ? reason.message : "강사 연결을 완료하지 못했습니다."); } };
  const connected = registerMutation.isSuccess;
  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]"><label htmlFor="invite-code" className="text-base font-bold">초대 코드 입력</label><p className="mt-1 text-sm leading-5 text-muted">강사 선생님이 제공한 초대 코드 또는 링크 코드를 입력하세요.</p><input id="invite-code" value={code} onChange={(event) => { setCode(event.target.value); setVerification(null); setError(null); verifyMutation.reset(); registerMutation.reset(); }} placeholder="예: INVITE-XXXX 또는 링크 코드" className="mt-4 h-[52px] w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-action" /></section>
    <ActionButton onClick={verify} disabled={!code.trim() || verifyMutation.isPending}>{verifyMutation.isPending ? "코드 확인 중..." : "코드 확인하기"}</ActionButton>
    <div className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted"><Info size={16} className="shrink-0 text-[#6EB5E9]" />여러 강사 선생님의 초대 코드를 각각 등록하면 모두 연결됩니다.</div>
    {verification ? <section className="rounded-card border border-[#BFE6D9] bg-[#F2FBF8] p-4"><div className="flex items-center gap-2 text-[#26856B]"><CheckCircle2 size={20} /><h2 className="text-sm font-bold">사용할 수 있는 초대 코드예요</h2></div><dl className="mt-4 space-y-3 text-sm"><Row label="강사" value={verification.teacher.name} /><Row label="학원" value={verification.teacher.name} /><Row label="담당" value={verification.teacher.subject ?? "—"} /></dl>{connected ? <div className="mt-4 rounded-xl bg-white p-3 text-center text-sm font-bold text-[#26856B]">강사 연결이 완료됐습니다.</div> : <ActionButton className="mt-4" onClick={connect} disabled={registerMutation.isPending}>{registerMutation.isPending ? "연결 중..." : "이 강사와 연결하기"}</ActionButton>}{connected ? <ActionButton className="mt-2" variant="ghost" onClick={() => router.push(ROUTES.student.profile)}>내 정보로 돌아가기</ActionButton> : null}</section> : null}
    {error ? <section className="rounded-card border border-[#FFCBC6] bg-[#FFF5F4] p-4"><div className="flex items-center gap-2 text-[#D64545]"><AlertCircle size={20} /><h2 className="text-sm font-bold">코드를 확인할 수 없어요</h2></div><p className="mt-2 text-xs leading-5 text-muted">{error}</p></section> : null}
  </div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-b border-[#DDEFE9] pb-3 last:border-0 last:pb-0"><dt className="text-muted">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
