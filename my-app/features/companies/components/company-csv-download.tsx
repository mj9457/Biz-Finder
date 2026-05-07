"use client";

import { Download, KeyRound } from "lucide-react";
import { type KeyboardEvent, useState } from "react";

import { createCompanyExportSearchParams } from "../lib/search-params";
import type { CompanySearchFilters } from "../types";

type CompanyCsvDownloadProps = {
  filters: CompanySearchFilters;
};

function getDownloadFileName(response: Response) {
  const disposition = response.headers.get("content-disposition");
  const encodedFileName = disposition?.match(/filename\*=UTF-8''([^;]+)/)?.[1];

  if (encodedFileName) {
    return decodeURIComponent(encodedFileName);
  }

  return "companies.csv";
}

export function CompanyCsvDownload({ filters }: CompanyCsvDownloadProps) {
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function downloadCsv() {
    const trimmedCode = authCode.trim();

    if (!trimmedCode) {
      setError("인증문자를 입력해 주세요.");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      const params = createCompanyExportSearchParams(filters);
      params.set("code", trimmedCode);
      const response = await fetch(`/api/companies/export?${params}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        setError("인증문자가 올바르지 않습니다.");
        return;
      }

      if (!response.ok) {
        setError("CSV 다운로드에 실패했습니다.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = getDownloadFileName(response);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsPending(false);
    }
  }

  function handleCodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void downloadCsv();
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative block">
          <span className="sr-only">CSV 다운로드 인증문자</span>
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={authCode}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            onChange={(event) => setAuthCode(event.target.value)}
            onKeyDown={handleCodeKeyDown}
            placeholder="인증문자"
            className="h-10 w-36 rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="button"
          onClick={() => void downloadCsv()}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" aria-hidden="true" />
          <span>{isPending ? "다운로드 중" : "CSV"}</span>
        </button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
