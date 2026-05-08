import { Loader2 } from "lucide-react";

type CompanyLoadingSpinnerProps = {
  label?: string;
  variant?: "inline" | "overlay";
};

export function CompanyLoadingSpinner({
  label = "불러오는 중",
  variant = "inline",
}: CompanyLoadingSpinnerProps) {
  if (variant === "overlay") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-[2px]"
      >
        <div className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-800 shadow-xl">
          <Loader2
            className="size-5 animate-spin text-primary"
            aria-hidden="true"
          />
          <span>{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[320px] w-full items-center justify-center"
    >
      <div className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
