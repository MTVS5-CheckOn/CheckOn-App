"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { ROUTES } from "@/config/routes";
import { type ConnectedTeacher, useStudentProfileStore } from "@/features/student/profile/profile.store";

type Verification = { type: "valid"; teacher: ConnectedTeacher } | { type: "invalid" | "expired"; message: string } | null;
const INVITE_TEACHER: ConnectedTeacher = { id: "teacher-2", name: "이서현 선생님", academy: "체크온 국어학원", subject: "독서·언어 담당" };

export function InviteCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<Verification>(null);
  const [connected, setConnected] = useState(false);
  const addTeacher = useStudentProfileStore((state) => state.addTeacher);
  const verify = () => { const normalized = code.trim().toUpperCase(); setConnected(false); if (normalized === "CHECKON-2026" || normalized === "INVITE-2026") setVerification({ type: "valid", teacher: INVITE_TEACHER }); else if (normalized === "EXPIRED-2026") setVerification({ type: "expired", message: "사용 기간이 지난 초대 코드입니다. 강사 선생님께 새 코드를 요청해 주세요." }); else setVerification({ type: "invalid", message: "유효하지 않은 초대 코드입니다. 철자와 하이픈을 다시 확인해 주세요." }); };
  const connect = () => { if (!verification || verification.type !== "valid") return; addTeacher(verification.teacher); setConnected(true); };
  return <div className="space-y-4 px-5 py-5">
    <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]"><label htmlFor="invite-code" className="text-base font-bold">초대 코드 입력</label><p className="mt-1 text-sm leading-5 text-muted">강사 선생님이 제공한 초대 코드 또는 링크 코드를 입력하세요.</p><input id="invite-code" value={code} onChange={(event) => { setCode(event.target.value); setVerification(null); setConnected(false); }} placeholder="예: INVITE-XXXX 또는 링크 코드" className="mt-4 h-[52px] w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-action" /></section>
    <ActionButton onClick={verify} disabled={!code.trim()}>코드 확인하기</ActionButton>
    <div className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted"><Info size={16} className="shrink-0 text-[#6EB5E9]" />여러 강사 선생님의 초대 코드를 각각 등록하면 모두 연결됩니다.</div>
    {verification?.type === "valid" ? <section className="rounded-card border border-[#BFE6D9] bg-[#F2FBF8] p-4"><div className="flex items-center gap-2 text-[#26856B]"><CheckCircle2 size={20} /><h2 className="text-sm font-bold">사용할 수 있는 초대 코드예요</h2></div><dl className="mt-4 space-y-3 text-sm"><Row label="강사" value={verification.teacher.name} /><Row label="학원" value={verification.teacher.academy} /><Row label="담당" value={verification.teacher.subject} /></dl>{connected ? <div className="mt-4 rounded-xl bg-white p-3 text-center text-sm font-bold text-[#26856B]">강사 연결이 완료됐습니다.</div> : <ActionButton className="mt-4" onClick={connect}>이 강사와 연결하기</ActionButton>}{connected ? <ActionButton className="mt-2" variant="ghost" onClick={() => router.push(ROUTES.student.profile)}>내 정보로 돌아가기</ActionButton> : null}</section> : verification ? <section className="rounded-card border border-[#FFCBC6] bg-[#FFF5F4] p-4"><div className="flex items-center gap-2 text-[#D64545]"><AlertCircle size={20} /><h2 className="text-sm font-bold">{verification.type === "expired" ? "초대 코드가 만료됐어요" : "코드를 확인할 수 없어요"}</h2></div><p className="mt-2 text-xs leading-5 text-muted">{verification.message}</p></section> : null}
  </div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-b border-[#DDEFE9] pb-3 last:border-0 last:pb-0"><dt className="text-muted">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
