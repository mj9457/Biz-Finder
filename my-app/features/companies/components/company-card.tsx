import Link from "next/link";

import { formatEmployees } from "@/lib/format";
import type { CompanyListItem } from "../types";
import { CategoryBadge } from "./category-badge";

export type CompanyCardProps = {
  company: CompanyListItem;
  href?: string;
};

export function CompanyCard({
  company,
  href = `/companies/${company.id}`,
}: CompanyCardProps) {
  return (
    <li className="group min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="flex min-h-full flex-col">
        <div className="min-w-0">
          <Link
            href={href}
            className="break-words text-lg font-semibold text-slate-950 transition group-hover:text-primary"
          >
            {company.name}
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.categories.map((category) => (
              <CategoryBadge
                key={category}
                category={category}
                className="transition group-hover:bg-white"
              />
            ))}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {company.description}
        </p>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <dt className="shrink-0 text-slate-500">대표자명</dt>
            <dd className="min-w-0 truncate text-right font-medium text-slate-900">
              {company.representative}
            </dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <dt className="shrink-0 text-slate-500">지역</dt>
            <dd className="min-w-0 truncate text-right font-medium text-slate-900">
              {company.region} {company.district}
            </dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <dt className="shrink-0 text-slate-500">주요품목</dt>
            <dd className="min-w-0 truncate text-right font-medium text-slate-900">
              {company.mainProduct}
            </dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <dt className="shrink-0 text-slate-500">업종</dt>
            <dd className="min-w-0 truncate text-right font-medium text-slate-900">
              {company.categories.join(", ")}
            </dd>
          </div>
        </dl>

        <div className="mt-auto">
          <div className="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="min-w-0 truncate text-sm font-medium text-slate-600">
              {company.mainProduct}
            </span>
            <span className="shrink-0 text-xs font-medium text-slate-500">
              {formatEmployees(company.employees)}
            </span>
          </div>

          <Link
            href={href}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-white hover:text-primary"
            aria-label={`${company.name} 상세 보기`}
          >
            상세 보기
          </Link>
        </div>
      </div>
    </li>
  );
}
