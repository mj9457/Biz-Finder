"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createCompanySearchHref } from "../lib/search-params";
import type { CompanySearchFilters, CompanySort } from "../types";

type CompanySortControlProps = {
  filters: CompanySearchFilters;
};

export function CompanySortControl({ filters }: CompanySortControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateSort(sort: CompanySort) {
    const href = createCompanySearchHref(filters, { sort });

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-700">정렬</span>
      <select
        defaultValue={filters.sort}
        disabled={isPending}
        onChange={(event) => updateSort(event.target.value as CompanySort)}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="relevance">관련도순</option>
        <option value="name-asc">기업명 오름차순</option>
        <option value="name-desc">기업명 내림차순</option>
        <option value="representative-asc">대표자명 오름차순</option>
        <option value="representative-desc">대표자명 내림차순</option>
      </select>
    </label>
  );
}
