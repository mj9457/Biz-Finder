"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Menu } from "lucide-react";

import type { CompanyFacets, CompanySearchFilters } from "../types";
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

      <header className="min-h-[88px] border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[88px] w-full max-w-[1472px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-8 sm:py-0">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4 sm:gap-8">
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
              <Link
                href="/companies"
                aria-label="회원사 검색으로 이동"
              >
                <Image
                  src="/logo.png"
                  alt="경기동부상공회의소"
                  width={480}
                  height={66}
                  preload
                  className="h-auto w-40 sm:w-60"
                />
              </Link>
              <Link
                href="/companies"
                className="text-sm font-semibold text-slate-700 transition hover:text-primary sm:text-base"
              >
                회원사 검색
              </Link>
            </div>
            <Link
              href="/companies/kakaomap"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_2px_6px_rgb(15_23_42_/_0.06)] transition hover:border-primary hover:text-primary hover:shadow-sm"
            >
              <MapPin className="size-4" aria-hidden="true" />
              지도 대시보드
            </Link>
        </div>
      </header>

      <main className="min-w-0 flex-1">
        <div className="mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-[1472px]">
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
