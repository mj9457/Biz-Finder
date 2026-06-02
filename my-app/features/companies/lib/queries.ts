import "server-only";

import { cache } from "react";

import { supabase } from "@/lib/supabase";
import {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
  INDUSTRY_CHAMBER_CATEGORY_MAP,
} from "../data/categories";
import { companies as localCompanies } from "../data/companies";
import type {
  Company,
  CompanyCategory,
  CompanyEmployeeRange,
  CompanyFacetOption,
  CompanyFacets,
  CompanyRegion,
  CompanySearchFilters,
  CompanySearchResult,
} from "../types";

type CompanyRow = {
  id: number;
  business_number: string | null;
  company_type: string | null;
  location: string | null;
  industry_chamber: string | null;
  industry_code: string | null;
  standard_industry: string | null;
  company_name: string | null;
  ceo_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  employee_count: number | null;
  main_products: string | null;
  established_date: string | null;
  website: string | null;
  description: string | null;
  tags: string | null;
  region: string | null;
  primary_category: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
};

type CompanyFacetRow = Pick<
  CompanyRow,
  | "region"
  | "primary_category"
  | "standard_industry"
  | "industry_chamber"
  | "industry_code"
  | "company_type"
  | "location"
  | "address"
  | "employee_count"
>;

type CompanyDirectoryMetadata = {
  facets: CompanyFacets;
};

const COMPANY_CACHE_REVALIDATE_SECONDS = 300;
const COMPANY_CACHE_REVALIDATE_MS = COMPANY_CACHE_REVALIDATE_SECONDS * 1000;
// Keep pagination below the common Supabase max rows per request limit.
const SUPABASE_BATCH_SIZE = 500;
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
  "region",
  "primary_category",
  "latitude",
  "longitude",
].join(",");
const COMPANY_FACET_SELECT_COLUMNS = [
  "region",
  "primary_category",
  "standard_industry",
  "industry_chamber",
  "industry_code",
  "company_type",
  "location",
  "address",
  "employee_count",
].join(",");
const industryChamberCategoryEntries = Object.entries(
  INDUSTRY_CHAMBER_CATEGORY_MAP,
) as Array<[string, CompanyCategory]>;
const companyCategorySet = new Set<string>(COMPANY_CATEGORIES);
const companyRegionSet = new Set<string>(COMPANY_REGIONS);
const localCompanyIndexById = new Map(
  localCompanies.map((company, index) => [company.id, index]),
);
const employeeRangeMap = new Map(
  COMPANY_EMPLOYEE_RANGES.map((range) => [range.value, range]),
);

let directoryMetadataCache: {
  data: CompanyDirectoryMetadata;
  expiresAt: number;
} | null = null;
let directoryMetadataPromise: Promise<CompanyDirectoryMetadata> | null = null;
let companiesForMapCache: {
  data: Company[];
  expiresAt: number;
} | null = null;
let companiesForMapPromise: Promise<Company[]> | null = null;
let hasLoggedLocalFallback = false;

type SupabaseErrorLike = {
  message?: string | null;
  status?: number | null;
  statusText?: string | null;
  code?: string | null;
};

type ChainedQuery<T> = {
  eq: (column: string, value: string) => T;
  in: (column: string, values: string[]) => T;
  gte: (column: string, value: number) => T;
  lte: (column: string, value: number) => T;
  ilike: (column: string, pattern: string) => T;
  or: (filters: string) => T;
  order: (
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) => T;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSupabaseErrorLike(value: unknown): SupabaseErrorLike | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  return value as SupabaseErrorLike;
}

function summarizeSupabaseError(error: SupabaseErrorLike | null | undefined) {
  if (!error) {
    return "Unknown Supabase error";
  }

  const message = typeof error.message === "string" ? error.message.trim() : "";

  if (message) {
    const titleMatch = message.match(/<title>([^<]+)<\/title>/i);

    if (titleMatch) {
      return titleMatch[1].replace(/^supabase\.co\s+\|\s+/i, "");
    }

    return message.replace(/\s+/g, " ").slice(0, 240);
  }

  if (typeof error.status === "number") {
    return `HTTP ${error.status}`;
  }

  return "Unknown Supabase error";
}

function isSupabaseUnavailableError(error: SupabaseErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  if (typeof error.status === "number" && error.status >= 500) {
    return true;
  }

  const summary = summarizeSupabaseError(error);
  return /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Web server is down/i.test(
    summary,
  );
}

function isUnavailableDataSourceError(error: unknown) {
  if (isSupabaseUnavailableError(getSupabaseErrorLike(error))) {
    return true;
  }

  if (!isObjectRecord(error) || !("cause" in error)) {
    return false;
  }

  return isSupabaseUnavailableError(getSupabaseErrorLike(error.cause));
}

function createDataSourceError(action: string, error: SupabaseErrorLike) {
  return Object.assign(
    new Error(`${action}: ${summarizeSupabaseError(error)}`),
    { cause: error },
  );
}

function logLocalFallback(reason: unknown, context: string) {
  if (hasLoggedLocalFallback) {
    return;
  }

  hasLoggedLocalFallback = true;

  const error =
    getSupabaseErrorLike(reason) ??
    getSupabaseErrorLike(
      isObjectRecord(reason) && "cause" in reason ? reason.cause : null,
    );

  console.warn(
    `[companies] Supabase unavailable while loading ${context}. Falling back to local data. ${summarizeSupabaseError(error)}`,
  );
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

function normalizeCategoriesFromSource(row: CompanyFacetRow) {
  const normalizedPrimaryCategory = row.primary_category?.trim();

  if (
    normalizedPrimaryCategory &&
    companyCategorySet.has(normalizedPrimaryCategory)
  ) {
    return [normalizedPrimaryCategory as CompanyCategory];
  }

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
  if (
    source.includes("운수") ||
    source.includes("물류") ||
    source.includes("창고")
  ) {
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
  if (source.includes("금융") || source.includes("보험"))
    return ["금융 & 보험"];
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

function normalizeRegionValue(
  row: Pick<CompanyRow, "region" | "location" | "address">,
) {
  const region = row.region?.trim();

  if (region && companyRegionSet.has(region)) {
    return region;
  }

  return normalizeRegion(row.location, row.address);
}

function toCoordinateNumber(value: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function mapCompany(row: CompanyRow): Company {
  const products = splitTextList(row.main_products);
  const categories = normalizeCategoriesFromSource(row) as CompanyCategory[];
  const region = normalizeRegionValue(row);
  const latitude = toCoordinateNumber(row.latitude);
  const longitude = toCoordinateNumber(row.longitude);
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
    latitude,
    longitude,
    description: row.description ?? "",
    tags: splitTextList(row.tags),
  };
}

function getLocalCompanyIndex(company: Company) {
  return localCompanyIndexById.get(company.id) ?? Number.MAX_SAFE_INTEGER;
}

function getPrimaryLocalCategory(company: Company) {
  const primaryCategory = company.categories[0];

  if (primaryCategory && companyCategorySet.has(primaryCategory)) {
    return primaryCategory as CompanyCategory;
  }

  return null;
}

function createLocalFacetRows(): CompanyFacetRow[] {
  return localCompanies.map((company) => ({
    region: company.region,
    primary_category: getPrimaryLocalCategory(company),
    standard_industry: company.industry,
    industry_chamber: company.industryChamber ?? company.industry,
    industry_code: company.industry,
    company_type: company.industry,
    location: [company.region, company.district].filter(Boolean).join(" "),
    address: company.address,
    employee_count: company.employees,
  }));
}

function createLocalSearchText(company: Company) {
  return [
    company.name,
    company.representative,
    company.region,
    company.district,
    company.industry,
    company.industryChamber,
    company.mainProduct,
    company.address,
    company.contact,
    company.phone,
    company.registrationNumber,
    company.description,
    ...company.products,
    ...company.tags,
    ...company.categories,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function matchesLocalCategoryFilter(
  company: Company,
  categories: CompanySearchFilters["categories"],
) {
  if (categories.length === 0) {
    return true;
  }

  const primaryCategory = getPrimaryLocalCategory(company);
  return primaryCategory ? categories.includes(primaryCategory) : false;
}

function matchesLocalKeywordFilter(company: Company, keyword: string) {
  if (!keyword) {
    return true;
  }

  const safeKeyword = sanitizeKeyword(keyword);

  if (!safeKeyword) {
    return true;
  }

  if (!hasTextKeyword(safeKeyword)) {
    return false;
  }

  return createLocalSearchText(company).includes(
    safeKeyword.toLocaleLowerCase("ko-KR"),
  );
}

function filterLocalCompanies(filters: CompanySearchFilters) {
  return localCompanies.filter((company) => {
    if (filters.region && company.region !== filters.region) {
      return false;
    }

    if (!matchesLocalCategoryFilter(company, filters.categories)) {
      return false;
    }

    if (
      filters.employeeRanges.length > 0 &&
      !filters.employeeRanges.some((employeeRange) =>
        matchesEmployeeCountByRange(company.employees, employeeRange),
      )
    ) {
      return false;
    }

    if (!matchesLocalKeywordFilter(company, filters.q)) {
      return false;
    }

    return true;
  });
}

function compareLocalCompanies(a: Company, b: Company, filters: CompanySearchFilters) {
  switch (filters.sort) {
    case "name-asc":
      return (
        a.name.localeCompare(b.name, "ko-KR") || getLocalCompanyIndex(a) - getLocalCompanyIndex(b)
      );
    case "name-desc":
      return (
        b.name.localeCompare(a.name, "ko-KR") || getLocalCompanyIndex(a) - getLocalCompanyIndex(b)
      );
    case "representative-asc":
      return (
        a.representative.localeCompare(b.representative, "ko-KR") ||
        a.name.localeCompare(b.name, "ko-KR") ||
        getLocalCompanyIndex(a) - getLocalCompanyIndex(b)
      );
    case "representative-desc":
      return (
        b.representative.localeCompare(a.representative, "ko-KR") ||
        a.name.localeCompare(b.name, "ko-KR") ||
        getLocalCompanyIndex(a) - getLocalCompanyIndex(b)
      );
    default:
      if (filters.q) {
        return (
          a.name.localeCompare(b.name, "ko-KR") ||
          getLocalCompanyIndex(a) - getLocalCompanyIndex(b)
        );
      }

      return getLocalCompanyIndex(a) - getLocalCompanyIndex(b);
  }
}

function createLocalCompanySearchResult(
  filters: CompanySearchFilters,
): CompanySearchResult {
  const items = filterLocalCompanies(filters).toSorted((a, b) =>
    compareLocalCompanies(a, b, filters),
  );
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.pageSize;
  const end = start + filters.pageSize;

  return {
    items: items.slice(start, end),
    total,
    page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

function sanitizeKeyword(value: string) {
  return value.trim().replace(/,/g, " ");
}

function hasTextKeyword(value: string) {
  return /[A-Za-z\u3131-\u318E\uAC00-\uD7A3]/.test(value);
}

function applyKeywordFilter<T extends ChainedQuery<T>>(
  query: T,
  keyword: string,
): T {
  if (!keyword) {
    return query;
  }

  const safeKeyword = sanitizeKeyword(keyword);

  if (!safeKeyword) {
    return query;
  }

  // 숫자/기호만 입력된 검색어는 기업 검색 대상으로 보지 않는다.
  if (!hasTextKeyword(safeKeyword)) {
    return query.eq("id", "-1");
  }

  const pattern = `%${safeKeyword}%`;
  return query.ilike("search_text", pattern);
}

function applyEmployeeRangeFilter<T extends ChainedQuery<T>>(
  query: T,
  employeeRanges: CompanySearchFilters["employeeRanges"],
): T {
  if (employeeRanges.length === 0) {
    return query;
  }

  const employeeRangeConditions = [...new Set(employeeRanges)]
    .map((employeeRange) => {
      const range = employeeRangeMap.get(employeeRange);

      if (!range) {
        return null;
      }

      const conditions: string[] = [];

      if ("min" in range) {
        conditions.push(`employee_count.gte.${range.min}`);
      }

      if ("max" in range) {
        conditions.push(`employee_count.lte.${range.max}`);
      }

      if (conditions.length === 0) {
        return null;
      }

      return conditions.length === 1
        ? conditions[0]
        : `and(${conditions.join(",")})`;
    })
    .filter((condition): condition is string => Boolean(condition));

  if (employeeRangeConditions.length === 0) {
    return query;
  }

  return query.or(employeeRangeConditions.join(","));
}

function applySearchFilters<T extends ChainedQuery<T>>(
  query: T,
  filters: CompanySearchFilters,
): T {
  if (filters.region) {
    query = query.eq("region", filters.region);
  }

  if (filters.categories.length > 0) {
    query = query.in("primary_category", filters.categories);
  }

  query = applyEmployeeRangeFilter(query, filters.employeeRanges);
  query = applyKeywordFilter(query, filters.q);

  return query;
}

function applySearchSort<T extends ChainedQuery<T>>(
  query: T,
  filters: CompanySearchFilters,
): T {
  if (filters.sort === "name-asc") {
    return query.order("company_name", { ascending: true }).order("id", {
      ascending: true,
    });
  }

  if (filters.sort === "name-desc") {
    return query.order("company_name", { ascending: false }).order("id", {
      ascending: false,
    });
  }

  if (filters.sort === "representative-asc") {
    return query.order("ceo_name", { ascending: true }).order("company_name", {
      ascending: true,
    });
  }

  if (filters.sort === "representative-desc") {
    return query.order("ceo_name", { ascending: false }).order("company_name", {
      ascending: true,
    });
  }

  // relevance는 keyword 기반 정렬 우선 적용이 필요하지만,
  // Supabase REST 쿼리에서는 커스텀 ranking 식을 직접 order하기 어렵기 때문에
  // 우선 기업명 기준 안정 정렬을 사용합니다.
  if (filters.q) {
    return query.order("company_name", { ascending: true }).order("id", {
      ascending: true,
    });
  }

  return query.order("id", { ascending: true });
}

async function fetchSearchPage(
  filters: CompanySearchFilters,
  page: number,
  pageSize: number,
  includeCount: boolean,
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  let query = supabase.from("companies").select(COMPANY_SELECT_COLUMNS, {
    count: includeCount ? "exact" : undefined,
  });

  query = applySearchFilters(query, filters);
  query = applySearchSort(query, filters);
  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw createDataSourceError("Failed to search companies", error);
  }

  return {
    rows: ((data ?? []) as unknown as CompanyRow[]).map(mapCompany),
    total: count ?? null,
  };
}

async function fetchAllRowsWithColumns<T extends object>(columns: string) {
  let from = 0;
  const rows: T[] = [];

  while (true) {
    const to = from + SUPABASE_BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from("companies")
      .select(columns)
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw createDataSourceError("Failed to load companies", error);
    }

    const chunk = (data ?? []) as unknown as T[];

    if (chunk.length === 0) {
      break;
    }

    rows.push(...chunk);

    if (chunk.length < SUPABASE_BATCH_SIZE) {
      break;
    }

    from += SUPABASE_BATCH_SIZE;
  }

  return rows;
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

function matchesEmployeeCountByRange(
  employeeCount: number | null,
  employeeRange: CompanyEmployeeRange | "",
) {
  if (!employeeRange) {
    return true;
  }

  if (employeeCount === null) {
    return false;
  }

  const range = employeeRangeMap.get(employeeRange);

  if (!range) {
    return true;
  }

  if ("min" in range && employeeCount < range.min) {
    return false;
  }

  if ("max" in range && employeeCount > range.max) {
    return false;
  }

  return true;
}

function countCategories(
  rows: CompanyFacetRow[],
  targetRegion?: CompanyRegion,
  targetEmployeeRange: CompanyEmployeeRange | "" = "",
) {
  const categoryCounts = new Map<string, number>(
    COMPANY_CATEGORIES.map((category) => [category, 0]),
  );

  for (const row of rows) {
    const region = normalizeRegionValue(row);

    if (targetRegion && region !== targetRegion) {
      continue;
    }

    if (!matchesEmployeeCountByRange(row.employee_count, targetEmployeeRange)) {
      continue;
    }

    const category = normalizeCategoriesFromSource(row)[0];

    if (!category) {
      continue;
    }

    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  return [...categoryCounts.entries()].map(([value, count]) => ({
    value,
    count,
  }));
}

function createCompanyFacets(rows: CompanyFacetRow[]): CompanyFacets {
  const normalizedRegions = rows
    .map((row) => normalizeRegionValue(row))
    .filter(Boolean);
  const categoriesByRegion = Object.fromEntries(
    COMPANY_REGIONS.map((region) => [region, countCategories(rows, region)]),
  ) as Partial<Record<(typeof COMPANY_REGIONS)[number], CompanyFacetOption[]>>;
  const categoriesByEmployeeRange = Object.fromEntries(
    COMPANY_EMPLOYEE_RANGES.map((range) => [
      range.value,
      countCategories(rows, undefined, range.value),
    ]),
  ) as Partial<Record<CompanyEmployeeRange, CompanyFacetOption[]>>;
  const categoriesByRegionAndEmployeeRange = Object.fromEntries(
    COMPANY_REGIONS.map((region) => [
      region,
      Object.fromEntries(
        COMPANY_EMPLOYEE_RANGES.map((range) => [
          range.value,
          countCategories(rows, region, range.value),
        ]),
      ),
    ]),
  ) as Partial<
    Record<
      CompanyRegion,
      Partial<Record<CompanyEmployeeRange, CompanyFacetOption[]>>
    >
  >;
  const industries = countBy(
    rows
      .map((row) => {
        return (
          row.standard_industry ??
          row.industry_chamber ??
          row.industry_code ??
          row.company_type ??
          ""
        ).trim();
      })
      .filter(Boolean),
  );

  return {
    regions: countByOptions(COMPANY_REGIONS, normalizedRegions),
    industries,
    categories: countCategories(rows),
    categoriesByRegion,
    categoriesByEmployeeRange,
    categoriesByRegionAndEmployeeRange,
  };
}

async function loadCompanyDirectoryMetadata() {
  try {
    const rows = await fetchAllRowsWithColumns<CompanyFacetRow>(
      COMPANY_FACET_SELECT_COLUMNS,
    );

    return {
      facets: createCompanyFacets(rows),
    };
  } catch (error) {
    if (!isUnavailableDataSourceError(error)) {
      throw error;
    }

    logLocalFallback(error, "directory metadata");

    return {
      facets: createCompanyFacets(createLocalFacetRows()),
    };
  }
}

async function getCompanyDirectoryMetadata(): Promise<CompanyDirectoryMetadata> {
  const now = Date.now();

  if (directoryMetadataCache && directoryMetadataCache.expiresAt > now) {
    return directoryMetadataCache.data;
  }

  directoryMetadataPromise ??= loadCompanyDirectoryMetadata()
    .then((data) => {
      directoryMetadataCache = {
        data,
        expiresAt: Date.now() + COMPANY_CACHE_REVALIDATE_MS,
      };

      return data;
    })
    .finally(() => {
      directoryMetadataPromise = null;
    });

  return directoryMetadataPromise;
}

async function loadCompaniesForMap() {
  try {
    const rows = await fetchAllRowsWithColumns<CompanyRow>(
      COMPANY_SELECT_COLUMNS,
    );
    return rows.map(mapCompany);
  } catch (error) {
    if (!isUnavailableDataSourceError(error)) {
      throw error;
    }

    logLocalFallback(error, "map data");
    return localCompanies;
  }
}

async function getAllCompaniesForMap() {
  const now = Date.now();

  if (companiesForMapCache && companiesForMapCache.expiresAt > now) {
    return companiesForMapCache.data;
  }

  companiesForMapPromise ??= loadCompaniesForMap()
    .then((data) => {
      companiesForMapCache = {
        data,
        expiresAt: Date.now() + COMPANY_CACHE_REVALIDATE_MS,
      };

      return data;
    })
    .finally(() => {
      companiesForMapPromise = null;
    });

  return companiesForMapPromise;
}

async function createCompanySearchResult(
  filters: CompanySearchFilters,
): Promise<CompanySearchResult> {
  try {
    const firstPage = await fetchSearchPage(
      filters,
      filters.page,
      filters.pageSize,
      true,
    );
    const total = firstPage.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, totalPages);

    if (page === filters.page || total === 0) {
      return {
        items: firstPage.rows,
        total,
        page,
        pageSize: filters.pageSize,
        totalPages,
      };
    }

    const correctedPage = await fetchSearchPage(
      filters,
      page,
      filters.pageSize,
      false,
    );

    return {
      items: correctedPage.rows,
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
    };
  } catch (error) {
    if (!isUnavailableDataSourceError(error)) {
      throw error;
    }

    logLocalFallback(error, "search results");
    return createLocalCompanySearchResult(filters);
  }
}

export const searchCompanies = cache(
  async (filters: CompanySearchFilters): Promise<CompanySearchResult> => {
    return createCompanySearchResult(filters);
  },
);

export const getCompanyPageData = cache(
  async (filters: CompanySearchFilters) => {
    const metadata = await getCompanyDirectoryMetadata();
    const result = await createCompanySearchResult(filters);

    return {
      facets: metadata.facets,
      result,
    };
  },
);

export const getCompaniesForExport = cache(
  async (filters: CompanySearchFilters) => {
    try {
      const firstPage = await fetchSearchPage(
        filters,
        1,
        SUPABASE_BATCH_SIZE,
        true,
      );
      const total = firstPage.total ?? firstPage.rows.length;
      const pages = Math.max(1, Math.ceil(total / SUPABASE_BATCH_SIZE));
      const items = [...firstPage.rows];

      for (let currentPage = 2; currentPage <= pages; currentPage += 1) {
        const page = await fetchSearchPage(
          filters,
          currentPage,
          SUPABASE_BATCH_SIZE,
          false,
        );
        items.push(...page.rows);
      }

      return items;
    } catch (error) {
      if (!isUnavailableDataSourceError(error)) {
        throw error;
      }

      logLocalFallback(error, "export data");

      return filterLocalCompanies(filters).toSorted((a, b) =>
        compareLocalCompanies(a, b, filters),
      );
    }
  },
);

export const getCompaniesForMap = cache(async () => getAllCompaniesForMap());

export const getCompanyById = cache(async (id: string) => {
  const localCompany = localCompanies.find((company) => company.id === id) ?? null;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return localCompany;
  }

  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_SELECT_COLUMNS)
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    if (isSupabaseUnavailableError(error)) {
      logLocalFallback(error, `company detail (${id})`);
      return localCompany;
    }

    throw createDataSourceError("Failed to get company by id", error);
  }

  if (!data) {
    return localCompany;
  }

  return mapCompany(data as unknown as CompanyRow);
});

export const getCompanyFacets = cache(async (): Promise<CompanyFacets> => {
  return (await getCompanyDirectoryMetadata()).facets;
});
