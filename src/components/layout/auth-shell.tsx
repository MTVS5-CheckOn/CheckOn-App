export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[390px] overflow-hidden bg-app shadow-[0_0_40px_rgb(32_41_57/12%)]">
      {children}
    </div>
  );
}
