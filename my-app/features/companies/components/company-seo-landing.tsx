import Link from "next/link";

import { StructuredData } from "@/features/seo/components/structured-data";
import { CompanyList } from "./company-list";
import { CompanyPageShell } from "./company-page-shell";
import { createBreadcrumbSchema } from "../lib/seo";
import { getCompanyPageData } from "../lib/queries";
import {
  parseCompanySearchParams,
  type RawSearchParams,
} from "../lib/search-params";

type CompanySeoLandingProps = {
  title: string;
  description: string;
  path: string;
  filterParams: RawSearchParams;
  relatedLinks: Array<{ label: string; href: string }>;
};

export async function CompanySeoLanding({
  title,
  description,
  path,
  filterParams,
  relatedLinks,
}: CompanySeoLandingProps) {
  const filters = parseCompanySearchParams(filterParams);
  const { facets, result } = await getCompanyPageData(filters);

  return (
    <>
      <StructuredData
        data={createBreadcrumbSchema([
          { name: "홈", path: "/companies" },
          { name: "회원사 검색", path: "/companies" },
          { name: title, path },
        ])}
      />
      <CompanyPageShell filters={filters} facets={facets}>
        <div className="min-w-0 px-5 py-6 sm:px-8">
          <div className="mx-auto w-full">
            <section className="mb-5 rounded-lg border border-sky-100 bg-sky-50/70 px-5 py-5 sm:px-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700 sm:text-base">
                {description}
              </p>
              <nav aria-label="관련 회원사 검색 페이지" className="mt-4 flex flex-wrap gap-2">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm font-semibold text-sky-800 transition hover:border-sky-400 hover:bg-sky-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </section>
            <CompanyList result={result} filters={filters} />
          </div>
        </div>
      </CompanyPageShell>
    </>
  );
}
