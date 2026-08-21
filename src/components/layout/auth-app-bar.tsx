"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthAppBarProps = {
  title: string;
  backHref?: string;
  action?: { label: string; onClick?: () => void; href?: string };
};

export function AuthAppBar({ title, backHref, action }: AuthAppBarProps) {
  const router = useRouter();

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-divider bg-surface px-5 pb-2 pt-3">
      <div className="flex min-w-0 items-center">
        {backHref ? (
          <button
            type="button"
            className="-ml-3 grid size-11 shrink-0 place-items-center rounded-xl text-muted"
            onClick={() => router.push(backHref)}
            aria-label="이전 화면"
          >
            <ArrowLeft aria-hidden size={22} />
          </button>
        ) : null}
        <h1 className="truncate text-xl font-bold tracking-[-0.2px]">{title}</h1>
      </div>
      {action ? (
        <button
          type="button"
          className="ml-3 h-10 shrink-0 rounded-xl bg-brand-soft px-3.5 text-sm font-semibold text-[#9A4F2D]"
          onClick={() => action.href ? router.push(action.href) : action.onClick?.()}
        >
          {action.label}
        </button>
      ) : null}
    </header>
  );
}
