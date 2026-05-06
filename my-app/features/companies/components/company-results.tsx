import { searchCompanies } from "../lib/queries";
import type { CompanySearchFilters } from "../types";
import { CompanyList } from "./company-list";

type CompanyResultsProps = {
  filters: CompanySearchFilters;
};

export async function CompanyResults({ filters }: CompanyResultsProps) {
  const result = await searchCompanies(filters);

  return <CompanyList result={result} filters={filters} />;
}
