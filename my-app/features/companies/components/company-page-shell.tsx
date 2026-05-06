"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

import type { CompanyFacets, CompanySearchFilters } from "../types";
import { formatNumber } from "@/lib/format";
import { CompanySearchForm } from "./company-search-form";

type CompanyPageShellProps = {
  children: ReactNode;
  facets: CompanyFacets;
  filters: CompanySearchFilters;
  stats: {
    totalCompanies: number;
    totalRegions: number;
    totalCategories: number;
  };
};

export function CompanyPageShell({
  children,
  facets,
  filters,
  stats,
}: CompanyPageShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={[
        "min-h-screen lg:grid lg:transition-[grid-template-columns] lg:duration-200",
        isSidebarOpen
          ? "lg:grid-cols-[320px_minmax(0,1fr)]"
          : "lg:grid-cols-[64px_minmax(0,1fr)]",
      ].join(" ")}
    >
      <div className="px-5 py-6 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-0 lg:py-0">
        <CompanySearchForm
          key={[
            "search",
            filters.q,
            filters.region,
            filters.certificationStatus,
            filters.categories.join("|"),
          ].join("-")}
          filters={filters}
          facets={facets}
          isCollapsed={!isSidebarOpen}
          onToggleCollapsed={() => setIsSidebarOpen((current) => !current)}
        />
      </div>
      <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-1">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex w-full flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
            <Link
              href="/companies"
              className="text-lg font-semibold text-slate-950"
            >
              경기동부상공회의소 회원사 검색 서비스
            </Link>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-slate-200 px-3 py-2">
                <dt className="text-xs font-medium text-slate-500">
                  등록된 기업
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-950">
                  {formatNumber(stats.totalCompanies)}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 px-3 py-2">
                <dt className="text-xs font-medium text-slate-500">지역</dt>
                <dd className="mt-1 text-base font-semibold text-slate-950">
                  {formatNumber(stats.totalRegions)}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 px-3 py-2">
                <dt className="text-xs font-medium text-slate-500">업종</dt>
                <dd className="mt-1 text-base font-semibold text-slate-950">
                  {formatNumber(stats.totalCategories)}
                </dd>
              </div>
            </dl>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
