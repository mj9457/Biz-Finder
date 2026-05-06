import type { ReactNode } from "react";

import type { CompanyListItem } from "../types";
import { CompanyCard } from "./company-card";

export type CompanyCardListProps = {
  companies: CompanyListItem[];
  emptyState?: ReactNode;
  getCompanyHref?: (company: CompanyListItem) => string;
};

export function CompanyCardList({
  companies,
  emptyState,
  getCompanyHref = (company) => `/companies/${company.id}`,
}: CompanyCardListProps) {
  if (companies.length === 0) {
    return emptyState ?? null;
  }

  return (
    <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          href={getCompanyHref(company)}
        />
      ))}
    </ol>
  );
}
