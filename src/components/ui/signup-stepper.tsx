const STEPS = ["1 약관 동의", "2 정보 입력", "3 가입 완료"] as const;

export function SignupStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 gap-2 border-b border-divider bg-surface px-5 pb-3 pt-3" aria-label="회원가입 진행 단계">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const complete = step < current;
        return (
          <li key={label} aria-current={active ? "step" : undefined}>
            <span className={`mb-1.5 block h-[3px] rounded-full ${active || complete ? "bg-brand" : "bg-[#E3E7ED]"}`} />
            <span className={`text-[11px] font-semibold ${active ? "text-[#D46E3C]" : "text-subtle"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
