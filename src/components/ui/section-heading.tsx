import Link from "next/link";

export function SectionHeading({ title, href, actionLabel = "전체 보기" }: { title: string; href?: string; actionLabel?: string }) {
  return <div className="flex items-center justify-between"><h2 className="text-base font-bold text-ink">{title}</h2>{href ? <Link href={href} className="min-h-11 content-center text-sm font-semibold text-action">{actionLabel}</Link> : null}</div>;
}
