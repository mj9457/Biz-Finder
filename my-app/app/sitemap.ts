import type { MetadataRoute } from "next";

import { getCompaniesForMap } from "@/features/companies/lib/queries";
import { getCompanyHref } from "@/features/companies/lib/urls";
import { absoluteUrl } from "@/lib/site";

const SEO_LANDING_PATHS = [
  "/companies/namyangju",
  "/companies/guri",
  "/companies/gapyeong",
  "/companies/industry/manufacturing",
  "/companies/industry/construction",
  "/companies/industry/distribution",
] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const companies = await getCompaniesForMap();

  return [
    {
      url: absoluteUrl("/companies"),
      changeFrequency: "daily",
      priority: 1,
    },
    ...SEO_LANDING_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...companies.map((company) => ({
      url: absoluteUrl(getCompanyHref(company)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
