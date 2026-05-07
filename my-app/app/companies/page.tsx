import type { Metadata } from "next";

import { CompanyList } from "@/features/companies/components/company-list";
import { CompanyPageShell } from "@/features/companies/components/company-page-shell";
import { getCompanyPageData } from "@/features/companies/lib/queries";
import {
  parseCompanySearchParams,
  type RawSearchParams,
} from "@/features/companies/lib/search-params";

export const metadata: Metadata = {
  title: "기업정보 검색",
};

type CompaniesPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const filters = parseCompanySearchParams(await searchParams);
  const { facets, result, stats } = await getCompanyPageData(filters);

  return (
    <CompanyPageShell filters={filters} facets={facets} stats={stats}>
      <div className="min-w-0 px-5 py-6 sm:px-8">
        <div className="mx-auto w-full">
          <CompanyList result={result} filters={filters} />
        </div>
      </div>
    </CompanyPageShell>
  );
}
