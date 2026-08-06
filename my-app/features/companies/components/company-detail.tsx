import type { ComponentType, ReactNode } from "react";
import {
  BadgeDollarSign,
  BadgeInfo,
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Mail,
  MapPinned,
  Package,
  Phone,
  Tags,
  User,
  Users,
} from "lucide-react";

import { formatEmployees } from "@/lib/format";

import type { Company } from "../types";
import { CategoryBadge } from "./category-badge";

type CompanyDetailProps = {
  company: Company;
};

type DetailRowProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
};

type SectionHeadingProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
};

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon, href }: DetailRowProps) {
  const text = (
    <span className="break-words font-semibold text-slate-900">{value}</span>
  );

  return (
    <div className="flex items-start gap-1 py-2">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <div className="mt-1 text-sm leading-6 text-slate-900">
          {href ? (
            <a
              href={href}
              className="inline-flex max-w-full break-all font-semibold text-primary transition hover:opacity-80"
            >
              {text}
            </a>
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
  children,
}: SectionHeadingProps & { children: ReactNode }) {
  return <div className="mt-5">{children}</div>;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const categoryChips = company.categories.length > 0 ? company.categories : [];
  const productChips = company.products.length > 0 ? company.products : [];
  const tagChips = company.tags.length > 0 ? company.tags : [];
  const overviewItems: DetailRowProps[] = [
    {
      label: "대표자",
      value: company.representative,
      icon: User,
    },
    {
      label: "설립일",
      value: formatDate(company.foundedDate),
      icon: CalendarDays,
    },
    {
      label: "업종",
      value: company.industry,
      icon: Building2,
    },

    {
      label: "직원 수",
      value: formatEmployees(company.employees),
      icon: Users,
    },
  ];

  const emailHref = company.contact.includes("@")
    ? `mailto:${company.contact}`
    : company.contact;
  const phoneHref = `tel:${company.phone.replace(/[^\d+]/g, "")}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-gradient-to-br from-sky-50 via-white to-white px-6 py-6 sm:px-8">
        <div className="max-w-4xl">
          <div className="flex gap-2 items-center">
            <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {company.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {company.description}
            </p>

            <div className="mt-5 flex flex-wrap">
              {categoryChips.length > 0 ? (
                categoryChips.map((category) => (
                  <CategoryBadge key={category} category={category} />
                ))
              ) : (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  분류 정보 없음
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="text-lg text-slate-900">
              {company.description || "등록된 설명이 없습니다."}
            </span>
          </div>

          <InfoCard
            icon={BadgeInfo}
            title="기업 개요"
            description="기본 정보와 핵심 지표를 한눈에 확인하세요."
          >
            <dl className="grid gap-1 rounded-2xl px-4 py-5 grid-cols-2">
              {overviewItems.map((item) => (
                <DetailRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                />
              ))}

              <DetailRow
                label="주소"
                value={company.address}
                icon={MapPinned}
              />
              <DetailRow
                label="이메일"
                value={company.contact}
                icon={Mail}
                href={emailHref}
              />
              <DetailRow
                label="전화번호"
                value={company.phone}
                icon={Phone}
                href={phoneHref}
              />
              <DetailRow
                label="웹사이트"
                value={company.website || "등록된 웹사이트가 없습니다."}
                icon={Globe}
                href={company.website}
              />
            </dl>
          </InfoCard>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              {company.industry}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm">
              <Package className="size-4 text-primary" aria-hidden="true" />
              {company.mainProduct}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm">
              <MapPinned className="size-4 text-primary" aria-hidden="true" />
              {company.region} {company.district}
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading
            icon={FileText}
            title="기업 소개"
            description="기업의 핵심 개요를 상세히 확인하세요."
          />
          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            {company.description}
          </p>
          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              주요 제품
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {company.mainProduct}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading
            icon={Package}
            title="주요 제품 / 서비스"
            description="회사에서 제공하는 제품과 서비스 목록입니다."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {productChips.length > 0 ? (
              productChips.map((product) => (
                <span
                  key={product}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  {product}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
                등록된 제품/서비스가 없습니다.
              </span>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading
            icon={Tags}
            title="핵심 키워드"
            description="검색과 분류에 활용되는 태그입니다."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {tagChips.length > 0 ? (
              tagChips.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                등록된 키워드가 없습니다.
              </span>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
