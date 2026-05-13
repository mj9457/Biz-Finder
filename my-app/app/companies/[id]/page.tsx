import type { Metadata } from "next";
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
      title: "기업 정보를 찾을 수 없음",
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
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 sm:px-8">
      <div>
        <CompanyBackButton />
      </div>
      <CompanyDetail company={company} />
    </div>
  );
}
