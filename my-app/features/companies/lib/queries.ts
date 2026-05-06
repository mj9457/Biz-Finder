import "server-only";

import { cache } from "react";

import {
  CERTIFICATION_STATUSES,
  COMPANY_CATEGORIES,
  COMPANY_REGIONS,
} from "../data/categories";
import { companies } from "../data/companies";
import type {
  Company,
  CompanyFacetOption,
  CompanyFacets,
  CompanySearchFilters,
  CompanySearchResult,
} from "../types";

function includesText(source: string, keyword: string) {
  return source.toLocaleLowerCase("ko-KR").includes(keyword);
}

function scoreCompany(company: Company, filters: CompanySearchFilters) {
  let score = 0;

  const keyword = filters.q.toLocaleLowerCase("ko-KR");

  if (!keyword) {
    return score;
  }

  if (includesText(company.name, keyword)) score += 8;
  if (includesText(company.representative, keyword)) score += 6;
  if (includesText(company.mainProduct, keyword)) score += 5;
  if (company.products.some((value) => includesText(value, keyword))) score += 4;
  if (company.tags.some((value) => includesText(value, keyword))) score += 2;
  if (includesText(company.description, keyword)) score += 1;

  return score;
}

function matchesCompany(company: Company, filters: CompanySearchFilters) {
  const keyword = filters.q.toLocaleLowerCase("ko-KR");

  if (
    keyword &&
    ![
      company.name,
      company.representative,
      company.mainProduct,
      company.description,
      ...company.products,
      ...company.tags,
    ].some((value) => includesText(value, keyword))
  ) {
    return false;
  }

  if (filters.region && company.region !== filters.region) {
    return false;
  }

  if (
    filters.certificationStatus &&
    company.certificationStatus !== filters.certificationStatus
  ) {
    return false;
  }

  if (
    filters.categories.length > 0 &&
    !filters.categories.some((category) => company.categories.includes(category))
  ) {
    return false;
  }

  return true;
}

function sortCompanies(
  items: Company[],
  filters: CompanySearchFilters,
  scores: Map<string, number>,
) {
  return items.toSorted((a, b) => {
    if (filters.sort === "name") {
      return a.name.localeCompare(b.name, "ko-KR");
    }

    if (filters.sort === "employees") {
      return b.employees - a.employees;
    }

    return (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
  });
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .toSorted((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function countByOptions(options: readonly string[], values: string[]) {
  const counts = new Map<string, number>(options.map((option) => [option, 0]));

  for (const value of values) {
    if (counts.has(value)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return options.map((value) => ({ value, count: counts.get(value) ?? 0 }));
}

export const searchCompanies = cache(
  async (filters: CompanySearchFilters): Promise<CompanySearchResult> => {
    const scores = new Map<string, number>();
    const filtered = companies.filter((company) => {
      const score = scoreCompany(company, filters);
      scores.set(company.id, score);
      return matchesCompany(company, filters);
    });

    const sorted = sortCompanies(filtered, filters, scores);
    const totalPages = Math.max(1, Math.ceil(sorted.length / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * filters.pageSize;

    return {
      items: sorted.slice(start, start + filters.pageSize),
      total: sorted.length,
      page,
      pageSize: filters.pageSize,
      totalPages,
    };
  },
);

export const getCompanyById = cache(async (id: string) => {
  return companies.find((company) => company.id === id) ?? null;
});

export const getCompanyFacets = cache(async (): Promise<CompanyFacets> => {
  const categoryCounts = new Map<string, number>(
    COMPANY_CATEGORIES.map((category) => [category, 0]),
  );

  for (const company of companies) {
    for (const category of company.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  const categories: CompanyFacetOption[] = [...categoryCounts.entries()].map(
    ([value, count]) => ({ value, count }),
  );

  return {
    regions: countByOptions(
      COMPANY_REGIONS,
      companies.map((company) => company.region),
    ),
    industries: countBy(companies.map((company) => company.industry)),
    categories,
    certificationStatuses: countByOptions(
      CERTIFICATION_STATUSES,
      companies.map((company) => company.certificationStatus),
    ),
  };
});

export const getCompanyDirectoryStats = cache(async () => {
  return {
    totalCompanies: companies.length,
    totalRegions: new Set(companies.map((company) => company.region)).size,
    totalCategories: COMPANY_CATEGORIES.length,
  };
});
