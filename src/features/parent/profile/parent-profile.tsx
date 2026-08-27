"use client";

import { Bell, ChevronRight, LogOut, MessageCircle, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES, routeBuilders } from "@/config/routes";
import { useLogoutMutation } from "@/features/auth/mutations";
import { useParentProfileQuery, useUpdateParentNotificationsMutation } from "@/features/parent/api/queries";
import { useParentStore } from "@/features/parent/shared/parent.store";

export function ParentProfile() {
  const router = useRouter();
  const { children, teachers, reset, setNotifications } = useParentStore();
  const { data: profile, isLoading, isError, refetch } = useParentProfileQuery();
  const notificationMutation = useUpdateParentNotificationsMutation();
  const logoutMutation = useLogoutMutation();
  const [accountOpen, setAccountOpen] = useState(false);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !profile) return <ProfileError onRetry={() => refetch()} />;

  const updateNotifications = async () => {
    const next = !profile.notificationsEnabled;
    try {
      await notificationMutation.mutateAsync(next);
      setNotifications(next);
    } catch { return; }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      reset();
      router.replace(ROUTES.auth.parentLogin);
    } catch { return; }
  };

  return (
    <div className="space-y-7 px-5 py-4">
      <section className="flex items-center gap-4 rounded-card border border-border bg-surface p-5">
        <span className="grid size-14 place-items-center rounded-full bg-info-soft text-xl font-bold text-action">{profile.name.slice(0, 1)}</span>
        <div><div className="flex items-center gap-2"><h2 className="text-lg font-bold">{profile.name}</h2><span className="rounded bg-[#EEF4FF] px-2 py-1 text-[11px] font-bold text-action">학부모</span></div>{/* 🔴 maskedPhone 은 계약에 원천이 없다 — ParentProfile 에 전화번호 필드 자체가 없다. */}</div>
      </section>

      <ProfileSection title="상담"><Link href={ROUTES.parent.consultations} className="flex min-h-[60px] items-center gap-3 rounded-card border border-border bg-surface px-4"><span className="grid size-9 place-items-center rounded-full bg-brand-soft text-[#D96534]"><MessageCircle size={18} /></span><span className="flex-1 text-sm font-semibold">상담 내역</span><ChevronRight size={18} className="text-subtle" /></Link></ProfileSection>

      <ProfileSection title="등록된 자녀"><div className="overflow-hidden rounded-card border border-border bg-surface">{children.map((child) => <div key={child.id} className="flex min-h-[72px] items-center gap-3 border-b border-divider px-4">
        {/* 🔴 이름이 없으면(계약 required 이지만 실제로 null 이 온다) 이니셜·이름 줄을 렌더링하지 않는다.
            「─」나 「이름 없음」을 채우면 그게 곧 지어낸 값이다. */}
        {child.name ? <span className="grid size-10 place-items-center rounded-full bg-brand font-bold text-[#7D452C]">{child.name.slice(0, 1)}</span> : null}
        <div className="min-w-0 flex-1">{child.name ? <p className="font-bold">{child.name}</p> : null}<p className="text-xs text-muted">{[child.grade, child.studentId, child.active ? "활성" : "비활성"].filter(Boolean).join(" · ")}</p></div><span className="rounded bg-[#E8F6F1] px-2 py-1 text-[11px] font-bold text-[#26856B]">연결됨</span></div>)}<Link href={routeBuilders.parent.childRegister()} className="flex min-h-[60px] items-center gap-3 px-4 text-sm font-semibold text-action"><PlusCircle />자녀 등록하기</Link></div></ProfileSection>

      <ProfileSection title="연결된 강사"><div className="overflow-hidden rounded-card border border-border bg-surface">{teachers.map((teacher) => <div key={teacher.id} className="flex min-h-[72px] items-center gap-3 border-b border-divider px-4"><span className="grid size-10 place-items-center rounded-full bg-[#EEF4FF] font-bold text-action">{teacher.name.slice(0, 1)}</span><div><p className="font-bold">{teacher.name}</p><p className="text-xs text-muted">{teacher.subject ?? ""}</p></div></div>)}<Link href={routeBuilders.parent.inviteCode()} className="flex min-h-[60px] items-center gap-3 px-4 text-sm font-semibold text-action"><PlusCircle />초대 코드 등록하기</Link></div></ProfileSection>

      <ProfileSection title="설정"><div className="overflow-hidden rounded-card border border-border bg-surface"><button disabled={notificationMutation.isPending} onClick={updateNotifications} className="flex min-h-[56px] w-full items-center gap-3 border-b border-divider px-4 text-left"><Bell size={18} className="text-muted" /><span className="flex-1 text-sm">알림 설정</span><span role="switch" aria-checked={profile.notificationsEnabled} className={`relative h-7 w-12 rounded-full transition-colors ${profile.notificationsEnabled ? "bg-action" : "bg-[#D8DEE7]"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${profile.notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} /></span></button><button onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen} className="flex min-h-[56px] w-full items-center gap-3 border-b border-divider px-4 text-left"><Settings size={18} className="text-muted" /><span className="flex-1 text-sm">계정 설정</span><ChevronRight size={18} className={`text-subtle transition-transform ${accountOpen ? "rotate-90" : ""}`} /></button>{accountOpen ? <p className="border-b border-divider bg-app px-4 py-3 text-xs leading-5 text-muted">이름과 연락처 변경은 본인 확인 후 반영됩니다. 비밀번호 변경 API 연결 시 같은 화면에서 처리합니다.</p> : null}<button onClick={logout} disabled={logoutMutation.isPending} className="flex min-h-[56px] w-full items-center gap-3 px-4 text-sm text-[#E85A4F]"><LogOut size={18} />{logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}</button></div></ProfileSection>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="mb-2 text-xs font-semibold text-subtle">{title}</h2>{children}</section>; }
function PlusCircle() { return <span className="grid size-9 place-items-center rounded-full border border-border bg-app"><Plus size={18} /></span>; }
function ProfileSkeleton() { return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-40 animate-pulse rounded-card bg-[#E9EDF2]" /></div>; }
function ProfileError({ onRetry }: { onRetry: () => void }) { return <div className="p-8 text-center"><p className="text-sm font-bold">내 정보를 불러오지 못했어요.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>; }
