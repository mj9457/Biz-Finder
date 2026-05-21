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
import { formatNumber } from "@/lib/format";
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
    employeeRanges: [],
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

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  pageWindowSize: number,
) {
  const halfWindow = Math.floor(pageWindowSize / 2);
  const initialStart = Math.max(1, currentPage - halfWindow);
  const end = Math.min(totalPages, initialStart + pageWindowSize - 1);
  const start = Math.max(1, end - pageWindowSize + 1);

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  );
}

export function CompanyList({ result, filters }: CompanyListProps) {
  const mobileVisiblePages = getVisiblePages(result.page, result.totalPages, 5);
  const desktopVisiblePages = getVisiblePages(
    result.page,
    result.totalPages,
    10,
  );

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex min-w-0 max-w-[calc(100vw-40px)] flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:max-w-none xl:flex-row xl:items-start xl:justify-between">
        <CompanyKeywordSearch key={`search-${filters.q}`} filters={filters} />
        <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-end xl:w-auto">
          <CompanyCsvDownload filters={filters} />
          <CompanyViewToggle filters={filters} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-700">
          현재 필터 조건에 맞는 기업 수
        </p>
        <strong className="text-base font-semibold text-slate-950">
          총 {formatNumber(result.total)}개
        </strong>
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
          className="flex w-full max-w-[calc(100vw-40px)] flex-nowrap items-center justify-center gap-1 pt-2 sm:max-w-none sm:flex-wrap sm:gap-2"
        >
          <Link
            aria-disabled={result.page <= 1}
            href={createCompanySearchHref(filters, { page: 1 })}
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:h-10 sm:flex-none sm:px-3"
          >
            <ChevronsLeft className="size-4 sm:mr-1" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">처음</span>
          </Link>
          <Link
            aria-disabled={result.page <= 1}
            href={
              result.page <= 1
                ? createCompanySearchHref(filters, { page: 1 })
                : createCompanySearchHref(filters, { page: result.page - 1 })
            }
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:h-10 sm:flex-none sm:px-3"
          >
            <ChevronLeft className="size-4 sm:mr-1" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">이전</span>
          </Link>
          <div className="contents sm:hidden">
            {mobileVisiblePages.map((page) => {
              const isCurrent = page === result.page;

              return (
                <Link
                  key={page}
                  aria-current={isCurrent ? "page" : undefined}
                  href={createCompanySearchHref(filters, { page })}
                  className={[
                    "inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border text-xs font-semibold transition",
                    isCurrent
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {page}
                </Link>
              );
            })}
          </div>
          <div className="hidden sm:contents">
            {desktopVisiblePages.map((page) => {
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
          </div>
          <Link
            aria-disabled={result.page >= result.totalPages}
            href={
              result.page >= result.totalPages
                ? createCompanySearchHref(filters, { page: result.totalPages })
                : createCompanySearchHref(filters, { page: result.page + 1 })
            }
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:h-10 sm:flex-none sm:px-3"
          >
            <span className="sr-only sm:not-sr-only">다음</span>
            <ChevronRight className="size-4 sm:ml-1" aria-hidden="true" />
          </Link>
          <Link
            aria-disabled={result.page >= result.totalPages}
            href={createCompanySearchHref(filters, { page: result.totalPages })}
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:h-10 sm:flex-none sm:px-3"
          >
            <span className="sr-only sm:not-sr-only">끝</span>
            <ChevronsRight className="size-4 sm:ml-1" aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
