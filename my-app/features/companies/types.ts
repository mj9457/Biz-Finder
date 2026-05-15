import type {
  COMPANY_CATEGORIES,
  COMPANY_EMPLOYEE_RANGES,
  COMPANY_REGIONS,
  COMPANY_SORTS,
} from "./data/categories";

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];

export type CompanyRegion = (typeof COMPANY_REGIONS)[number];

export type CompanyEmployeeRange =
  (typeof COMPANY_EMPLOYEE_RANGES)[number]["value"];

export type CompanySort = (typeof COMPANY_SORTS)[number];

export type CompanyView = "table" | "card";

export type Company = {
  id: string;
  name: string;
  representative: string;
  region: string;
  district: string;
  industry: string;
  industryChamber?: string;
  mainProduct: string;
  products: string[];
  categories: CompanyCategory[];
  foundedDate: string;
  employees: number;
  revenueBand: string;
  registrationNumber: string;
  address: string;
  contact: string;
  phone: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  description: string;
  tags: string[];
};

export type CompanyListItem = Pick<
  Company,
  | "id"
  | "name"
  | "representative"
  | "region"
  | "district"
  | "industry"
  | "industryChamber"
  | "mainProduct"
  | "categories"
  | "employees"
  | "description"
>;

export type CompanySearchFilters = {
  q: string;
  region: CompanyRegion | "";
  categories: CompanyCategory[];
  employeeRange: CompanyEmployeeRange | "";
  sort: CompanySort;
  view: CompanyView;
  page: number;
  pageSize: number;
};

export type CompanyFacetOption = {
  value: string;
  count: number;
};

export type CompanyFacets = {
  regions: CompanyFacetOption[];
  industries: CompanyFacetOption[];
  categories: CompanyFacetOption[];
  categoriesByRegion: Partial<Record<CompanyRegion, CompanyFacetOption[]>>;
  categoriesByEmployeeRange: Partial<
    Record<CompanyEmployeeRange, CompanyFacetOption[]>
  >;
  categoriesByRegionAndEmployeeRange: Partial<
    Record<
      CompanyRegion,
      Partial<Record<CompanyEmployeeRange, CompanyFacetOption[]>>
    >
  >;
};

export type CompanySearchResult = {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CompanyMapPoint = Pick<
  Company,
  | "id"
  | "name"
  | "region"
  | "district"
  | "industry"
  | "industryChamber"
  | "mainProduct"
  | "categories"
  | "address"
  | "phone"
> & {
  lat: number;
  lng: number;
  primaryCategory: CompanyCategory | "기타";
  isManufacturing: boolean;
  isIndustrialArea: boolean;
  coordinateSource: "database" | "estimated";
};

export type CompanyMapStats = {
  totalCompanies: number;
  manufacturingCompanies: number;
  industrialAreaCompanies: number;
  exactCoordinateCompanies: number;
  estimatedCoordinateCompanies: number;
  regionCounts: CompanyFacetOption[];
  categoryCounts: CompanyFacetOption[];
};
