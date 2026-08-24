import type { Metadata } from "next";

import { CompanySeoLanding } from "@/features/companies/components/company-seo-landing";

export const metadata: Metadata = {
  title: "가평 기업 검색",
  description:
    "경기동부상공회의소에 등록된 가평군 회원기업을 기업명과 업종별로 검색하고 주소, 연락처, 주요 사업 정보를 확인하세요.",
  alternates: { canonical: "/companies/gapyeong" },
  openGraph: {
    title: "가평 기업 검색 | 경기동부상공회의소 회원사",
    description:
      "가평군 소재 경기동부상공회의소 회원기업의 업종과 기업 정보를 검색할 수 있습니다.",
    url: "/companies/gapyeong",
    type: "website",
  },
};

export default function GapyeongCompaniesPage() {
  return (
    <CompanySeoLanding
      title="가평군 회원기업 검색"
      description="가평군에 소재한 경기동부상공회의소 회원기업을 기업명, 업종, 주요 품목으로 검색하고 기업별 사업 분야와 연락처를 확인할 수 있습니다."
      path="/companies/gapyeong"
      filterParams={{ region: "가평" }}
      relatedLinks={[
        { label: "남양주 기업 검색", href: "/companies/namyangju" },
        { label: "구리 기업 검색", href: "/companies/guri" },
        { label: "전체 회원사 검색", href: "/companies" },
      ]}
    />
  );
}
