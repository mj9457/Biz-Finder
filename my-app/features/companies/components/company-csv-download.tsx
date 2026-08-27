"use client";

import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { createCompanyExportSearchParams } from "../lib/search-params";
import type { CompanySearchFilters } from "../types";

type CompanyCsvDownloadProps = {
  filters: CompanySearchFilters;
};

type DownloadStatus = "input" | "error" | "loading" | "success";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<DownloadStatus>("input");
  const [isPending, setIsPending] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsModalOpen(false);
        setAuthCode("");
        setError("");
        setStatus("input");
        setIsCapsLockOn(false);
        setIsCodeVisible(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, isPending]);

  function openModal() {
    setAuthCode("");
    setError("");
    setStatus("input");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isPending) {
      return;
    }

    setIsModalOpen(false);
    setAuthCode("");
    setError("");
    setStatus("input");
    setIsCapsLockOn(false);
    setIsCodeVisible(false);
  }

  async function downloadCsv() {
    const trimmedCode = authCode.trim();

    if (!trimmedCode) {
      setError("인증번호를 입력해 주세요.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("loading");
    setIsPending(true);

    try {
      const params = createCompanyExportSearchParams(filters);
      params.set("code", trimmedCode);
      const response = await fetch(`/api/companies/export?${params}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        setError("인증번호가 올바르지 않습니다.\n문의 : 031-592-3039(305) 박민준 사원");
        setStatus("error");
        return;
      }

      if (!response.ok) {
        setError("CSV 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        setStatus("error");
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
      setStatus("success");
    } catch {
      setError("네트워크 오류로 CSV 다운로드에 실패했습니다.");
      setStatus("error");
    } finally {
      setIsPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void downloadCsv();
  }

  function handleCapsLock(event: React.KeyboardEvent<HTMLInputElement>) {
    setIsCapsLockOn(event.getModifierState("CapsLock"));
  }

  function renderModalContent() {
    if (status === "loading") {
      return (
        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-sky-100 text-primary">
            <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
          </div>
          <h2 id="csv-download-title" className="mt-5 text-xl font-bold text-slate-950">
            CSV 다운로드 중
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            필터 조건에 맞는 기업 목록을 준비하고 있습니다.
            <br />
            잠시만 기다려 주세요.
          </p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </div>
          <h2 id="csv-download-title" className="mt-5 text-xl font-bold text-slate-950">
            다운로드가 완료되었습니다
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            CSV 파일이 기기에 저장되었습니다.
          </p>
          <button
            type="button"
            onClick={closeModal}
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            확인
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center px-0 pb-6 pt-8 text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-sky-100 text-primary">
            <Download className="size-8" aria-hidden="true" />
          </div>
          <h2 id="csv-download-title" className="mt-5 text-xl font-bold text-slate-950">
            CSV 파일 다운로드
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            다운로드를 위해 인증번호를 입력해 주세요.
          </p>
        </div>

        <label className="block text-left">
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            인증번호
          </span>
          <span className="relative block">
            <KeyRound
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              autoFocus
              value={authCode}
              type={isCodeVisible ? "text" : "password"}
              inputMode="numeric"
              autoComplete="off"
              onChange={(event) => setAuthCode(event.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              onBlur={() => setIsCapsLockOn(false)}
              placeholder="인증번호 입력"
              aria-invalid={status === "error"}
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setIsCodeVisible((visible) => !visible)}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={isCodeVisible ? "인증번호 숨기기" : "인증번호 보기"}
              title={isCodeVisible ? "인증번호 숨기기" : "인증번호 보기"}
            >
              {isCodeVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>

        {isCapsLockOn ? (
          <p className="mt-2 text-xs font-medium text-amber-600">
            Caps Lock이 켜져 있습니다.
          </p>
        ) : null}
        {status === "error" ? (
          <p
            role="alert"
            className="mt-3 whitespace-pre-line rounded-md bg-rose-50 px-3 py-2.5 text-left text-xs font-medium leading-5 text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            취소
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            다운로드
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex shrink-0">
        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-slate-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-4"
        >
          <Download className="size-4" aria-hidden="true" />
          CSV 다운로드
        </button>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="csv-download-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="inline-flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="CSV 다운로드 모달 닫기"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      ) : null}
    </>
  );
}
