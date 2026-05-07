import { NextRequest } from "next/server";

import { COMPANY_CSV_DOWNLOAD_AUTH_CODE } from "@/features/companies/lib/export-config";
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
    [company.region, company.district].filter(Boolean).join(" "),
    company.mainProduct,
    company.categories.join(", "),
    company.industryChamber || company.industry,
    company.address,
    company.phone,
    company.contact,
    company.registrationNumber,
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
    "지역",
    "주요품목",
    "업종",
    "산업분류",
    "주소",
    "전화",
    "이메일",
    "사업자번호",
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

export async function GET(request: NextRequest) {
  const authCode = request.nextUrl.searchParams.get("code") ?? "";

  if (authCode !== COMPANY_CSV_DOWNLOAD_AUTH_CODE) {
    return new Response("Unauthorized", { status: 401 });
  }

  const filters = parseCompanySearchParams(
    rawSearchParamsFromUrl(request.nextUrl.searchParams),
  );
  const companies = await getCompaniesForExport(filters);
  const csv = `\uFEFF${createCompaniesCsv(companies)}`;
  const fileName = `companies-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        fileName,
      )}`,
    },
  });
}
