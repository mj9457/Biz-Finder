"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Building2, MapPin, Menu } from "lucide-react";

import { formatNumber } from "@/lib/format";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarKey = [
    "filter",
    filters.region,
    filters.categories.join("|"),
    filters.employeeRange,
  ].join("-");

  return (
    <div
      className={[
        "min-h-screen lg:grid lg:transition-[grid-template-columns] lg:duration-200",
        isSidebarOpen
          ? "lg:grid-cols-[380px_minmax(0,1fr)]"
          : "lg:grid-cols-[64px_minmax(0,1fr)]",
      ].join(" ")}
    >
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

      <div className="hidden px-5 py-6 sm:px-8 lg:col-start-1 lg:row-start-1 lg:block lg:px-0 lg:py-0">
        <CompanyFilterSidebar
          key={sidebarKey}
          filters={filters}
          facets={facets}
          idPrefix="company-filter-desktop"
          isCollapsed={!isSidebarOpen}
          onToggleCollapsed={() => setIsSidebarOpen((current) => !current)}
        />
      </div>

      <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-1">
        <header className="border-b border-primary/30 bg-white">
          <div className="flex w-full flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-controls="company-filter-mobile-fields"
                aria-expanded={isMobileSidebarOpen}
                aria-label="필터 열기"
                title="필터 열기"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/40 lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
              <Link
                href="/companies"
                aria-label="경기동부상공회의소 회원사 검색서비스 홈"
                className="flex min-w-0 flex-col"
              >
                <Image
                  src="/logo-white-header.png"
                  alt="경기동부상공회의소"
                  width={480}
                  height={66}
                  sizes="(min-width: 640px) 240px, 192px"
                  preload
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  unoptimized
                  className="h-auto w-48 sm:w-60"
                />
                <span className="mt-2 text-sm font-medium leading-none text-gray-500 sm:text-sm">
                  회원사 검색서비스
                </span>
              </Link>
            </div>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/companies/map"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <MapPin className="size-4" aria-hidden="true" />
                지도 대시보드
              </Link>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
