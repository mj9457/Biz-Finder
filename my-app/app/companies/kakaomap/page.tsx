import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CompanyBackButton } from "@/features/companies/components/company-back-button";

import { CompanyKakaoMapDashboard } from "@/features/companies/components/company-kakao-map-dashboard";
import { getCompanyMapData } from "@/features/companies/lib/map-data";

export const metadata: Metadata = {
  title: "회원사 지도",
  description:
    "경기동부상공회의소 회원사의 지역 분포를 카카오맵 기반 클러스터 지도와 필터로 확인할 수 있는 대시보드입니다.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function CompanyKakaoMapPage() {
  const { points, stats } = await getCompanyMapData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="min-h-[88px] border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[88px] w-full max-w-[1472px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-8 sm:py-0">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <Link href="/companies" aria-label="회원사 검색으로 이동">
              <Image
                src="/logo.png"
                alt="경기동부상공회의소"
                width={480}
                height={66}
                priority
                className="h-auto w-40 sm:w-60"
              />
            </Link>
            <Link
              href="/companies"
              className="text-sm font-semibold text-slate-700 transition hover:text-primary sm:text-base"
            >
              회원사 검색
            </Link>
          </div>
          <CompanyBackButton />
        </div>
      </header>
      <main className="px-0 py-2 sm:px-8">
        <CompanyKakaoMapDashboard points={points} stats={stats} />
      </main>
    </div>
  );
}
