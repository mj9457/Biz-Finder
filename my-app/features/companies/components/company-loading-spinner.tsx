import { Loader2 } from "lucide-react";

type CompanyLoadingSpinnerProps = {
  label?: string;
};

export function CompanyLoadingSpinner({
  label = "불러오는 중",
}: CompanyLoadingSpinnerProps) {
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
