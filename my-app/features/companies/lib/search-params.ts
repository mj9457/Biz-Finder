import {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
  COMPANY_SORTS,
} from "../data/categories";
import type {
  CompanyCategory,
  CompanyEmployeeRange,
  CompanyRegion,
  CompanySearchFilters,
  CompanySort,
  CompanyView,
} from "../types";

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CARD_PAGE_SIZE = 6;
export const DEFAULT_COMPANY_VIEW: CompanyView = "table";

const categorySet = new Set<string>(COMPANY_CATEGORIES);
const employeeRangeSet = new Set<string>(
  COMPANY_EMPLOYEE_RANGES.map((range) => range.value),
);
const regionSet = new Set<string>(COMPANY_REGIONS);
const sortSet = new Set<string>(COMPANY_SORTS);

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function values(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function compactText(value: string | string[] | undefined) {
  return firstValue(value).trim();
}

function parseCategories(value: string | string[] | undefined) {
  return values(value)
    .map((category) => category.trim())
    .filter((category): category is CompanyCategory => categorySet.has(category));
}

function parseRegion(value: string | string[] | undefined) {
  const region = compactText(value);
  return regionSet.has(region) ? (region as CompanyRegion) : "";
}

function parseEmployeeRanges(value: string | string[] | undefined) {
  const parsedEmployeeRanges: CompanyEmployeeRange[] = [];
  const seen = new Set<CompanyEmployeeRange>();

  for (const employeeRange of values(value)) {
    const normalizedEmployeeRange = employeeRange.trim();

    if (!employeeRangeSet.has(normalizedEmployeeRange)) {
      continue;
    }

    const typedEmployeeRange = normalizedEmployeeRange as CompanyEmployeeRange;

    if (seen.has(typedEmployeeRange)) {
      continue;
    }

    seen.add(typedEmployeeRange);
    parsedEmployeeRanges.push(typedEmployeeRange);
  }

  return parsedEmployeeRanges;
}

function parseSort(value: string | string[] | undefined): CompanySort {
  const sort = firstValue(value);

  if (sort === "name") {
    return "name-asc";
  }

  return sortSet.has(sort) ? (sort as CompanySort) : "relevance";
}

function parseView(value: string | string[] | undefined): CompanyView {
  return firstValue(value) === "card" ? "card" : DEFAULT_COMPANY_VIEW;
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstValue(value), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parseCompanySearchParams(
  params: RawSearchParams,
): CompanySearchFilters {
  const view = parseView(params.view);

  return {
    q:
      compactText(params.q) ||
      compactText(params.name) ||
      compactText(params.representative) ||
      compactText(params.product),
    region: parseRegion(params.region),
    categories: parseCategories(params.category),
    employeeRanges: parseEmployeeRanges(params.employees),
    sort: parseSort(params.sort),
    view,
    page: parsePage(params.page),
    pageSize: view === "card" ? DEFAULT_CARD_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  };
}

export function createCompanySearchHref(
  filters: CompanySearchFilters,
  patch: Partial<
    Omit<CompanySearchFilters, "pageSize" | "categories"> & {
      categories: CompanyCategory[];
    }
  >,
) {
  const nextFilters: CompanySearchFilters = {
    ...filters,
    ...patch,
    page: patch.page ?? 1,
  };

  const params = new URLSearchParams();
  appendCompanyFilterParams(params, nextFilters);
  if (nextFilters.view !== DEFAULT_COMPANY_VIEW) params.set("view", nextFilters.view);
  if (nextFilters.page > 1) params.set("page", String(nextFilters.page));

  const query = params.toString();
  return query ? `/companies?${query}` : "/companies";
}

function appendCompanyFilterParams(
  params: URLSearchParams,
  filters: CompanySearchFilters,
) {
  if (filters.q) params.set("q", filters.q);
  if (filters.region) params.set("region", filters.region);
  for (const category of filters.categories) {
    params.append("category", category);
  }
  for (const employeeRange of filters.employeeRanges) {
    params.append("employees", employeeRange);
  }
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
}

export function createCompanyExportSearchParams(
  filters: CompanySearchFilters,
) {
  const params = new URLSearchParams();
  appendCompanyFilterParams(params, filters);
  return params;
}

export function hasActiveCompanyFilters(filters: CompanySearchFilters) {
  return Boolean(
    filters.q ||
      filters.region ||
      filters.employeeRanges.length > 0 ||
      filters.categories.length > 0,
  );
}
