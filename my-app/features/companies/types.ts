import type {
  COMPANY_CATEGORIES,
  COMPANY_REGIONS,
  COMPANY_SORTS,
} from "./data/categories";

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];

export type CompanyRegion = (typeof COMPANY_REGIONS)[number];

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
  region: string;
  categories: CompanyCategory[];
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
};

export type CompanySearchResult = {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
