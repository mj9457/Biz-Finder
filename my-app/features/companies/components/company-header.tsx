import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type CompanyHeaderProps = {
  mobileMenuButton?: ReactNode;
  rightAction?: ReactNode;
};

export function CompanyHeader({
  mobileMenuButton,
  rightAction,
}: CompanyHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sm:h-[90px]">
      <div className="mx-auto flex w-full max-w-[1472px] flex-col px-4 sm:h-full sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-8">
        <div className="flex min-h-[64px] max-h-[90px] min-w-0 items-center gap-3 sm:h-full sm:min-h-0 sm:gap-4">
          {mobileMenuButton}
          <Link href="/companies" aria-label="회원사 검색으로 이동">
            <Image
              src="/logo.png?v=20260828"
              alt="경기동부상공회의소"
              width={480}
              height={66}
              unoptimized
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="h-auto w-40 sm:w-60"
            />
          </Link>
        </div>

        <div className="flex min-h-[48px] items-center justify-between gap-3 border-t border-slate-100 sm:min-h-0 sm:justify-end sm:gap-8 sm:border-t-0">
          <nav
            aria-label="회원사 메뉴"
            className="flex items-center gap-5 sm:gap-10"
          >
            <Link
              href="/companies"
              className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-primary sm:text-base"
            >
              회원사 검색
            </Link>
            <Link
              href="/companies/kakaomap"
              className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-primary sm:text-base"
            >
              회원사 지도
            </Link>
          </nav>
          {rightAction}
        </div>
      </div>
    </header>
  );
}
