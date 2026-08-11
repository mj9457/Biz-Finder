import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompanyBackButton } from "@/features/companies/components/company-back-button";
import { CompanyDetail } from "@/features/companies/components/company-detail";
import { getCompanyById } from "@/features/companies/lib/queries";

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: CompanyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    return {
      title: "기업 상세정보를 찾을 수 없음",
      description: "요청하신 기업 정보를 찾을 수 없습니다.",
    };
  }

  return {
    title: company.name,
    description: company.description,
  };
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-svh bg-slate-50">
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

      <main className="mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-[1472px] flex-col gap-4 px-4 py-4 sm:px-8 lg:h-[calc(100svh-88px)] lg:gap-5 lg:py-6">
        <div className="min-h-0 flex-1">
          <CompanyDetail company={company} />
        </div>
      </main>
    </div>
  );
}
