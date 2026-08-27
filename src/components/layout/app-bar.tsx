import { ArrowLeft, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type AppBarProps = {
  title: string;
  brandLogo?: boolean;
  selectableTitle?: boolean;
  hasNotification?: boolean;
  hasUnreadNotification?: boolean;
  notificationHref?: string;
  backHref?: string;
  action?: { label: string; href: string };
};
export function AppBar({ title, brandLogo = false, selectableTitle = false, hasNotification = false, hasUnreadNotification = false, notificationHref = "#", backHref, action }: AppBarProps) {
  return <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-divider bg-surface px-5 pt-[env(safe-area-inset-top)]">
    <div className="flex min-w-0 items-center">
      {backHref ? <Link href={backHref} className="-ml-3 grid size-11 shrink-0 place-items-center rounded-xl text-muted" aria-label="이전 화면"><ArrowLeft aria-hidden size={22} /></Link> : null}
      {selectableTitle ? <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("checkon:child-selector"))} className="-ml-2 flex min-h-11 items-center gap-1 rounded-lg px-2 text-xl font-bold" aria-label="자녀 선택">{title}<ChevronDown aria-hidden size={17} className="text-muted" /></button> : brandLogo ? <h1><Image src="/brand/logo-horizontal.svg" alt="Check-On" width={124} height={32} priority className="h-8 w-auto" /></h1> : <h1 className="truncate text-xl font-bold">{title}</h1>}
    </div>
    {action ? <Link href={action.href} className="ml-3 flex h-10 shrink-0 items-center rounded-xl bg-brand-soft px-3.5 text-sm font-semibold text-[#9A4F2D]">{action.label}</Link> : hasNotification ? <Link href={notificationHref} className="relative grid size-11 place-items-center rounded-full" aria-label={hasUnreadNotification ? "읽지 않은 알림 보기" : "알림 보기"}><Bell aria-hidden size={22} />{hasUnreadNotification ? <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#E85A4F]" /> : null}</Link> : null}
  </header>;
}
