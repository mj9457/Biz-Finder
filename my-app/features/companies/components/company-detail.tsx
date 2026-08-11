import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
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
import { CompanyLocationMap } from "./company-location-map";

type CompanyDetailProps = {
  company: Company;
};

type DetailRowProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  newTab?: boolean;
};

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getDate()).padStart(2, "0")}`;
}

function getKakaoMapUrl(company: Company) {
  const hasCoordinate =
    typeof company.latitude === "number" &&
    Number.isFinite(company.latitude) &&
    typeof company.longitude === "number" &&
    Number.isFinite(company.longitude);

  if (hasCoordinate) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(company.name)},${company.latitude},${company.longitude}`;
  }

  return `https://map.kakao.com/link/search/${encodeURIComponent(company.address)}`;
}

function DetailRow({ label, value, icon: Icon, href, newTab }: DetailRowProps) {
  const text = (
    <span className="break-words font-semibold leading-6 text-slate-900">
      {value}
    </span>
  );

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="inline-flex size-13 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm sm:text-[15px]">
          {href ? (
            <a
              href={href}
              target={newTab ? "_blank" : undefined}
              rel={newTab ? "noopener noreferrer" : undefined}
              className="break-all font-semibold text-primary transition hover:opacity-75"
            >
              {text}
            </a>
          ) : (
            text
          )}
        </dd>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgb(15_23_42_/_0.08)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-13 shrink-0 items-center justify-center rounded-full bg-sky-50 text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DetailChip({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const emailHref = company.contact.includes("@")
    ? `mailto:${company.contact}`
    : company.contact;
  const phoneHref = `tel:${company.phone.replace(/[^\d+]/g, "")}`;
  const categoryChips = company.categories.length > 0 ? company.categories : [];
  const productChips = company.products.length > 0 ? company.products : [];
  const tagChips = company.tags.length > 0 ? company.tags : [];

  return (
    <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.38fr_0.62fr]">
      <section className="relative flex min-h-0 flex-col overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50/80 via-white 25% to-white p-6 shadow-[0_2px_8px_rgb(15_23_42_/_0.08)] sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-[24px] border-sky-100/60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-16 top-0 size-28 opacity-40 [background-image:radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:7px_7px]"
        />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
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
          <h1 className="mt-4 break-words text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {company.name}
          </h1>
        </div>

        <div className="relative mt-8 grid items-start gap-6 lg:grid-cols-[minmax(220px,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sky-50">
            <Image
              src={company.imageUrl || "/company-placeholder.svg"}
              alt={
                company.imageUrl
                  ? `${company.name} 대표 이미지`
                  : `${company.name} 대표 이미지 준비 영역`
              }
              fill
              sizes="(min-width: 1024px) 300px, 100vw"
              className="object-cover"
            />
            {!company.imageUrl ? (
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-slate-950/55 px-3 py-2 text-xs font-medium text-white">
                <ImageIcon className="size-4" aria-hidden="true" />
                대표이미지 준비 영역
              </div>
            ) : null}
          </div>

          <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:gap-y-4">
            <DetailRow
              label="대표자"
              value={company.representative}
              icon={User}
            />
            <DetailRow
              label="설립일"
              value={formatDate(company.foundedDate)}
              icon={CalendarDays}
            />
            <DetailRow label="업종" value={company.industry} icon={Building2} />
            <DetailRow
              label="직원 수"
              value={formatEmployees(company.employees)}
              icon={Users}
            />
            <DetailRow label="주소" value={company.address} icon={MapPinned} />
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
              newTab
            />
          </dl>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <DetailChip icon={Building2}>{company.industry}</DetailChip>
          <DetailChip icon={Package}>{company.mainProduct}</DetailChip>
          <DetailChip icon={MapPin}>
            {company.region} {company.district}
          </DetailChip>
        </div>

        <div className="relative mt-4 min-h-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-3 px-1">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">위치</h2>
                <p className="truncate text-xs text-slate-500">
                  {company.address}
                </p>
              </div>
            </div>
            <a
              href={getKakaoMapUrl(company)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-sky-50"
            >
              지도 바로가기
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="h-40 sm:h-44 lg:h-40">
            <CompanyLocationMap company={company} />
          </div>
        </div>
      </section>

      <div className="grid min-h-0 gap-5 lg:grid-rows-[1.1fr_0.85fr_0.95fr]">
        <SectionCard
          icon={FileText}
          title="기업 소개"
          description="기업의 핵심 개요를 상세히 확인하세요."
        >
          <div className="mt-auto rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <p className="text-sm font-semibold text-primary">주요 제품</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {company.mainProduct}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          icon={Package}
          title="주요 제품 / 서비스"
          description="회사에서 제공하는 제품과 서비스 목록입니다."
        >
          <div className="mt-auto flex flex-wrap gap-2">
            {productChips.length > 0 ? (
              productChips.map((product) => (
                <span
                  key={product}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {product}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">
                등록된 제품/서비스가 없습니다.
              </span>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon={Tags}
          title="핵심 키워드"
          description="검색과 분류에 활용되는 태그입니다."
        >
          <div className="mt-auto flex flex-wrap gap-2">
            {tagChips.length > 0 ? (
              tagChips.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">
                등록된 키워드가 없습니다.
              </span>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
