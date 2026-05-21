import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import headerLogo from "@/public/logo-white-header.png";

import { CompanyKakaoMapDashboard } from "@/features/companies/components/company-kakao-map-dashboard";
import { getCompanyMapData } from "@/features/companies/lib/map-data";

export const metadata: Metadata = {
  title: "회원사 지도",
  description:
    "경기동부상공회의소 회원사의 지역 분포를 카카오맵 기반 클러스터 지도와 필터로 확인할 수 있는 대시보드입니다.",
};

export const dynamic = "force-dynamic";

export default async function CompanyKakaoMapPage() {
  const { points, stats } = await getCompanyMapData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-primary/30 bg-white">
        <div className="flex w-full flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/companies"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="회원사 검색으로 돌아가기"
              title="회원사 검색으로 돌아가기"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/companies" className="flex min-w-0 flex-col">
              <Image
                src={headerLogo}
                alt="경기동부상공회의소"
                width={480}
                height={66}
                sizes="(min-width: 640px) 240px, 192px"
                className="h-auto w-48 sm:w-60"
                loading="lazy"
              />
              <span className="mt-2 text-sm font-medium leading-none text-gray-500">
                회원사 지도
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="px-0 py-2 sm:px-8">
        <CompanyKakaoMapDashboard points={points} stats={stats} />
      </main>
    </div>
  );
}
