import { Bell, ChevronDown } from "lucide-react";

type AppBarProps = { title: string; selectableTitle?: boolean; hasNotification?: boolean };
export function AppBar({ title, selectableTitle = false, hasNotification = false }: AppBarProps) {
  return <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-divider bg-surface px-5 pt-[env(safe-area-inset-top)]">
    <button type="button" className="-ml-2 flex min-h-11 items-center gap-1 rounded-lg px-2 text-xl font-bold" disabled={!selectableTitle} aria-label={selectableTitle ? "자녀 선택" : undefined}>{title}{selectableTitle ? <ChevronDown aria-hidden size={17} className="text-muted" /> : null}</button>
    <button type="button" className="relative grid size-11 place-items-center rounded-full" aria-label="알림 보기"><Bell aria-hidden size={22} />{hasNotification ? <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#E85A4F]" /> : null}</button>
  </header>;
}
