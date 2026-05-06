"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { COMPANY_CATEGORIES, COMPANY_REGIONS } from "../data/categories";
import { getSelectedCategoryFilterClassName } from "../lib/category-style";
import { createCompanySearchHref } from "../lib/search-params";
import type {
  CompanyCategory,
  CompanyFacets,
  CompanySearchFilters,
} from "../types";

type CompanySearchFormProps = {
  filters: CompanySearchFilters;
  facets: CompanyFacets;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
};

const DEBOUNCE_MS = 350;

function hasSameCategories(
  current: CompanyCategory[],
  next: CompanyCategory[],
) {
  if (current.length !== next.length) {
    return false;
  }

  const nextSet = new Set(next);
  return current.every((category) => nextSet.has(category));
}

export function CompanySearchForm({
  filters,
  facets,
  isCollapsed = false,
  onToggleCollapsed,
}: CompanySearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [keyword, setKeyword] = useState(filters.q);
  const [region, setRegion] = useState(filters.region);
  const [isIndustryFilterOpen, setIsIndustryFilterOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    CompanyCategory[]
  >(filters.categories);

  const selectedSet = useMemo(
    () => new Set(selectedCategories),
    [selectedCategories],
  );

  const categoryCounts = useMemo(() => {
    return new Map(
      facets.categories.map((facet) => [facet.value, facet.count]),
    );
  }, [facets.categories]);

  const nextHref = useMemo(() => {
    const nextKeyword = keyword.trim();
    const hasFilterChanges =
      nextKeyword !== filters.q ||
      region !== filters.region ||
      !hasSameCategories(selectedCategories, filters.categories);

    return createCompanySearchHref(filters, {
      q: nextKeyword,
      region,
      categories: selectedCategories,
      page: hasFilterChanges ? 1 : filters.page,
    });
  }, [filters, keyword, region, selectedCategories]);

  useEffect(() => {
    const query = searchParams.toString();
    const currentHref = query ? `${pathname}?${query}` : pathname;

    if (currentHref === nextHref) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [nextHref, pathname, router, searchParams, startTransition]);

  function toggleCategory(category: CompanyCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  }

  const resetHref = createCompanySearchHref(filters, {
    q: "",
    region: "",
    categories: [],
  });

  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-0 lg:min-h-screen lg:max-h-screen lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:border-r-slate-200 lg:shadow-none">
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 lg:px-6",
          isCollapsed ? "lg:justify-center lg:px-2" : "",
        ].join(" ")}
      >
        <h2
          className={[
            "text-base font-semibold text-slate-950",
            isCollapsed ? "lg:sr-only" : "",
          ].join(" ")}
        >
          검색 필터
        </h2>
        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="company-search-fields"
            aria-label={isCollapsed ? "검색 필터 열기" : "검색 필터 접기"}
            title={isCollapsed ? "검색 필터 열기" : "검색 필터 접기"}
            className="p-xl hidden size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:inline-flex"
          >
            <span aria-hidden="true">{isCollapsed ? ">" : "<"}</span>
          </button>
        ) : null}
      </div>
      {isCollapsed ? (
        <div className="hidden py-4 lg:flex lg:flex-col lg:items-center">
          <span className="text-xs font-semibold text-slate-500 [writing-mode:vertical-rl]">
            필터
          </span>
        </div>
      ) : null}
      <div
        id="company-search-fields"
        className={[
          "grid gap-5 p-4 sm:p-5 lg:p-6",
          isCollapsed ? "lg:hidden" : "",
        ].join(" ")}
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              통합 검색
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="업체명, 대표자명, 취급품목"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">지역</span>
            <div
              role="radiogroup"
              aria-label="지역"
              className="grid grid-cols-4 gap-2"
            >
              {[
                { label: "전체", value: "" },
                ...COMPANY_REGIONS.map((value) => ({
                  label: value,
                  value,
                })),
              ].map((option) => {
                const checked = region === option.value;

                return (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setRegion(option.value)}
                    className={[
                      "h-10 rounded-md border px-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                      checked
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsIndustryFilterOpen((current) => !current)}
            aria-expanded={isIndustryFilterOpen}
            aria-controls="company-industry-filter-options"
            className="mb-2 flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="text-sm font-medium text-slate-700">
              업종 필터
            </span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {selectedCategories.length}개 선택
              </span>
              <span
                aria-hidden="true"
                className="inline-flex size-5 items-center justify-center rounded border border-slate-300 text-xs font-semibold text-slate-600"
              >
                {isIndustryFilterOpen ? "v" : ">"}
              </span>
            </span>
          </button>
          <div
            id="company-industry-filter-options"
            className={[
              "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1",
              isIndustryFilterOpen ? "" : "hidden",
            ].join(" ")}
          >
            {COMPANY_CATEGORIES.map((category) => {
              const checked = selectedSet.has(category);

              return (
                <label
                  key={category}
                  className={[
                    "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition",
                    checked
                      ? getSelectedCategoryFilterClassName(category)
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{category}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {categoryCounts.get(category) ?? 0}
                    <input
                      type="checkbox"
                      value={category}
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="size-4 accent-primary"
                    />
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              href={resetHref}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              검색 초기화
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
