import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { getCompanyCsvDownloadAuthCode } from "@/features/companies/lib/export-config";
import { getCompaniesForExport } from "@/features/companies/lib/queries";
import {
  parseCompanySearchParams,
  type RawSearchParams,
} from "@/features/companies/lib/search-params";
import type { Company } from "@/features/companies/types";

function rawSearchParamsFromUrl(searchParams: URLSearchParams) {
  const rawParams: RawSearchParams = {};

  for (const [key, value] of searchParams.entries()) {
    if (key === "code") {
      continue;
    }

    const currentValue = rawParams[key];

    if (Array.isArray(currentValue)) {
      rawParams[key] = [...currentValue, value];
    } else if (currentValue) {
      rawParams[key] = [currentValue, value];
    } else {
      rawParams[key] = value;
    }
  }

  return rawParams;
}

function hasValidAuthCode(authCode: unknown) {
  if (typeof authCode !== "string" || authCode.length > 256) {
    return false;
  }

  const expected = Buffer.from(getCompanyCsvDownloadAuthCode());
  const received = Buffer.from(authCode.trim());

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

async function getExportRequest(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      code?: unknown;
      query?: unknown;
    };

    if (typeof body.query !== "string" || body.query.length > 10_000) {
      return null;
    }

    return {
      code: body.code,
      filters: parseCompanySearchParams(
        rawSearchParamsFromUrl(new URLSearchParams(body.query)),
      ),
    };
  } catch {
    return null;
  }
}

function protectExcelFormula(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function escapeCsvValue(value: string | number) {
  const normalizedValue = protectExcelFormula(String(value)).replace(
    /\r?\n/g,
    " ",
  );

  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function companyToCsvRow(company: Company) {
  return [
    company.name,
    company.representative,
    company.executive ?? "",
    [company.region, company.district].filter(Boolean).join(" "),
    company.mainProduct,
    company.categories.join(", "),
    company.industryChamber || company.industry,
    company.address,
    company.phone,
    company.contact,
    company.foundedDate,
    company.employees,
    company.website ?? "",
    company.description,
  ];
}

function createCompaniesCsv(companies: Company[]) {
  const headers = [
    "기업명",
    "대표자명",
    "임·의원 직책",
    "지역",
    "주요품목",
    "업종",
    "산업분류",
    "주소",
    "전화",
    "이메일",
    "설립일",
    "직원수",
    "홈페이지",
    "설명",
  ];
  const rows = [
    headers,
    ...companies.map((company) => companyToCsvRow(company)),
  ];

  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\r\n");
}

export async function POST(request: NextRequest) {
  const exportRequest = await getExportRequest(request);

  if (!exportRequest || !hasValidAuthCode(exportRequest.code)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const companies = await getCompaniesForExport(exportRequest.filters);
  const csv = `\uFEFF${createCompaniesCsv(companies)}`;
  const fileName = `gecci_companies-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        fileName,
      )}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
