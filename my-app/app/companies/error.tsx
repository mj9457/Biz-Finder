"use client";

import Link from "next/link";
import { AlertTriangle, Mail, Phone, RefreshCw } from "lucide-react";
import { useEffect } from "react";

type CompaniesErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function CompaniesErrorPage({
  error,
  unstable_retry,
}: CompaniesErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-16 sm:px-8">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-slate-950 sm:text-3xl">
          페이지를 불러오는 중 문제가 발생했습니다.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 아래 연락처로
          문의해 주세요.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            문의 경기동부상공회의소 박민준 사원
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <a
              href="tel:031-592-3039"
              className="inline-flex items-center gap-2 transition hover:text-primary"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <span>전화 : 031-592-3039(내선번호 305)</span>
            </a>
            <a
              href="mailto:mj9457@korcham.net"
              className="inline-flex items-center gap-2 transition hover:text-primary"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>메일 : mj9457@korcham.net</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            다시 시도
          </button>
          <Link
            href="/companies"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            기업 목록으로 이동
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 text-xs text-slate-400">
            오류 식별자: {error.digest}
          </p>
        ) : null}
      </section>
    </div>
  );
}
