import Link from "next/link";

import type { CompanyListItem } from "../types";
import { CategoryBadge } from "./category-badge";

export type CompanyTableProps = {
  companies: CompanyListItem[];
  getCompanyHref?: (company: CompanyListItem) => string;
};

export function CompanyTable({
  companies,
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
              <th scope="col" className="whitespace-nowrap px-4 py-3">
                기업명
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3">
                대표자명
              </th>
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
