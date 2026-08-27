"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";

import type { CompanyFacets, CompanySearchFilters } from "../types";
import { CompanyHeader } from "./company-header";
import { CompanyFilterSidebar } from "./company-filter-sidebar";

type CompanyPageShellProps = {
  children: ReactNode;
  facets: CompanyFacets;
  filters: CompanySearchFilters;
};

export function CompanyPageShell({
  children,
  facets,
  filters,
}: CompanyPageShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarKey = [
    "filter",
    filters.region,
    filters.executiveOnly ? "executive" : "all-companies",
    filters.executiveRoles.join("|"),
    filters.categories.join("|"),
    filters.employeeRanges.join("|"),
  ].join("-");

  return (
    <div className="min-h-screen">
      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-[2000] lg:hidden">
          <button
            type="button"
            aria-label="필터 닫기"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative h-full w-[min(380px,calc(100vw-48px))]">
            <CompanyFilterSidebar
              key={`${sidebarKey}-mobile`}
              filters={filters}
              facets={facets}
              idPrefix="company-filter-mobile"
              isMobileDrawer
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <CompanyHeader
        mobileMenuButton={
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-controls="company-filter-mobile-fields"
            aria-expanded={isMobileSidebarOpen}
            aria-label="필터 열기"
            title="필터 열기"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        }
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex min-h-[calc(100svh-112px)] w-full max-w-[1472px] lg:min-h-[calc(100svh-88px)]">
          <div className="hidden shrink-0 lg:block lg:w-[380px] lg:py-5 lg:pl-5">
            <CompanyFilterSidebar
              key={sidebarKey}
              filters={filters}
              facets={facets}
              idPrefix="company-filter-desktop"
            />
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
