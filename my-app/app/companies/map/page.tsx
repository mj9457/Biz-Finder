import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, Factory, MapPin } from "lucide-react";

import { CompanyMapDashboard } from "@/features/companies/components/company-map-dashboard";
import { getCompanyMapData } from "@/features/companies/lib/map-data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "회원사 지도 대시보드",
  description:
    "경기동부상공회의소 회원사의 지역 분포를 클러스터 지도와 히트맵으로 확인할 수 있는 대시보드입니다.",
};

export const dynamic = "force-dynamic";

export default async function CompanyMapPage() {
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
                src="/logo-white-header.png"
                alt="경기동부상공회의소"
                width={480}
                height={66}
                sizes="(min-width: 640px) 240px, 192px"
                priority
                unoptimized
                className="h-auto w-48 sm:w-60"
              />
              <span className="mt-2 text-sm font-medium leading-none text-gray-500">
                회원사 지도 대시보드
              </span>
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
              <dt className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                <Building2 className="size-3.5" aria-hidden="true" />
                전체 기업
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {formatNumber(stats.totalCompanies)}
              </dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
              <dt className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                <Factory className="size-3.5" aria-hidden="true" />
                제조 기업
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {formatNumber(stats.manufacturingCompanies)}
              </dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
              <dt className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                <MapPin className="size-3.5" aria-hidden="true" />
                산업단지
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {formatNumber(stats.industrialAreaCompanies)}
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <main className="px-5 py-6 sm:px-8">
        <CompanyMapDashboard points={points} stats={stats} />
      </main>
    </div>
  );
}
