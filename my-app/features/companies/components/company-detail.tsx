import { formatEmployees } from "@/lib/format";
import type { Company } from "../types";
import { CategoryBadge } from "./category-badge";

type CompanyDetailProps = {
  company: Company;
};

export function CompanyDetail({ company }: CompanyDetailProps) {
  const profileItems = [
    ["대표자명", company.representative],
    ["지역", `${company.region} ${company.district}`],
    ["주요품목", company.mainProduct],
    ["업종", company.categories.join(", ")],
    ["연락처", company.contact],
    ["직원수", formatEmployees(company.employees)],
    ["대표전화번호", company.phone],
    ["설립일", company.foundedDate],
  ];

  return (
    <article className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {company.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
          {company.name}
        </h1>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              대표자명
            </dt>
            <dd className="mt-1 font-medium text-slate-900">
              {company.representative}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              지역
            </dt>
            <dd className="mt-1 font-medium text-slate-900">
              {company.region} {company.district}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              주요품목
            </dt>
            <dd className="mt-1 font-medium text-slate-900">
              {company.mainProduct}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              인증정보
            </dt>
            <dd className="mt-1 font-medium text-slate-900">
              {company.certificationInfo}
            </dd>
          </div>
        </dl>
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-950">기업소개</h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {company.description}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-950">전체품목</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.products.map((product) => (
              <span
                key={product}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-950">해시태그</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">기업 개요</h2>
        <dl className="mt-4 grid gap-4">
          {profileItems.map(([label, value]) => (
            <div key={label} className="border-b border-slate-100 pb-3">
              <dt className="text-xs font-medium uppercase text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {value}
              </dd>
            </div>
          ))}
          <div className="border-b border-slate-100 pb-3">
            <dt className="text-xs font-medium uppercase text-slate-500">
              홈페이지 URL
            </dt>
            <dd className="mt-1">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-semibold text-primary hover:opacity-80"
                >
                  {company.website}
                </a>
              ) : (
                <span className="text-sm font-medium text-slate-500">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              인증 여부
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {company.certificationStatus}
            </dd>
          </div>
        </dl>
      </aside>
    </article>
  );
}
