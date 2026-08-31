import { LayoutGrid, Table2 } from "lucide-react";

import type { CompanyView } from "../types";

type CompanyViewToggleProps = {
  view: CompanyView;
  onViewChange: (view: CompanyView) => void;
};

const viewOptions = [
  { value: "table", label: "테이블", Icon: Table2 },
  { value: "card", label: "카드", Icon: LayoutGrid },
] satisfies Array<{
  value: CompanyView;
  label: string;
  Icon: typeof Table2;
}>;

export function CompanyViewToggle({
  view,
  onViewChange,
}: CompanyViewToggleProps) {
  return (
    <div
      className="inline-flex w-full rounded-md border border-slate-300 bg-white p-1 sm:w-auto"
      aria-label="기업 목록 보기 방식"
    >
      {viewOptions.map((option) => {
        const isActive = view === option.value;
        const Icon = option.Icon;

        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onViewChange(option.value)}
            aria-current={isActive ? "true" : undefined}
            aria-pressed={isActive}
            className={[
              "inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded px-3 text-sm font-semibold transition sm:min-w-16 sm:flex-none",
              isActive
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-primary/10 hover:text-slate-950",
            ].join(" ")}
          >
            <Icon className="mr-1.5 size-4" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
