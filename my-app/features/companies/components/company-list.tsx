import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  SearchX,
} from "lucide-react";

import {
  createCompanySearchHref,
  hasActiveCompanyFilters,
} from "../lib/search-params";
import type { CompanySearchFilters, CompanySearchResult } from "../types";
import { CompanyCardList } from "./company-card-list";
import { CompanyCsvDownload } from "./company-csv-download";
import { CompanyKeywordSearch } from "./company-keyword-search";
import { CompanyTable } from "./company-table";
import { CompanyViewToggle } from "./company-view-toggle";

type CompanyListProps = {
  result: CompanySearchResult;
  filters: CompanySearchFilters;
};

function EmptyCompanyResult({ filters }: { filters: CompanySearchFilters }) {
  const resetHref = createCompanySearchHref(filters, {
    q: "",
    region: "",
    categories: [],
    employeeRange: "",
  });

  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-slate-950">
        <SearchX
          className="mx-auto mb-3 block size-8 text-slate-400"
          aria-hidden="true"
        />
        검색 결과가 없습니다
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        검색어, 지역, 업종 조건을 줄이거나 선택을 해제해 보세요.
      </p>
      {hasActiveCompanyFilters(filters) ? (
        <Link
          href={resetHref}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <RotateCcw className="mr-2 size-4" aria-hidden="true" />
          전체 기업 보기
        </Link>
      ) : null}
    </section>
  );
}

export function CompanyList({ result, filters }: CompanyListProps) {
  const pageWindowSize = 10;
  const pageWindowStart =
    Math.floor((result.page - 1) / pageWindowSize) * pageWindowSize + 1;
  const pageWindowEnd = Math.min(
    pageWindowStart + pageWindowSize - 1,
    result.totalPages,
  );
  const visiblePages = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index,
  );

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-start xl:justify-between">
        <CompanyKeywordSearch key={`search-${filters.q}`} filters={filters} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
          <CompanyCsvDownload filters={filters} />
          <CompanyViewToggle filters={filters} />
        </div>
      </div>

      {result.total === 0 ? (
        <EmptyCompanyResult filters={filters} />
      ) : filters.view === "card" ? (
        <CompanyCardList companies={result.items} />
      ) : (
        <CompanyTable companies={result.items} filters={filters} />
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label="기업 검색 결과 페이지"
          className="flex flex-wrap items-center justify-center gap-2 pt-2"
        >
          <Link
            aria-disabled={result.page <= 1}
            href={createCompanySearchHref(filters, { page: 1 })}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            <ChevronsLeft className="mr-1 size-4" aria-hidden="true" />
            <span>처음</span>
          </Link>
          <Link
            aria-disabled={result.page <= 1}
            href={
              result.page <= 1
                ? createCompanySearchHref(filters, { page: 1 })
                : createCompanySearchHref(filters, { page: result.page - 1 })
            }
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 size-4" aria-hidden="true" />
            <span>이전</span>
          </Link>
          {visiblePages.map((page) => {
            const isCurrent = page === result.page;

            return (
              <Link
                key={page}
                aria-current={isCurrent ? "page" : undefined}
                href={createCompanySearchHref(filters, { page })}
                className={[
                  "inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold transition",
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {page}
              </Link>
            );
          })}
          <Link
            aria-disabled={result.page >= result.totalPages}
            href={
              result.page >= result.totalPages
                ? createCompanySearchHref(filters, { page: result.totalPages })
                : createCompanySearchHref(filters, { page: result.page + 1 })
            }
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            <span>다음</span>
            <ChevronRight className="ml-1 size-4" aria-hidden="true" />
          </Link>
          <Link
            aria-disabled={result.page >= result.totalPages}
            href={createCompanySearchHref(filters, { page: result.totalPages })}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            <span>끝</span>
            <ChevronsRight className="ml-1 size-4" aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
