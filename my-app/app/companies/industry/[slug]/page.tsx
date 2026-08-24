import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompanySeoLanding } from "@/features/companies/components/company-seo-landing";

const INDUSTRY_PAGES = {
  manufacturing: {
    label: "제조",
    title: "제조기업 검색",
    description:
      "경기동부상공회의소 회원사 중 제조업 기업을 검색하고 주요 제품, 소재 지역, 주소와 연락처 등 기업 정보를 확인하세요.",
  },
  construction: {
    label: "건설",
    title: "건설기업 검색",
    description:
      "경기동부상공회의소 회원사 중 건설업 기업을 검색하고 사업 분야, 소재 지역, 주소와 연락처 등 기업 정보를 확인하세요.",
  },
  distribution: {
    label: "유통",
    title: "유통기업 검색",
    description:
      "경기동부상공회의소 회원사 중 도매·소매 및 유통 기업을 검색하고 주요 품목, 소재 지역, 주소와 연락처를 확인하세요.",
  },
} as const;

type IndustryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(INDUSTRY_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = INDUSTRY_PAGES[slug as keyof typeof INDUSTRY_PAGES];

  if (!page) {
    return { robots: { index: false, follow: false } };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/companies/industry/${slug}` },
    openGraph: {
      title: `${page.title} | 경기동부상공회의소 회원사`,
      description: page.description,
      url: `/companies/industry/${slug}`,
      type: "website",
    },
  };
}

export default async function IndustryCompaniesPage({
  params,
}: IndustryPageProps) {
  const { slug } = await params;
  const page = INDUSTRY_PAGES[slug as keyof typeof INDUSTRY_PAGES];

  if (!page) {
    notFound();
  }

  return (
    <CompanySeoLanding
      title={`경기동부상공회의소 ${page.title}`}
      description={page.description}
      path={`/companies/industry/${slug}`}
      filterParams={{ category: page.label }}
      relatedLinks={[
        { label: "남양주 기업 검색", href: "/companies/namyangju" },
        { label: "구리 기업 검색", href: "/companies/guri" },
        { label: "가평 기업 검색", href: "/companies/gapyeong" },
        { label: "전체 회원사 검색", href: "/companies" },
      ]}
    />
  );
}
