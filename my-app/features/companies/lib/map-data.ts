import "server-only";

import { cache } from "react";

import { COMPANY_CATEGORIES, COMPANY_REGIONS } from "../data/categories";
import type {
  Company,
  CompanyCategory,
  CompanyFacetOption,
  CompanyMapPoint,
  CompanyMapStats,
} from "../types";
import { getCompaniesForMap } from "./queries";

type CoordinateAnchor = {
  lat: number;
  lng: number;
  radius: number;
};

type AddressAnchor = CoordinateAnchor & {
  patterns: string[];
};

const DEFAULT_ANCHOR: CoordinateAnchor = {
  lat: 37.6906,
  lng: 127.2817,
  radius: 0.16,
};

const REGION_ANCHORS: Record<string, CoordinateAnchor> = {
  남양주: { lat: 37.6369, lng: 127.2165, radius: 0.12 },
  구리: { lat: 37.5943, lng: 127.1296, radius: 0.045 },
  가평: { lat: 37.8315, lng: 127.5099, radius: 0.18 },
};

const ADDRESS_ANCHORS: AddressAnchor[] = [
  { patterns: ["다산"], lat: 37.6155, lng: 127.1573, radius: 0.014 },
  { patterns: ["별내"], lat: 37.6481, lng: 127.1265, radius: 0.018 },
  { patterns: ["진접"], lat: 37.7111, lng: 127.1892, radius: 0.022 },
  { patterns: ["화도", "마석"], lat: 37.6529, lng: 127.3072, radius: 0.026 },
  { patterns: ["와부", "덕소"], lat: 37.5864, lng: 127.2262, radius: 0.02 },
  { patterns: ["오남"], lat: 37.6985, lng: 127.2054, radius: 0.018 },
  { patterns: ["진건"], lat: 37.6544, lng: 127.1791, radius: 0.016 },
  { patterns: ["평내", "호평"], lat: 37.6532, lng: 127.2448, radius: 0.017 },
  { patterns: ["퇴계원"], lat: 37.6485, lng: 127.1446, radius: 0.012 },
  { patterns: ["금곡"], lat: 37.6367, lng: 127.2072, radius: 0.014 },
  { patterns: ["수동"], lat: 37.7156, lng: 127.3218, radius: 0.036 },
  { patterns: ["조안"], lat: 37.5368, lng: 127.3036, radius: 0.03 },
  { patterns: ["갈매"], lat: 37.6342, lng: 127.1165, radius: 0.011 },
  { patterns: ["인창"], lat: 37.6047, lng: 127.1393, radius: 0.011 },
  { patterns: ["교문"], lat: 37.5972, lng: 127.1322, radius: 0.011 },
  { patterns: ["수택"], lat: 37.5933, lng: 127.145, radius: 0.011 },
  { patterns: ["토평"], lat: 37.5857, lng: 127.1498, radius: 0.012 },
  { patterns: ["가평읍"], lat: 37.8315, lng: 127.5099, radius: 0.026 },
  { patterns: ["청평"], lat: 37.7351, lng: 127.4264, radius: 0.028 },
  { patterns: ["설악"], lat: 37.6765, lng: 127.4948, radius: 0.036 },
  { patterns: ["조종", "현리"], lat: 37.8185, lng: 127.348, radius: 0.034 },
  { patterns: ["상면"], lat: 37.7761, lng: 127.3568, radius: 0.036 },
  { patterns: ["북면"], lat: 37.8993, lng: 127.5485, radius: 0.04 },
];

const INDUSTRIAL_AREA_KEYWORDS = [
  "산업단지",
  "산단",
  "공단",
  "산업로",
  "테크노",
  "테크노밸리",
];

function isUsableCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function hashToUnit(source: string, salt: string) {
  let hash = 2166136261;

  for (const character of `${source}:${salt}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function findAnchor(company: Company) {
  const source = [
    company.address,
    company.district,
    company.region,
    company.industry,
    company.industryChamber,
  ]
    .filter(Boolean)
    .join(" ");
  const addressAnchor = ADDRESS_ANCHORS.find((anchor) =>
    anchor.patterns.some((pattern) => source.includes(pattern)),
  );

  if (addressAnchor) {
    return addressAnchor;
  }

  const regionAnchor = Object.entries(REGION_ANCHORS).find(
    ([region]) => company.region === region || source.includes(region),
  )?.[1];

  return regionAnchor ?? DEFAULT_ANCHOR;
}

function estimateCoordinate(company: Company) {
  const anchor = findAnchor(company);
  const hashSource = [
    company.id,
    company.address,
    company.name,
    company.mainProduct,
  ].join("|");
  const angle = hashToUnit(hashSource, "angle") * Math.PI * 2;
  const distance = Math.sqrt(hashToUnit(hashSource, "distance")) * anchor.radius;
  const latitude = anchor.lat + Math.cos(angle) * distance;
  const longitude =
    anchor.lng +
    (Math.sin(angle) * distance) /
      Math.max(Math.cos((anchor.lat * Math.PI) / 180), 0.72);

  return {
    lat: roundCoordinate(latitude),
    lng: roundCoordinate(longitude),
    coordinateSource: "estimated" as const,
  };
}

function getCoordinate(company: Company) {
  if (
    isUsableCoordinate(company.latitude) &&
    isUsableCoordinate(company.longitude)
  ) {
    return {
      lat: roundCoordinate(company.latitude),
      lng: roundCoordinate(company.longitude),
      coordinateSource: "database" as const,
    };
  }

  return estimateCoordinate(company);
}

function isManufacturingCompany(company: Company) {
  const source = [
    company.industry,
    company.industryChamber,
    company.mainProduct,
    ...company.categories,
  ].join(" ");

  return source.includes("제조");
}

function isIndustrialAreaCompany(company: Company) {
  const source = [company.address, company.industry, company.industryChamber]
    .filter(Boolean)
    .join(" ");

  return INDUSTRIAL_AREA_KEYWORDS.some((keyword) => source.includes(keyword));
}

function getPrimaryCategory(company: Company): CompanyCategory | "기타" {
  return company.categories[0] ?? "기타";
}

function countByKnownOptions(
  options: readonly string[],
  values: string[],
): CompanyFacetOption[] {
  const counts = new Map(options.map((option) => [option, 0]));

  for (const value of values) {
    if (counts.has(value)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return options
    .map((value) => ({ value, count: counts.get(value) ?? 0 }))
    .filter((option) => option.count > 0);
}

function countUnknownCategory(points: CompanyMapPoint[]) {
  return points.filter((point) => point.primaryCategory === "기타").length;
}

function createMapStats(points: CompanyMapPoint[]): CompanyMapStats {
  const categoryCounts = countByKnownOptions(
    COMPANY_CATEGORIES,
    points.map((point) => point.primaryCategory),
  );
  const unknownCategoryCount = countUnknownCategory(points);

  if (
    unknownCategoryCount > 0 &&
    !categoryCounts.some((category) => category.value === "기타")
  ) {
    categoryCounts.push({ value: "기타", count: unknownCategoryCount });
  }

  return {
    totalCompanies: points.length,
    manufacturingCompanies: points.filter((point) => point.isManufacturing)
      .length,
    industrialAreaCompanies: points.filter((point) => point.isIndustrialArea)
      .length,
    exactCoordinateCompanies: points.filter(
      (point) => point.coordinateSource === "database",
    ).length,
    estimatedCoordinateCompanies: points.filter(
      (point) => point.coordinateSource === "estimated",
    ).length,
    regionCounts: countByKnownOptions(
      COMPANY_REGIONS,
      points.map((point) => point.region),
    ),
    categoryCounts,
  };
}

function toMapPoint(company: Company): CompanyMapPoint {
  return {
    id: company.id,
    name: company.name,
    region: company.region,
    district: company.district,
    industry: company.industry,
    industryChamber: company.industryChamber,
    mainProduct: company.mainProduct,
    categories: company.categories,
    address: company.address,
    phone: company.phone,
    primaryCategory: getPrimaryCategory(company),
    isManufacturing: isManufacturingCompany(company),
    isIndustrialArea: isIndustrialAreaCompany(company),
    ...getCoordinate(company),
  };
}

export const getCompanyMapData = cache(async () => {
  const companies = await getCompaniesForMap();
  const points = companies
    .map(toMapPoint)
    .toSorted(
      (a, b) =>
        Number(b.isManufacturing) - Number(a.isManufacturing) ||
        a.name.localeCompare(b.name, "ko-KR"),
    );

  return {
    points,
    stats: createMapStats(points),
  };
});
