import type { Metadata } from "next";
import { Suspense } from "react";

import { CompanyListSkeleton } from "@/features/companies/components/company-list-skeleton";
import { CompanyPageShell } from "@/features/companies/components/company-page-shell";
import { CompanyResults } from "@/features/companies/components/company-results";
import {
  getCompanyDirectoryStats,
  getCompanyFacets,
} from "@/features/companies/lib/queries";
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
  const facets = await getCompanyFacets();
  const stats = await getCompanyDirectoryStats();

  return (
    <CompanyPageShell filters={filters} facets={facets} stats={stats}>
      <div className="min-w-0 px-5 py-6 sm:px-8">
        <div className="mx-auto w-full">
          <Suspense
            key={JSON.stringify(filters)}
            fallback={<CompanyListSkeleton />}
          >
            <CompanyResults filters={filters} />
          </Suspense>
        </div>
      </div>
    </CompanyPageShell>
  );
}
