import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

import { createCompanySearchHref } from "../lib/search-params";
import type { CompanyListItem, CompanySearchFilters, CompanySort } from "../types";
import { CategoryBadge } from "./category-badge";

export type CompanyTableProps = {
  companies: CompanyListItem[];
  filters: CompanySearchFilters;
  getCompanyHref?: (company: CompanyListItem) => string;
};

type SortField = "name" | "representative";
type SortDirection = "asc" | "desc";

function getSortValue(field: SortField, direction: SortDirection): CompanySort {
  return `${field}-${direction}` as CompanySort;
}

function getAriaSort(
  filters: CompanySearchFilters,
  field: SortField,
): "ascending" | "descending" | undefined {
  if (filters.sort === getSortValue(field, "asc")) {
    return "ascending";
  }

  if (filters.sort === getSortValue(field, "desc")) {
    return "descending";
  }

  return undefined;
}

function SortButton({
  direction,
  field,
  filters,
  label,
}: {
  direction: SortDirection;
  field: SortField;
  filters: CompanySearchFilters;
  label: string;
}) {
  const sort = getSortValue(field, direction);
  const isActive = filters.sort === sort;
  const Icon = direction === "asc" ? ArrowUpAZ : ArrowDownAZ;
  const directionLabel = direction === "asc" ? "오름차순" : "내림차순";

  return (
    <Link
      href={createCompanySearchHref(filters, { sort, page: 1 })}
      aria-label={`${label} ${directionLabel} 정렬`}
      title={`${label} ${directionLabel} 정렬`}
      className={[
        "inline-flex size-7 items-center justify-center rounded border transition focus:outline-none focus:ring-2 focus:ring-primary/20",
        isActive
          ? "border-primary bg-primary text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-primary hover:text-primary",
      ].join(" ")}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Link>
  );
}

function SortableHeader({
  field,
  filters,
  label,
}: {
  field: SortField;
  filters: CompanySearchFilters;
  label: string;
}) {
  return (
    <th
      scope="col"
      aria-sort={getAriaSort(filters, field)}
      className="whitespace-nowrap px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1">
          <SortButton
            direction="asc"
            field={field}
            filters={filters}
            label={label}
          />
          <SortButton
            direction="desc"
            field={field}
            filters={filters}
            label={label}
          />
        </span>
      </div>
    </th>
  );
}

export function CompanyTable({
  companies,
  filters,
  getCompanyHref = (company) => `/companies/${company.id}`,
}: CompanyTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] table-fixed divide-y divide-slate-200 text-left text-sm">
          <caption className="sr-only">기업 목록</caption>
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[28%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="border-b border-slate-300 bg-slate-100 text-sm font-semibold text-slate-900">
            <tr>
              <SortableHeader field="name" filters={filters} label="기업명" />
              <SortableHeader
                field="representative"
                filters={filters}
                label="대표자명"
              />
              <th scope="col" className="whitespace-nowrap px-4 py-3">
                지역
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3">
                주요품목
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3">
                업종
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => {
              const href = getCompanyHref(company);

              return (
                <tr
                  key={company.id}
                  className="align-top transition hover:bg-primary/5"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={href}
                      className="font-semibold text-slate-950 transition hover:text-primary"
                    >
                      {company.name || "-"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                    {company.representative || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                    {[company.region, company.district]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </td>
                  <td className="truncate px-4 py-4 text-slate-700">
                    {company.mainProduct || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-xs flex-wrap gap-1.5">
                      {company.categories.length > 0 ? (
                        company.categories.map((category) => (
                          <CategoryBadge
                            key={category}
                            category={category}
                            className="px-2"
                          />
                        ))
                      ) : (
                        <span className="text-slate-700">
                          {company.industryChamber || company.industry || "-"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
