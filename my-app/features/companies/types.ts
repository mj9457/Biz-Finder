import type {
  CERTIFICATION_STATUSES,
  COMPANY_CATEGORIES,
  COMPANY_REGIONS,
  COMPANY_SORTS,
} from "./data/categories";

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];

export type CompanyRegion = (typeof COMPANY_REGIONS)[number];

export type CertificationStatus = (typeof CERTIFICATION_STATUSES)[number];

export type CompanySort = (typeof COMPANY_SORTS)[number];

export type CompanyView = "table" | "card";

export type Company = {
  id: string;
  name: string;
  representative: string;
  region: CompanyRegion;
  district: string;
  industry: string;
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
  certificationStatus: CertificationStatus;
  certificationInfo: string;
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
  | "mainProduct"
  | "categories"
  | "employees"
  | "description"
>;

export type CompanySearchFilters = {
  q: string;
  region: string;
  certificationStatus: string;
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
  certificationStatuses: CompanyFacetOption[];
};

export type CompanySearchResult = {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
