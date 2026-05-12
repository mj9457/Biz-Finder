import "server-only";

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

import { supabase } from "@/lib/supabase";
import {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
  INDUSTRY_CHAMBER_CATEGORY_MAP,
} from "../data/categories";
import type {
  Company,
  CompanyCategory,
  CompanyFacets,
  CompanySearchFilters,
  CompanySearchResult,
} from "../types";

type CompanyRow = {
  id: number;
  created_at: string;
  business_number: string | null;
  company_type: string | null;
  location: string | null;
  industry_chamber: string | null;
  industry_code: string | null;
  standard_industry: string | null;
  company_name: string | null;
  ceo_name: string | null;
  position: string | null;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  employee_count: number | null;
  main_products: string | null;
  is_closed: string | null;
  dm_excluded: string | null;
  established_date: string | null;
  member_type_2026: string | null;
  website: string | null;
  description: string | null;
  tags: string | null;
};

const SUPABASE_PAGE_LIMIT = 10_000;
const COMPANY_CACHE_REVALIDATE_SECONDS = 300;
const COMPANY_CACHE_REVALIDATE_MS = COMPANY_CACHE_REVALIDATE_SECONDS * 1000;
const COMPANY_FILE_CACHE_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "companies-directory.json",
);
const COMPANY_SELECT_COLUMNS = [
  "id",
  "business_number",
  "company_type",
  "location",
  "industry_chamber",
  "industry_code",
  "standard_industry",
  "company_name",
  "ceo_name",
  "address",
  "phone",
  "email",
  "employee_count",
  "main_products",
  "established_date",
  "website",
  "description",
  "tags",
].join(",");
const industryChamberCategoryEntries = Object.entries(
  INDUSTRY_CHAMBER_CATEGORY_MAP,
) as Array<[string, CompanyCategory]>;

function includesText(source: string, keyword: string) {
  return source.toLocaleLowerCase("ko-KR").includes(keyword);
}

function splitTextList(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,/|·\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRegion(location: string | null, address: string | null) {
  const source = `${location ?? ""} ${address ?? ""}`;

  for (const region of COMPANY_REGIONS) {
    if (source.includes(region)) {
      return region;
    }
  }

  return location?.trim() ?? "";
}

function compactIndustryName(value: string) {
  return value.replace(/[\s·ㆍ/(),.-]+/g, "");
}

function normalizeIndustryChamberCategory(value: string | null) {
  const industryChamber = value?.trim();

  if (!industryChamber) {
    return null;
  }

  const exactCategory =
    INDUSTRY_CHAMBER_CATEGORY_MAP[
      industryChamber as keyof typeof INDUSTRY_CHAMBER_CATEGORY_MAP
    ];

  if (exactCategory) {
    return exactCategory;
  }

  const compactValue = compactIndustryName(industryChamber);
  const matchedEntry = industryChamberCategoryEntries.find(
    ([source]) => compactIndustryName(source) === compactValue,
  );

  return matchedEntry?.[1] ?? null;
}

function normalizeCategories(row: CompanyRow) {
  const industryChamberCategory = normalizeIndustryChamberCategory(
    row.industry_chamber,
  );

  if (industryChamberCategory) {
    return [industryChamberCategory];
  }

  const source = [
    row.company_type,
    row.industry_chamber,
    row.standard_industry,
    row.industry_code,
  ]
    .filter(Boolean)
    .join(" ");

  const categories = COMPANY_CATEGORIES.filter((category) =>
    source.includes(category),
  );

  if (categories.length > 0) {
    return categories;
  }

  if (source.includes("제조")) return ["제조"];
  if (
    source.includes("유통") ||
    source.includes("도매") ||
    source.includes("소매")
  ) {
    return ["유통"];
  }
  if (source.includes("건설")) {
    return ["건설"];
  }
  if (source.includes("부동산") || source.includes("임대")) {
    return ["부동산 & 임대"];
  }
  if (source.includes("운수") || source.includes("물류") || source.includes("창고")) {
    return ["운수"];
  }
  if (source.includes("숙박") || source.includes("음식점")) {
    return ["숙박 & 음식점"];
  }
  if (
    source.includes("환경") ||
    source.includes("폐기물") ||
    source.includes("원료재생")
  ) {
    return ["환경"];
  }
  if (source.includes("광업")) return ["광"];
  if (source.includes("금융") || source.includes("보험")) return ["금융 & 보험"];
  if (
    source.includes("방송") ||
    source.includes("통신") ||
    source.includes("정보서비스") ||
    source.includes("출판") ||
    source.includes("영상")
  ) {
    return ["방송통신"];
  }
  if (
    source.includes("전기") ||
    source.includes("가스") ||
    source.includes("증기") ||
    source.includes("수도")
  ) {
    return ["전기 & 수도"];
  }
  if (
    source.includes("서비스") ||
    source.includes("전문") ||
    source.includes("과학") ||
    source.includes("기술") ||
    source.includes("사업지원") ||
    source.includes("사업시설관리")
  ) {
    return ["서비스"];
  }

  return source ? ["기타"] : [];
}

function mapCompany(row: CompanyRow): Company {
  const products = splitTextList(row.main_products);
  const categories = normalizeCategories(row) as CompanyCategory[];
  const region = normalizeRegion(row.location, row.address);
  const industry =
    row.standard_industry ??
    row.industry_chamber ??
    row.industry_code ??
    row.company_type ??
    "";

  return {
    id: String(row.id),
    name: row.company_name ?? "",
    representative: row.ceo_name ?? "",
    region,
    district: "",
    industry,
    industryChamber: row.industry_chamber ?? "",
    mainProduct: row.main_products ?? "",
    products,
    categories,
    foundedDate: row.established_date ?? "",
    employees: row.employee_count ?? 0,
    revenueBand: "",
    registrationNumber: row.business_number ?? "",
    address: row.address ?? "",
    contact: row.email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? undefined,
    description: row.description ?? "",
    tags: splitTextList(row.tags),
  };
}

let companiesMemoryCache:
  | {
      data: Company[];
      expiresAt: number;
    }
  | null = null;
let companiesLoadPromise: Promise<Company[]> | null = null;

async function readCompaniesFromFileCache() {
  try {
    const fileStat = await stat(COMPANY_FILE_CACHE_PATH);

    if (Date.now() - fileStat.mtimeMs > COMPANY_CACHE_REVALIDATE_MS) {
      return null;
    }

    const content = await readFile(COMPANY_FILE_CACHE_PATH, "utf8");
    const data = JSON.parse(content) as Company[];

    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

async function writeCompaniesToFileCache(data: Company[]) {
  await mkdir(path.dirname(COMPANY_FILE_CACHE_PATH), { recursive: true });
  await writeFile(COMPANY_FILE_CACHE_PATH, JSON.stringify(data), "utf8");
}

async function loadCompaniesFromSupabase() {
  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_SELECT_COLUMNS)
    .order("id", { ascending: true })
    .range(0, SUPABASE_PAGE_LIMIT - 1);

  if (error) {
    throw new Error(`Failed to load companies from Supabase: ${error.message}`);
  }

  return ((data ?? []) as unknown as CompanyRow[]).map(mapCompany);
}

const getCompanies = cache(async () => {
  const now = Date.now();

  if (companiesMemoryCache && companiesMemoryCache.expiresAt > now) {
    return companiesMemoryCache.data;
  }

  const fileCache = await readCompaniesFromFileCache();

  if (fileCache) {
    companiesMemoryCache = {
      data: fileCache,
      expiresAt: now + COMPANY_CACHE_REVALIDATE_MS,
    };
    return fileCache;
  }

  companiesLoadPromise ??= loadCompaniesFromSupabase()
    .then((data) => {
      companiesMemoryCache = {
        data,
        expiresAt: Date.now() + COMPANY_CACHE_REVALIDATE_MS,
      };
      void writeCompaniesToFileCache(data).catch(() => undefined);
      return data;
    })
    .finally(() => {
      companiesLoadPromise = null;
    });

  return companiesLoadPromise;
});

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

function matchesEmployeeRange(company: Company, filters: CompanySearchFilters) {
  if (!filters.employeeRange) {
    return true;
  }

  const range = COMPANY_EMPLOYEE_RANGES.find(
    (option) => option.value === filters.employeeRange,
  );

  if (!range) {
    return true;
  }

  if ("min" in range && company.employees < range.min) {
    return false;
  }

  if ("max" in range && company.employees > range.max) {
    return false;
  }

  return true;
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
    filters.categories.length > 0 &&
    !filters.categories.some((category) => company.categories.includes(category))
  ) {
    return false;
  }

  if (!matchesEmployeeRange(company, filters)) {
    return false;
  }

  return true;
}

function sortCompanies(
  items: Company[],
  filters: CompanySearchFilters,
  scores: Map<string, number>,
) {
  const compareCompanyName = (a: Company, b: Company) =>
    a.name.localeCompare(b.name, "ko-KR");
  const compareRepresentative = (a: Company, b: Company) =>
    a.representative.localeCompare(b.representative, "ko-KR");

  return items.toSorted((a, b) => {
    if (filters.sort === "name-asc") {
      return compareCompanyName(a, b) || compareRepresentative(a, b);
    }

    if (filters.sort === "name-desc") {
      return compareCompanyName(b, a) || compareRepresentative(a, b);
    }

    if (filters.sort === "representative-asc") {
      return compareRepresentative(a, b) || compareCompanyName(a, b);
    }

    if (filters.sort === "representative-desc") {
      return compareRepresentative(b, a) || compareCompanyName(a, b);
    }

    return (
      (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
      compareCompanyName(a, b)
    );
  });
}

function filterAndSortCompanies(
  companies: Company[],
  filters: CompanySearchFilters,
) {
  const scores = new Map<string, number>();
  const filtered = companies.filter((company) => {
    if (!matchesCompany(company, filters)) {
      return false;
    }

    scores.set(company.id, scoreCompany(company, filters));
    return true;
  });

  return sortCompanies(filtered, filters, scores);
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

function countCategories(companies: Company[]) {
  const categoryCounts = new Map<string, number>(
    COMPANY_CATEGORIES.map((category) => [category, 0]),
  );

  for (const company of companies) {
    for (const category of company.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  return [...categoryCounts.entries()].map(([value, count]) => ({
    value,
    count,
  }));
}

function createCompanyFacets(companies: Company[]): CompanyFacets {
  const categories = countCategories(companies);
  const categoriesByRegion = Object.fromEntries(
    COMPANY_REGIONS.map((region) => [
      region,
      countCategories(
        companies.filter((company) => company.region === region),
      ),
    ]),
  );

  return {
    regions: countByOptions(
      COMPANY_REGIONS,
      companies.map((company) => company.region),
    ),
    industries: countBy(companies.map((company) => company.industry)),
    categories,
    categoriesByRegion,
  };
}

function createCompanyDirectoryStats(companies: Company[]) {
  return {
    totalCompanies: companies.length,
    totalRegions: new Set(companies.map((company) => company.region).filter(Boolean))
      .size,
    totalCategories: COMPANY_CATEGORIES.length,
  };
}

function createCompanySearchResult(
  companies: Company[],
  filters: CompanySearchFilters,
): CompanySearchResult {
  const sorted = filterAndSortCompanies(companies, filters);
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
}

export const searchCompanies = cache(
  async (filters: CompanySearchFilters): Promise<CompanySearchResult> => {
    const companies = await getCompanies();
    return createCompanySearchResult(companies, filters);
  },
);

export const getCompanyPageData = cache(async (filters: CompanySearchFilters) => {
  const companies = await getCompanies();

  return {
    facets: createCompanyFacets(companies),
    result: createCompanySearchResult(companies, filters),
    stats: createCompanyDirectoryStats(companies),
  };
});

export const getCompaniesForExport = cache(async (filters: CompanySearchFilters) => {
  const companies = await getCompanies();
  return filterAndSortCompanies(companies, filters);
});

export const getCompaniesForMap = cache(async () => getCompanies());

export const getCompanyById = cache(async (id: string) => {
  const companies = await getCompanies();
  return companies.find((company) => company.id === id) ?? null;
});

export const getCompanyFacets = cache(async (): Promise<CompanyFacets> => {
  const companies = await getCompanies();
  return createCompanyFacets(companies);
});

export const getCompanyDirectoryStats = cache(async () => {
  const companies = await getCompanies();
  return createCompanyDirectoryStats(companies);
});
