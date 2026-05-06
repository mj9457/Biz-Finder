import Link from "next/link";

import { createCompanySearchHref } from "../lib/search-params";
import type { CompanySearchFilters, CompanyView } from "../types";

type CompanyViewToggleProps = {
  filters: CompanySearchFilters;
};

const viewOptions: { value: CompanyView; label: string }[] = [
  { value: "table", label: "테이블" },
  { value: "card", label: "카드" },
];

export function CompanyViewToggle({ filters }: CompanyViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-md border border-slate-300 bg-white p-1"
      aria-label="기업 목록 보기 방식"
    >
      {viewOptions.map((option) => {
        const isActive = filters.view === option.value;

        return (
          <Link
            key={option.value}
            href={createCompanySearchHref(filters, {
              view: option.value,
              page: filters.page,
            })}
            aria-current={isActive ? "true" : undefined}
            className={[
              "inline-flex h-8 min-w-16 items-center justify-center rounded px-3 text-sm font-semibold transition",
              isActive
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-primary/10 hover:text-slate-950",
            ].join(" ")}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
