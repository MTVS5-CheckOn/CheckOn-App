"use client";

import { Bell, BookOpenCheck, CircleHelp, FileText, MessageCircle, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useParentNotificationsQuery } from "@/features/parent/api/queries";
import type { ParentNotification } from "@/features/parent/model/types";
import { parentNotificationHref } from "@/features/parent/notifications/notification-route";
import { useParentStore } from "@/features/parent/shared/parent.store";

const PRESENTATION: Record<ParentNotification["type"], { icon: typeof Bell; className: string }> = {
  report: { icon: FileText, className: "bg-warning-soft text-[#A55A32]" },
  consultation: { icon: MessageCircle, className: "bg-brand-soft text-[#D96534]" },
  question: { icon: CircleHelp, className: "bg-[#EEF4FF] text-action" },
  learning: { icon: BookOpenCheck, className: "bg-[#EAF6F2] text-[#26856B]" },
  child: { icon: UserRoundCheck, className: "bg-[#EEF4FF] text-action" },
};

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useParentNotificationsQuery();
  const selectChild = useParentStore((state) => state.selectChild);
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">알림을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const unreadCount = data.filter((item) => !item.read).length;
  return <div className="space-y-3 p-5"><div className="flex min-h-11 items-center justify-between"><p className="text-xs font-semibold text-subtle">새 알림 {unreadCount}개</p>{unreadCount ? <button onClick={() => markAll.mutate()} disabled={markAll.isPending} className="text-xs font-semibold text-action">모두 읽음</button> : null}</div>{data.length ? data.map((item) => {
    const presentation = PRESENTATION[item.type];
    const Icon = presentation.icon;
    const href = parentNotificationHref(item);
    const openNotification = () => {
      if (item.target?.studentId) selectChild(item.target.studentId);
      if (!item.read) markRead.mutate(item.id);
    };
    const content = <><span className={`grid size-10 shrink-0 place-items-center rounded-full ${presentation.className}`}><Icon aria-hidden size={19} /></span><div className="min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-bold">{item.title}</p>{!item.read ? <span className="size-2 shrink-0 rounded-full bg-[#E85A4F]" aria-label="읽지 않음" /> : null}</div>{item.body ? <p className="mt-1 text-xs leading-5 text-muted">{item.body}</p> : null}<p className="mt-2 text-[11px] text-subtle">{item.createdAt}</p></div></>;
    return href ? <Link key={item.id} href={href} onClick={openNotification} className="flex gap-3 rounded-card border border-border bg-surface p-4">{content}</Link> : <button key={item.id} type="button" onClick={openNotification} className="flex w-full gap-3 rounded-card border border-border bg-surface p-4 text-left">{content}</button>;
  }) : <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><Bell className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">새로운 알림이 없어요</p></section>}</div>;
}
