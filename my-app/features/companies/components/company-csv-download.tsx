"use client";

import { Download, Eye, EyeOff, KeyRound } from "lucide-react";
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
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  async function downloadCsv() {
    const trimmedCode = authCode.trim();

    if (!trimmedCode) {
      setError("인증번호를 입력해 주세요.");
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
        setError("인증번호가 올바르지 않습니다.\n문의 : 031-592-3039(305)");
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
    setIsCapsLockOn(event.getModifierState("CapsLock"));

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void downloadCsv();
  }

  function handleCodeKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    setIsCapsLockOn(event.getModifierState("CapsLock"));
  }

  return (
    <div className="relative flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto">
        <label className="relative block w-[200px] min-w-0">
          <span className="sr-only">CSV 다운로드 인증번호</span>
          {isCapsLockOn ? (
            <span
              id="csv-auth-code-caps-lock-hint"
              role="tooltip"
              className="absolute bottom-full right-0 z-10 mb-2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
            >
              Caps Lock이 켜져 있습니다.
            </span>
          ) : null}
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={authCode}
            type={isCodeVisible ? "text" : "password"}
            inputMode="numeric"
            autoComplete="off"
            onChange={(event) => setAuthCode(event.target.value)}
            onKeyDown={handleCodeKeyDown}
            onKeyUp={handleCodeKeyUp}
            onBlur={() => setIsCapsLockOn(false)}
            aria-describedby={
              isCapsLockOn ? "csv-auth-code-caps-lock-hint" : undefined
            }
            placeholder="인증번호"
            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsCodeVisible((visible) => !visible)}
            className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={isCodeVisible ? "인증번호 숨기기" : "인증번호 보기"}
            title={isCodeVisible ? "인증번호 숨기기" : "인증번호 보기"}
          >
            {isCodeVisible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </label>
        <button
          type="button"
          onClick={() => void downloadCsv()}
          disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download className="size-4" aria-hidden="true" />
          <span>{isPending ? "다운로드 중" : "CSV"}</span>
        </button>
      </div>
      {error ? (
        <button
          type="button"
          role="tooltip"
          aria-live="polite"
          onClick={() => setError("")}
          title="클릭하면 닫힙니다."
          className="absolute right-0 top-full z-20 mt-1 max-w-[calc(100vw-40px)] cursor-pointer whitespace-pre-line rounded-md bg-rose-600 px-2.5 py-1.5 text-left text-xs font-medium text-white shadow-lg sm:max-w-none"
        >
          {error}
        </button>
      ) : null}
    </div>
  );
}
