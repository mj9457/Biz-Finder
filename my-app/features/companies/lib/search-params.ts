import {
  CERTIFICATION_STATUSES,
  COMPANY_CATEGORIES,
  COMPANY_REGIONS,
  COMPANY_SORTS,
} from "../data/categories";
import type {
  CertificationStatus,
  CompanyCategory,
  CompanyRegion,
  CompanySearchFilters,
  CompanySort,
  CompanyView,
} from "../types";

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const DEFAULT_PAGE_SIZE = 6;
export const DEFAULT_COMPANY_VIEW: CompanyView = "table";

const categorySet = new Set<string>(COMPANY_CATEGORIES);
const regionSet = new Set<string>(COMPANY_REGIONS);
const certificationStatusSet = new Set<string>(CERTIFICATION_STATUSES);
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

function parseCertificationStatus(value: string | string[] | undefined) {
  const status = compactText(value);
  return certificationStatusSet.has(status)
    ? (status as CertificationStatus)
    : "";
}

function parseSort(value: string | string[] | undefined): CompanySort {
  const sort = firstValue(value);
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
  return {
    q:
      compactText(params.q) ||
      compactText(params.name) ||
      compactText(params.representative) ||
      compactText(params.product),
    region: parseRegion(params.region),
    certificationStatus: parseCertificationStatus(params.certification),
    categories: parseCategories(params.category),
    sort: parseSort(params.sort),
    view: parseView(params.view),
    page: parsePage(params.page),
    pageSize: DEFAULT_PAGE_SIZE,
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
  if (nextFilters.q) params.set("q", nextFilters.q);
  if (nextFilters.region) params.set("region", nextFilters.region);
  if (nextFilters.certificationStatus) {
    params.set("certification", nextFilters.certificationStatus);
  }
  for (const category of nextFilters.categories) {
    params.append("category", category);
  }
  if (nextFilters.sort !== "relevance") params.set("sort", nextFilters.sort);
  if (nextFilters.view !== DEFAULT_COMPANY_VIEW) params.set("view", nextFilters.view);
  if (nextFilters.page > 1) params.set("page", String(nextFilters.page));

  const query = params.toString();
  return query ? `/companies?${query}` : "/companies";
}

export function hasActiveCompanyFilters(filters: CompanySearchFilters) {
  return Boolean(
    filters.q ||
      filters.region ||
      filters.certificationStatus ||
      filters.categories.length > 0,
  );
}
