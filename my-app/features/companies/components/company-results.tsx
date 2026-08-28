import type { CompanySearchFilters, CompanySearchResult } from "../types";
import { CompanyList } from "./company-list";

type CompanyResultsProps = {
  filters: CompanySearchFilters;
  result: Promise<CompanySearchResult>;
};

export async function CompanyResults({
  filters,
  result,
}: CompanyResultsProps) {
  return <CompanyList result={await result} filters={filters} />;
}
