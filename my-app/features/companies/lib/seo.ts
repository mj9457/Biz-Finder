import type { Company } from "../types";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { getCompanyHref } from "./urls";

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createCompanySchema(company: Company) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: absoluteUrl(getCompanyHref(company)),
    description: company.description || undefined,
    memberOf: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/companies"),
    },
  };

  if (company.phone) schema.telephone = company.phone;
  if (company.website) schema.sameAs = [company.website];
  if (company.imageUrl) schema.image = company.imageUrl;
  if (company.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressRegion: company.region || undefined,
      addressCountry: "KR",
    };
  }

  return removeUndefined(schema);
}

function removeUndefined(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined && entry !== "")
      .map(([key, entry]) => [
        key,
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? removeUndefined(entry)
          : entry,
      ]),
  );
}
