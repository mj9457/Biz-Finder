import Link from "next/link";

import {
  createCompanySearchHref,
  hasActiveCompanyFilters,
} from "../lib/search-params";
import { getSelectedCategoryFilterClassName } from "../lib/category-style";
import { COMPANY_EMPLOYEE_RANGES } from "../data/categories";
import type { CompanyCategory, CompanySearchFilters } from "../types";

type ActiveFilterChipsProps = {
  filters: CompanySearchFilters;
};

type Chip = {
  label: string;
  href: string;
  className?: string;
};

export function ActiveFilterChips({ filters }: ActiveFilterChipsProps) {
  if (!hasActiveCompanyFilters(filters)) {
    return null;
  }

  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({
      label: `검색어: ${filters.q}`,
      href: createCompanySearchHref(filters, { q: "" }),
    });
  }

  if (filters.region) {
    chips.push({
      label: `지역: ${filters.region}`,
      href: createCompanySearchHref(filters, { region: "" }),
    });
  }

  for (const employeeRangeValue of filters.employeeRanges) {
    const employeeRange = COMPANY_EMPLOYEE_RANGES.find(
      (option) => option.value === employeeRangeValue,
    );

    chips.push({
      label: `근로자수: ${employeeRange?.label ?? employeeRangeValue}`,
      href: createCompanySearchHref(filters, {
        employeeRanges: filters.employeeRanges.filter(
          (value) => value !== employeeRangeValue,
        ),
      }),
    });
  }

  for (const category of filters.categories) {
    chips.push({
      label: `업종: ${category}`,
      href: createCompanySearchHref(filters, {
        categories: filters.categories.filter(
          (value): value is CompanyCategory => value !== category,
        ),
      }),
      className: `${getSelectedCategoryFilterClassName(category)} hover:opacity-80`,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-600">적용 필터</span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className={[
            "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition",
            chip.className ??
              "border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700",
          ].join(" ")}
        >
          {chip.label} 지우기
        </Link>
      ))}
    </div>
  );
}
