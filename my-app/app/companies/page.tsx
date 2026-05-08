import type { Metadata } from "next";

import { CompanyList } from "@/features/companies/components/company-list";
import { CompanyPageShell } from "@/features/companies/components/company-page-shell";
import { getCompanyPageData } from "@/features/companies/lib/queries";
import {
  parseCompanySearchParams,
  type RawSearchParams,
} from "@/features/companies/lib/search-params";

export const metadata: Metadata = {
  title: "회원사 검색 서비스",
  description:
    "경기동부상공회의소 회원사를 통합 검색어, 지역, 업종 조건으로 검색하고 상세 정보를 확인할 수 있습니다.",
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
