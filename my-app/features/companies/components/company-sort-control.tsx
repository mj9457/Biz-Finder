"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";

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

  function resetSort() {
    updateSort("relevance");
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="font-medium text-slate-700">정렬</span>
        <select
          value={filters.sort}
          disabled={isPending}
          onChange={(event) => updateSort(event.target.value as CompanySort)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="relevance">기본 정렬</option>
          <option value="name-asc">기업명 오름차순</option>
          <option value="name-desc">기업명 내림차순</option>
          <option value="representative-asc">대표자명 오름차순</option>
          <option value="representative-desc">대표자명 내림차순</option>
        </select>
      </label>
      <button
        type="button"
        onClick={resetSort}
        disabled={isPending || filters.sort === "relevance"}
        className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="기본 정렬로 되돌리기"
        title="기본 정렬로 되돌리기"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        기본값
      </button>
    </div>
  );
}
