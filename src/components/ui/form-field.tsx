import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
};

export function FormField({ label, error, trailing, id, className = "", ...props }: FormFieldProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <span className={`flex h-[52px] items-center rounded-xl border bg-surface px-4 ${error ? "border-[#E85A4F]" : "border-border"}`}>
        <input
          id={inputId}
          className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {trailing}
      </span>
      {error ? <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-[#D64545]">{error}</span> : null}
    </label>
  );
}
