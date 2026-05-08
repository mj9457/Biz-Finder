"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { createCompanySearchHref } from "../lib/search-params";
import type { CompanySearchFilters } from "../types";

type CompanyKeywordSearchProps = {
  filters: CompanySearchFilters;
};

export function CompanyKeywordSearch({ filters }: CompanyKeywordSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(filters.q);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const href = createCompanySearchHref(filters, {
      q: keyword.trim(),
      page: 1,
    });

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="grid w-full grid-cols-[1fr_40px] items-center gap-2 sm:flex sm:max-w-xl sm:flex-row"
    >
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">통합 검색</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="업체명, 대표자명, 취급품목"
          className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md bg-primary px-0 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-4"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">
          {isPending ? "검색 중" : "검색"}
        </span>
      </button>
    </form>
  );
}
