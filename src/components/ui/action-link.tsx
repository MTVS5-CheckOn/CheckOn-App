import Link from "next/link";

export function ActionLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  const variants = {
    primary: "border-brand bg-brand text-[#4C3024]",
    secondary: "border-[#A9D4F2] bg-surface text-[#2F6FA7]",
    ghost: "border-action bg-surface text-action",
  } as const;
  return <Link href={href} className={`flex h-[52px] w-full items-center justify-center rounded-xl border px-4 text-[15px] font-bold ${variants[variant]}`}>{children}</Link>;
}
