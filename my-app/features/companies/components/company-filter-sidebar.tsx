"use client";

import {
  BriefcaseBusiness,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Filter,
  MapPin,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
} from "../data/categories";
import {
  COMPANY_EXECUTIVE_ROLES,
  type CompanyExecutiveRole,
} from "../data/executive-roles";
import { getSelectedCategoryFilterClassName } from "../lib/category-style";
import { getCategoryFacetContextKey } from "../lib/facet-keys";
import { createCompanySearchHref } from "../lib/search-params";
import type {
  CompanyCategory,
  CompanyEmployeeRange,
  CompanyFacetOption,
  CompanyFacets,
  CompanyRegion,
  CompanySearchFilters,
} from "../types";

type CompanyFilterSidebarProps = {
  facets: CompanyFacets;
  filters: CompanySearchFilters;
  idPrefix?: string;
  isMobileDrawer?: boolean;
  onClose?: () => void;
};

const CATEGORY_ORDER_INDEX = new Map(
  COMPANY_CATEGORIES.map((category, index) => [category, index]),
);
const EMPLOYEE_RANGE_ORDER_INDEX = new Map(
  COMPANY_EMPLOYEE_RANGES.map((range, index) => [range.value, index]),
);
const FILTER_NAVIGATION_DEBOUNCE_MS = 250;

function sortCategories(categories: CompanyCategory[]) {
  return [...categories].toSorted((a, b) => {
    const left = CATEGORY_ORDER_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER;
    const right = CATEGORY_ORDER_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER;

    return left - right || a.localeCompare(b, "ko-KR");
  });
}

function sortEmployeeRanges(employeeRanges: CompanyEmployeeRange[]) {
  return [...employeeRanges].toSorted((a, b) => {
    const left = EMPLOYEE_RANGE_ORDER_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER;
    const right = EMPLOYEE_RANGE_ORDER_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER;

    return left - right || a.localeCompare(b, "ko-KR");
  });
}

function mergeCategoryFacetCounts(groups: CompanyFacetOption[][]) {
  const counts = new Map<string, number>();

  for (const group of groups) {
    for (const facet of group) {
      counts.set(facet.value, (counts.get(facet.value) ?? 0) + facet.count);
    }
  }

  return [...counts.entries()].map(([value, count]) => ({ value, count }));
}

function haveSameFilterValues<T>(left: T[], right: T[]) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

export function CompanyFilterSidebar({
  facets,
  filters,
  idPrefix = "company-filter",
  isMobileDrawer = false,
  onClose,
}: CompanyFilterSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const filterNavigationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isExecutiveFilterOpen, setIsExecutiveFilterOpen] = useState(true);
  const [isIndustryFilterOpen, setIsIndustryFilterOpen] = useState(true);
  const [isEmployeeFilterOpen, setIsEmployeeFilterOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(filters.region);
  const [selectedExecutiveOnly, setSelectedExecutiveOnly] = useState(
    filters.executiveOnly,
  );
  const [selectedExecutiveRoles, setSelectedExecutiveRoles] = useState<
    CompanyExecutiveRole[]
  >(() => [...filters.executiveRoles]);
  const [selectedCategories, setSelectedCategories] = useState<
    CompanyCategory[]
  >(() => sortCategories(filters.categories));
  const [selectedEmployeeRanges, setSelectedEmployeeRanges] = useState<
    CompanyEmployeeRange[]
  >(() => sortEmployeeRanges(filters.employeeRanges));

  useEffect(() => {
    return () => {
      if (filterNavigationTimer.current) {
        clearTimeout(filterNavigationTimer.current);
      }
    };
  }, []);

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
  const selectedExecutiveRoleSet = useMemo(
    () => new Set(selectedExecutiveRoles),
    [selectedExecutiveRoles],
  );
  const selectedEmployeeRangeLabel =
    selectedEmployeeRanges.length === 0
      ? "전체"
      : `${selectedEmployeeRanges.length}개 선택`;
  const fieldsId = `${idPrefix}-fields`;
  const executiveOptionsId = `${idPrefix}-executive-options`;
  const industryOptionsId = `${idPrefix}-industry-options`;
  const employeeOptionsId = `${idPrefix}-employee-options`;
  const categoryCounts = useMemo(() => {
    const isDraftContextSynced =
      selectedRegion === filters.region &&
      selectedExecutiveOnly === filters.executiveOnly &&
      haveSameFilterValues(selectedEmployeeRanges, filters.employeeRanges) &&
      haveSameFilterValues(selectedExecutiveRoles, filters.executiveRoles);

    if (isDraftContextSynced) {
      return new Map(
        facets.filteredCategoryCounts.map((facet) => [facet.value, facet.count]),
      );
    }

    const executiveFilterSelected =
      selectedExecutiveOnly || selectedExecutiveRoles.length > 0;
    const roleKey = getCategoryFacetContextKey(
      selectedRegion,
      "",
      selectedExecutiveRoles,
    );
    const getRoleCategoryCounts = (employeeRange: CompanyEmployeeRange | "") =>
      facets.categoriesByExecutiveRoleContext[
        getCategoryFacetContextKey(
          selectedRegion,
          employeeRange,
          selectedExecutiveRoles,
        )
      ] ?? [];
    const hasExactRoleCounts =
      selectedExecutiveRoles.length > 0 &&
      (facets.categoriesByExecutiveRoleContext[roleKey] !== undefined);
    const categoryFacets = selectedRegion
      ? selectedEmployeeRanges.length > 0
        ? mergeCategoryFacetCounts(
            selectedEmployeeRanges.map(
              (employeeRange) =>
                (hasExactRoleCounts
                  ? getRoleCategoryCounts(employeeRange)
                  : executiveFilterSelected
                  ? facets.categoriesByRegionAndEmployeeRangeAndExecutive[
                      selectedRegion
                    ]?.[employeeRange]
                  : facets.categoriesByRegionAndEmployeeRange[selectedRegion]?.[
                      employeeRange
                    ]) ?? [],
            ),
          )
        : hasExactRoleCounts
          ? getRoleCategoryCounts("")
          : executiveFilterSelected
          ? (facets.categoriesByRegionAndExecutive[selectedRegion] ?? [])
          : (facets.categoriesByRegion[selectedRegion] ?? [])
      : selectedEmployeeRanges.length > 0
        ? mergeCategoryFacetCounts(
            selectedEmployeeRanges.map(
              (employeeRange) =>
                (hasExactRoleCounts
                  ? getRoleCategoryCounts(employeeRange)
                  : executiveFilterSelected
                  ? facets.categoriesByEmployeeRangeAndExecutive[employeeRange]
                  : facets.categoriesByEmployeeRange[employeeRange]) ?? [],
            ),
          )
        : hasExactRoleCounts
          ? getRoleCategoryCounts("")
          : executiveFilterSelected
          ? facets.categoriesByExecutive
          : facets.categories;

    return new Map(categoryFacets.map((facet) => [facet.value, facet.count]));
  }, [
    facets.categories,
    facets.categoriesByExecutive,
    facets.categoriesByEmployeeRange,
    facets.categoriesByEmployeeRangeAndExecutive,
    facets.categoriesByRegion,
    facets.categoriesByRegionAndExecutive,
    facets.categoriesByRegionAndEmployeeRange,
    facets.categoriesByRegionAndEmployeeRangeAndExecutive,
    facets.categoriesByExecutiveRoleContext,
    facets.filteredCategoryCounts,
    filters.employeeRanges,
    filters.executiveOnly,
    filters.executiveRoles,
    selectedEmployeeRanges,
    selectedExecutiveRoles,
    selectedExecutiveOnly,
    selectedRegion,
    filters.region,
  ]);
  const executiveRoleCounts = useMemo(() => {
    const isDraftContextSynced =
      selectedRegion === filters.region &&
      selectedExecutiveOnly === filters.executiveOnly &&
      haveSameFilterValues(selectedEmployeeRanges, filters.employeeRanges) &&
      haveSameFilterValues(selectedCategories, filters.categories);

    if (isDraftContextSynced) {
      return new Map(
        facets.filteredExecutiveRoleCounts.map((facet) => [
          facet.value,
          facet.count,
        ]),
      );
    }

    const roleFacets = selectedRegion
      ? selectedEmployeeRanges.length > 0
        ? mergeCategoryFacetCounts(
            selectedEmployeeRanges.map(
              (employeeRange) =>
                facets.executiveRolesByRegionAndEmployeeRange[selectedRegion]?.[
                  employeeRange
                ] ?? [],
            ),
          )
        : (facets.executiveRolesByRegion[selectedRegion] ?? [])
      : selectedEmployeeRanges.length > 0
        ? mergeCategoryFacetCounts(
            selectedEmployeeRanges.map(
              (employeeRange) =>
                facets.executiveRolesByEmployeeRange[employeeRange] ?? [],
            ),
          )
        : facets.executiveRoles;

    return new Map(roleFacets.map((facet) => [facet.value, facet.count]));
  }, [
    facets.executiveRoles,
    facets.executiveRolesByEmployeeRange,
    facets.executiveRolesByRegion,
    facets.executiveRolesByRegionAndEmployeeRange,
    facets.filteredExecutiveRoleCounts,
    filters.categories,
    filters.employeeRanges,
    filters.executiveOnly,
    selectedEmployeeRanges,
    selectedCategories,
    selectedExecutiveOnly,
    selectedRegion,
    filters.region,
  ]);
  const executiveCount = useMemo(() => {
    const isDraftContextSynced =
      selectedRegion === filters.region &&
      haveSameFilterValues(selectedEmployeeRanges, filters.employeeRanges) &&
      haveSameFilterValues(selectedCategories, filters.categories);

    if (isDraftContextSynced) {
      return facets.filteredExecutiveCount;
    }

    if (selectedRegion) {
      if (selectedEmployeeRanges.length > 0) {
        return selectedEmployeeRanges.reduce(
          (count, employeeRange) =>
            count +
            (facets.executiveCountByRegionAndEmployeeRange[selectedRegion]?.[
              employeeRange
            ] ?? 0),
          0,
        );
      }

      return facets.executiveCountByRegion[selectedRegion] ?? 0;
    }

    if (selectedEmployeeRanges.length > 0) {
      return selectedEmployeeRanges.reduce(
        (count, employeeRange) =>
          count + (facets.executiveCountByEmployeeRange[employeeRange] ?? 0),
        0,
      );
    }

    return facets.executiveCount;
  }, [
    facets.executiveCount,
    facets.executiveCountByEmployeeRange,
    facets.executiveCountByRegion,
    facets.executiveCountByRegionAndEmployeeRange,
    facets.filteredExecutiveCount,
    filters.categories,
    filters.employeeRanges,
    selectedEmployeeRanges,
    selectedCategories,
    selectedRegion,
    filters.region,
  ]);

  type CompanyFilterPatch = Parameters<typeof createCompanySearchHref>[1];

  function navigateWithFilters(patch: CompanyFilterPatch) {
    const nextPatch: CompanyFilterPatch = {
      region: patch.region ?? selectedRegion,
      executiveOnly: patch.executiveOnly ?? selectedExecutiveOnly,
      executiveRoles: patch.executiveRoles ?? selectedExecutiveRoles,
      categories: patch.categories ?? selectedCategories,
      employeeRanges: patch.employeeRanges ?? selectedEmployeeRanges,
      ...patch,
      page: 1,
    };
    const href = createCompanySearchHref(filters, {
      ...nextPatch,
    });

    if (filterNavigationTimer.current) {
      clearTimeout(filterNavigationTimer.current);
    }

    filterNavigationTimer.current = setTimeout(() => {
      startTransition(() => {
        // This is a same-route filter update. Updating the URL through the
        // native History API keeps the root layout (and its PWA <head> tags)
        // mounted; refresh then requests only the new server component data.
        window.history.replaceState(null, "", href);
        router.refresh();
      });
    }, FILTER_NAVIGATION_DEBOUNCE_MS);
  }

  function updateRegion(nextRegion: CompanyRegion | "") {
    if (nextRegion === selectedRegion) {
      return;
    }

    setSelectedRegion(nextRegion);
    navigateWithFilters({ region: nextRegion });
  }

  function toggleCategory(category: CompanyCategory) {
    const nextCategories = sortCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((value) => value !== category)
        : [...selectedCategories, category],
    );

    setSelectedCategories(nextCategories);
    navigateWithFilters({ categories: nextCategories });
  }

  function resetCategories() {
    setSelectedCategories([]);
    navigateWithFilters({ categories: [] });
  }

  function toggleEmployeeRange(employeeRange: CompanyEmployeeRange) {
    const nextEmployeeRanges = sortEmployeeRanges(
      selectedEmployeeRanges.includes(employeeRange)
        ? selectedEmployeeRanges.filter((value) => value !== employeeRange)
        : [...selectedEmployeeRanges, employeeRange],
    );

    setSelectedEmployeeRanges(nextEmployeeRanges);
    navigateWithFilters({ employeeRanges: nextEmployeeRanges });
  }

  function resetEmployeeRanges() {
    setSelectedEmployeeRanges([]);
    navigateWithFilters({ employeeRanges: [] });
  }

  function toggleExecutiveRole(role: CompanyExecutiveRole) {
    const nextRoles = selectedExecutiveRoles.includes(role)
      ? selectedExecutiveRoles.filter((value) => value !== role)
      : [...selectedExecutiveRoles, role];

    setSelectedExecutiveRoles(nextRoles);
    setSelectedExecutiveOnly(true);
    navigateWithFilters({
      executiveOnly: true,
      executiveRoles: nextRoles,
    });
  }

  function selectAllExecutives() {
    const shouldClearExecutiveFilter =
      selectedExecutiveOnly && selectedExecutiveRoles.length === 0;
    const nextExecutiveOnly = !shouldClearExecutiveFilter;

    setSelectedExecutiveOnly(nextExecutiveOnly);
    setSelectedExecutiveRoles([]);
    navigateWithFilters({
      executiveOnly: nextExecutiveOnly,
      executiveRoles: [],
    });
  }

  function resetFilters() {
    setSelectedRegion("");
    setSelectedExecutiveOnly(false);
    setSelectedExecutiveRoles([]);
    setSelectedCategories([]);
    setSelectedEmployeeRanges([]);
    navigateWithFilters({
      region: "",
      executiveOnly: false,
      executiveRoles: [],
      categories: [],
      employeeRanges: [],
    });
  }

  return (
    <aside
      aria-busy={isPending}
      className={[
        "scrollbar-hidden bg-white",
        isMobileDrawer
          ? "h-full overflow-y-auto border-r border-slate-200 shadow-xl"
          : "rounded-xl border border-slate-200 shadow-[0_8px_24px_rgb(15_23_42_/_0.08)] lg:sticky lg:top-5 lg:min-h-[calc(100svh-128px)] lg:max-h-[calc(100svh-128px)] lg:overflow-y-auto",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
        <div className="contents">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-950">
          <Filter className="size-5 text-primary" aria-hidden="true" />
          필터
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          필터 초기화
        </button>
        </div>
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

      <div id={fieldsId} className="grid gap-5 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPin className="size-4 text-slate-500" aria-hidden="true" />
            <span>지역</span>
          </div>
          <div
            role="radiogroup"
            aria-label="지역"
            className="grid grid-cols-4 gap-2"
          >
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
            onClick={() => setIsExecutiveFilterOpen((current) => !current)}
            aria-expanded={isExecutiveFilterOpen}
            aria-controls={executiveOptionsId}
            className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <BadgeCheck className="size-4 text-slate-500" aria-hidden="true" />
              <span>임·의원사</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {selectedExecutiveRoles.length === 0
                  ? "전체"
                  : `${selectedExecutiveRoles.length}개 선택`}
              </span>
              {isExecutiveFilterOpen ? (
                <ChevronDown className="size-4 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4 text-slate-600" aria-hidden="true" />
              )}
            </span>
          </button>
          <div
            id={executiveOptionsId}
            className={["grid gap-2", isExecutiveFilterOpen ? "" : "hidden"].join(" ")}
          >
          <button
            type="button"
            aria-pressed={
              selectedExecutiveOnly && selectedExecutiveRoles.length === 0
            }
            onClick={selectAllExecutives}
            className={[
              "flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition",
              selectedExecutiveOnly && selectedExecutiveRoles.length === 0
                ? "border-primary bg-primary text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            <span className="min-w-0 truncate">전체</span>
            <span className="flex items-center gap-2 text-xs">
              <span
                className={
                  selectedExecutiveOnly && selectedExecutiveRoles.length === 0
                    ? "text-white/80"
                    : "text-slate-500"
                }
              >
                {executiveCount}
              </span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            {COMPANY_EXECUTIVE_ROLES.map((role) => {
              const checked = selectedExecutiveRoleSet.has(role);
              const count = executiveRoleCounts.get(role) ?? 0;

              return (
                <label
                  key={role}
                  className={[
                    "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition",
                    checked
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{role}</span>
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      className={
                        checked ? "text-white/80" : "text-slate-500"
                      }
                    >
                      {count}
                    </span>
                    <input
                      type="checkbox"
                      value={role}
                      checked={checked}
                      onChange={() => toggleExecutiveRole(role)}
                      className="size-4 accent-primary"
                    />
                  </span>
                </label>
              );
            })}
          </div>
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
                {selectedCategories.length === 0
                  ? "전체"
                  : `${selectedCategories.length}개 선택`}
              </span>
              {isIndustryFilterOpen ? (
                <ChevronDown
                  className="size-4 text-slate-600"
                  aria-hidden="true"
                />
              ) : (
                <ChevronRight
                  className="size-4 text-slate-600"
                  aria-hidden="true"
                />
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
            <button
              type="button"
              aria-pressed={selectedCategories.length === 0}
              onClick={resetCategories}
              className={[
                "flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition",
                selectedCategories.length === 0
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              <span className="min-w-0 truncate">전체</span>
            </button>
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
                <ChevronDown
                  className="size-4 text-slate-600"
                  aria-hidden="true"
                />
              ) : (
                <ChevronRight
                  className="size-4 text-slate-600"
                  aria-hidden="true"
                />
              )}
            </span>
          </button>
          <div
            id={employeeOptionsId}
            aria-label="근로자수"
            className={[
              "grid grid-cols-2 gap-2",
              isEmployeeFilterOpen ? "" : "hidden",
            ].join(" ")}
          >
            <button
              type="button"
              aria-pressed={selectedEmployeeRanges.length === 0}
              onClick={resetEmployeeRanges}
              className={[
                "h-10 rounded-md border px-3 text-sm text-left font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                selectedEmployeeRanges.length === 0
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              전체
            </button>
            {COMPANY_EMPLOYEE_RANGES.map((option) => {
              const checked = selectedEmployeeRanges.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={[
                    "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition",
                    checked
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={checked}
                    onChange={() => toggleEmployeeRange(option.value)}
                    className="size-4 accent-primary"
                  />
                </label>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
}
