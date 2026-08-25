import type { Metadata } from "next";
import { Suspense } from "react";
import { CompanyListSkeleton } from "@/features/companies/components/company-list-skeleton";
import { CompanyPageShell } from "@/features/companies/components/company-page-shell";
import { CompanyResults } from "@/features/companies/components/company-results";
import { getCompanyFacetsForFilters } from "@/features/companies/lib/queries";
import {
  parseCompanySearchParams,
  hasActiveCompanyFilters,
  DEFAULT_COMPANY_VIEW,
  type RawSearchParams,
} from "@/features/companies/lib/search-params";

type CompaniesPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: CompaniesPageProps): Promise<Metadata> {
  const filters = parseCompanySearchParams(await searchParams);
  const isIndexable =
    !hasActiveCompanyFilters(filters) &&
    filters.page === 1 &&
    filters.sort === "relevance" &&
    filters.view === DEFAULT_COMPANY_VIEW;

  return {
    title: "회원사 검색",
    description:
      "경기동부상공회의소 회원사를 기업명, 지역, 업종, 주요 품목으로 검색하고 기업별 주소·연락처·사업 정보를 확인할 수 있습니다.",
    alternates: { canonical: "/companies" },
    robots: { index: isIndexable, follow: true },
    openGraph: {
      title: "경기동부상공회의소 회원사 검색",
      description:
        "남양주·구리·가평 지역 기업과 경기동부상공회의소 회원사의 상세 정보를 검색해 보세요.",
      url: "/companies",
      type: "website",
    },
  };
}

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const filters = parseCompanySearchParams(await searchParams);
  const facets = await getCompanyFacetsForFilters(filters);

  return (
    <CompanyPageShell filters={filters} facets={facets}>
      <div className="min-w-0 px-5 py-6 sm:px-8">
        <div className="mx-auto w-full">
          <Suspense fallback={<CompanyListSkeleton />}>
            <CompanyResults filters={filters} />
          </Suspense>
        </div>
      </div>
    </CompanyPageShell>
  );
}
