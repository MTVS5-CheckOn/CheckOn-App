import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function ActionButton({ className = "", variant = "primary", ...props }: ActionButtonProps) {
  const variants = {
    primary: "border border-brand bg-brand text-[#4C3024]",
    secondary: "border border-[#A9D4F2] bg-surface text-[#2F6FA7]",
    ghost: "border border-action bg-surface text-action",
  } as const;

  return (
    <button
      className={`flex h-[52px] w-full items-center justify-center rounded-xl px-4 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:border-[#ECEFF2] disabled:bg-[#ECEFF2] disabled:text-[#A8B1C1] ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
