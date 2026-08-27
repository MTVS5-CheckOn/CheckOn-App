"use client";

import { Bell, ChevronRight, LogOut, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useLogoutMutation } from "@/features/auth/mutations";
import { useStudentAuthStore } from "@/features/student/auth/student-auth.store";
import { useStudentProfileQuery, useUpdateStudentNotificationsMutation } from "@/features/student/profile/queries";

export function StudentProfile() {
  const router = useRouter();
  const reset = useStudentAuthStore((state) => state.reset);
  const [showAccount, setShowAccount] = useState(false);
  const { data: profile, isLoading, isError, refetch } = useStudentProfileQuery();
  const notificationMutation = useUpdateStudentNotificationsMutation();
  const logoutMutation = useLogoutMutation();
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-40 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError || !profile) return <div className="p-8 text-center"><p className="text-sm font-bold">내 정보를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const logout = async () => { try { await logoutMutation.mutateAsync(); reset(); router.replace(ROUTES.auth.studentLogin); } catch { return; } };
  return <div className="space-y-7 px-5 py-5">
    <section className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]"><span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-xl font-bold text-[#7D452C]">{profile.name.slice(0,1)}</span><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="text-lg font-bold">{profile.name}</h2><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${profile.status === "active" ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#FFF9D2] text-[#92720A]"}`}>{profile.status === "active" ? "활성" : "비활성"}</span></div><p className="mt-1 text-sm text-muted">{profile.grade} · 학생 ID: {profile.studentId}</p></div></section>
    <section><h2 className="mb-2 text-xs font-semibold text-subtle">연결된 강사</h2><div className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]">{profile.teachers.length ? profile.teachers.map((teacher) => <div key={teacher.id} className="flex min-h-[64px] items-center gap-3 border-b border-divider px-4 py-3"><span className="grid size-9 place-items-center rounded-full bg-[#EEF4FF] text-sm font-bold text-action">{teacher.name.slice(0,1)}</span><div><p className="text-sm font-semibold">{teacher.name}</p><p className="mt-0.5 text-xs text-subtle">{teacher.subject ?? ""}</p></div></div>) : <p className="p-5 text-sm text-muted">연결된 강사가 없습니다.</p>}<Link href={routeBuilders.student.inviteCode()} className="flex min-h-[60px] items-center gap-3 px-4 text-sm font-semibold text-action"><span className="grid size-9 place-items-center rounded-full border border-border bg-app"><Plus size={18} /></span>초대 코드 등록하기</Link></div></section>
    <section><h2 className="mb-2 text-xs font-semibold text-subtle">계정 설정</h2><div className="overflow-hidden rounded-card border border-border bg-surface shadow-[var(--checkon-shadow-card)]"><button disabled={notificationMutation.isPending} onClick={() => notificationMutation.mutate(!profile.notificationsEnabled)} className="flex min-h-[54px] w-full items-center gap-3 border-b border-divider px-4 text-left"><Bell size={18} className="text-muted" /><span className="flex-1 text-sm">알림 설정</span><span role="switch" aria-checked={profile.notificationsEnabled} className={`relative h-7 w-12 rounded-full transition-colors ${profile.notificationsEnabled ? "bg-action" : "bg-[#D8DEE7]"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${profile.notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} /></span></button><button onClick={() => setShowAccount((value) => !value)} aria-expanded={showAccount} className="flex min-h-[54px] w-full items-center gap-3 border-b border-divider px-4 text-left"><Settings size={18} className="text-muted" /><span className="flex-1 text-sm">계정 설정</span><ChevronRight size={18} className={`text-subtle transition-transform ${showAccount ? "rotate-90" : ""}`} /></button>{showAccount ? <div className="border-b border-divider bg-[#FAFBFC] px-4 py-3 text-xs leading-5 text-muted">이름과 학년 변경은 연결된 학원의 확인 후 반영됩니다.<br />비밀번호 변경 API가 연결되면 이 영역에서 변경할 수 있습니다.</div> : null}<button onClick={logout} disabled={logoutMutation.isPending} className="flex min-h-[54px] w-full items-center gap-3 px-4 text-sm text-[#E85A4F]"><LogOut size={18} />{logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}</button></div></section>
  </div>;
}
