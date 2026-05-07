"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Filter,
  MapPin,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
} from "../data/categories";
import { getSelectedCategoryFilterClassName } from "../lib/category-style";
import { createCompanySearchHref } from "../lib/search-params";
import type {
  CompanyCategory,
  CompanyEmployeeRange,
  CompanyFacets,
  CompanyRegion,
  CompanySearchFilters,
} from "../types";

type CompanyFilterSidebarProps = {
  facets: CompanyFacets;
  filters: CompanySearchFilters;
  idPrefix?: string;
  isCollapsed?: boolean;
  isMobileDrawer?: boolean;
  onClose?: () => void;
  onToggleCollapsed?: () => void;
};

export function CompanyFilterSidebar({
  facets,
  filters,
  idPrefix = "company-filter",
  isCollapsed = false,
  isMobileDrawer = false,
  onClose,
  onToggleCollapsed,
}: CompanyFilterSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isIndustryFilterOpen, setIsIndustryFilterOpen] = useState(true);
  const [isEmployeeFilterOpen, setIsEmployeeFilterOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(filters.region);
  const [selectedCategories, setSelectedCategories] = useState<
    CompanyCategory[]
  >(filters.categories);
  const [selectedEmployeeRange, setSelectedEmployeeRange] = useState<
    CompanyEmployeeRange | ""
  >(filters.employeeRange);

  const regionOptions = useMemo<
    Array<{ label: string; value: CompanyRegion | "" }>
  >(
    () => [
      { label: "전체", value: "" },
      ...COMPANY_REGIONS.map((value) => ({
        label: value,
        value,
      })),
    ],
    [],
  );

  const selectedSet = useMemo(
    () => new Set(selectedCategories),
    [selectedCategories],
  );
  const selectedEmployeeRangeLabel =
    COMPANY_EMPLOYEE_RANGES.find(
      (option) => option.value === selectedEmployeeRange,
    )?.label ?? "전체";
  const fieldsId = `${idPrefix}-fields`;
  const industryOptionsId = `${idPrefix}-industry-options`;
  const employeeOptionsId = `${idPrefix}-employee-options`;

  const categoryCounts = useMemo(() => {
    const categoryFacets = selectedRegion
      ? facets.categoriesByRegion[selectedRegion] ?? []
      : facets.categories;

    return new Map(categoryFacets.map((facet) => [facet.value, facet.count]));
  }, [facets.categories, facets.categoriesByRegion, selectedRegion]);

  function applyFilters(
    nextRegion: CompanyRegion | "",
    nextCategories: CompanyCategory[],
    nextEmployeeRange: CompanyEmployeeRange | "",
  ) {
    const href = createCompanySearchHref(filters, {
      region: nextRegion,
      categories: nextCategories,
      employeeRange: nextEmployeeRange,
      page: 1,
    });

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function updateRegion(nextRegion: CompanyRegion | "") {
    setSelectedRegion(nextRegion);
    applyFilters(nextRegion, selectedCategories, selectedEmployeeRange);
  }

  function toggleCategory(category: CompanyCategory) {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((value) => value !== category)
      : [...selectedCategories, category];

    setSelectedCategories(nextCategories);
    applyFilters(selectedRegion, nextCategories, selectedEmployeeRange);
  }

  function updateEmployeeRange(nextEmployeeRange: CompanyEmployeeRange | "") {
    setSelectedEmployeeRange(nextEmployeeRange);
    applyFilters(selectedRegion, selectedCategories, nextEmployeeRange);
  }

  const resetHref = createCompanySearchHref(filters, {
    region: "",
    categories: [],
    employeeRange: "",
    page: 1,
  });

  return (
    <aside
      aria-busy={isPending}
      className={[
        "bg-white",
        isMobileDrawer
          ? "h-full overflow-y-auto border-r border-slate-200 shadow-xl"
          : "rounded-lg border border-slate-200 shadow-sm lg:sticky lg:top-0 lg:min-h-screen lg:max-h-screen lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:border-r-slate-200 lg:shadow-none",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 lg:px-6",
          isCollapsed ? "lg:justify-center lg:px-2" : "",
        ].join(" ")}
      >
        <h2
          className={[
            "inline-flex items-center gap-2 text-base font-semibold text-slate-950",
            isCollapsed ? "lg:sr-only" : "",
          ].join(" ")}
        >
          <Filter className="size-5 text-primary" aria-hidden="true" />
          필터
        </h2>
        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls={fieldsId}
            aria-label={isCollapsed ? "필터 열기" : "필터 접기"}
            title={isCollapsed ? "필터 열기" : "필터 접기"}
            className="hidden size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:inline-flex"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4 rotate-90" aria-hidden="true" />
            )}
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="필터 닫기"
            title="필터 닫기"
            className="inline-flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:hidden"
          >
            <X className="size-4" aria-hidden="true" />
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
        id={fieldsId}
        className={[
          "grid gap-5 p-4 sm:p-5 lg:p-6",
          isCollapsed ? "lg:hidden" : "",
        ].join(" ")}
      >
        <div className="grid gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPin className="size-4 text-slate-500" aria-hidden="true" />
            <span>지역</span>
          </div>
          <div role="radiogroup" aria-label="지역" className="grid grid-cols-4 gap-2">
            {regionOptions.map((option) => {
              const checked = selectedRegion === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => updateRegion(option.value)}
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
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setIsIndustryFilterOpen((current) => !current)}
            aria-expanded={isIndustryFilterOpen}
            aria-controls={industryOptionsId}
            className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <BriefcaseBusiness
                className="size-4 text-slate-500"
                aria-hidden="true"
              />
              업종 필터
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {selectedCategories.length}개 선택
              </span>
              {isIndustryFilterOpen ? (
                <ChevronDown className="size-4 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4 text-slate-600" aria-hidden="true" />
              )}
            </span>
          </button>

          <div
            id={industryOptionsId}
            className={[
              "grid grid-cols-2 gap-2",
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
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setIsEmployeeFilterOpen((current) => !current)}
            aria-expanded={isEmployeeFilterOpen}
            aria-controls={employeeOptionsId}
            className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Users className="size-4 text-slate-500" aria-hidden="true" />
              근로자수
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {selectedEmployeeRangeLabel}
              </span>
              {isEmployeeFilterOpen ? (
                <ChevronDown className="size-4 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4 text-slate-600" aria-hidden="true" />
              )}
            </span>
          </button>
          <div
            id={employeeOptionsId}
            role="radiogroup"
            aria-label="근로자수"
            className={[
              "grid grid-cols-2 gap-2",
              isEmployeeFilterOpen ? "" : "hidden",
            ].join(" ")}
          >
            <button
              type="button"
              role="radio"
              aria-checked={!selectedEmployeeRange}
              onClick={() => updateEmployeeRange("")}
              className={[
                "h-10 rounded-md border px-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                !selectedEmployeeRange
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              전체
            </button>
            {COMPANY_EMPLOYEE_RANGES.map((option) => {
              const checked = selectedEmployeeRange === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => updateEmployeeRange(option.value)}
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
        </div>

        <div className="flex justify-end">
          <Link
            href={resetHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span>필터 초기화</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
