import type { Metadata } from "next";

import { CompanyHeader } from "@/features/companies/components/company-header";
import { CompanyMapDashboard } from "@/features/companies/components/company-map-dashboard";
import { getCompanyMapData } from "@/features/companies/lib/map-data";

export const metadata: Metadata = {
  title: "회원사 지도 대시보드",
  description:
    "경기동부상공회의소 회원사의 지역 분포를 클러스터 지도와 행정구역 경계로 확인할 수 있는 대시보드입니다.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function CompanyMapPage() {
  const { points, stats } = await getCompanyMapData();

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyHeader />
      <main className="px-0 py-2t sm:px-8">
        <CompanyMapDashboard points={points} stats={stats} />
      </main>
    </div>
  );
}
