"use client";

import { Bell, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useParentNotificationsQuery } from "@/features/parent/api/queries";

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useParentNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-24 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">알림을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const unreadCount = data.filter((item) => !item.read).length;
  return <div className="space-y-3 p-5"><div className="flex min-h-11 items-center justify-between"><p className="text-xs font-semibold text-subtle">새 알림 {unreadCount}개</p>{unreadCount ? <button onClick={() => markAll.mutate()} disabled={markAll.isPending} className="text-xs font-semibold text-action">모두 읽음</button> : null}</div>{data.length ? data.map((item) => {
    const Icon = item.type === "report" ? FileText : item.type === "consultation" ? MessageCircle : Bell;
    const content = <><span className={`grid size-10 shrink-0 place-items-center rounded-full ${item.type === "report" ? "bg-warning-soft" : item.type === "consultation" ? "bg-brand-soft text-[#D96534]" : "bg-[#EEF4FF] text-action"}`}><Icon size={19} /></span><div className="min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-bold">{item.title}</p>{!item.read ? <span className="size-2 shrink-0 rounded-full bg-[#E85A4F]" /> : null}</div><p className="mt-1 text-xs leading-5 text-muted">{item.body}</p><p className="mt-2 text-[11px] text-subtle">{item.createdAt}</p></div></>;
    return item.href ? <Link key={item.id} href={item.href} onClick={() => { if (!item.read) markRead.mutate(item.id); }} className="flex gap-3 rounded-card border border-border bg-surface p-4">{content}</Link> : <div key={item.id} className="flex gap-3 rounded-card border border-border bg-surface p-4">{content}</div>;
  }) : <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><Bell className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">새로운 알림이 없어요</p></section>}</div>;
}
