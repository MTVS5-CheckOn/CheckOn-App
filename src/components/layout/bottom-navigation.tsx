"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { parentNavigation, studentNavigation } from "@/config/navigation";

export function BottomNavigation({ mode }: { mode: "student" | "parent" }) {
  const pathname = usePathname();
  const items = mode === "student" ? studentNavigation : parentNavigation;
  return <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[calc(64px+env(safe-area-inset-bottom))] w-full max-w-[390px] items-start border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)]">
    {items.map(({ label, href, icon: Icon }) => {
      const active = pathname === href || (href.split("/").length > 2 && pathname.startsWith(`${href}/`));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? "text-[#E96B35]" : "text-[#9AA8BC]"}`}><Icon aria-hidden size={22} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span></Link>;
    })}
  </nav>;
}
