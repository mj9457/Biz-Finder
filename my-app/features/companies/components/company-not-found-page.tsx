import Link from "next/link";
import { Mail, MapPinned, Phone } from "lucide-react";

type CompanyNotFoundPageProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CompanyNotFoundPage({
  title = "요청하신 페이지를 찾을 수 없습니다.",
  description = "주소가 변경되었거나 삭제된 페이지일 수 있습니다. 문제가 계속되면 아래 연락처로 문의해 주세요.",
  primaryHref = "/companies",
  primaryLabel = "기업 목록으로 이동",
  secondaryHref = "/",
  secondaryLabel = "홈으로 이동",
}: CompanyNotFoundPageProps) {
  return (
    <div className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-16 sm:px-8">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <MapPinned className="size-7" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            문의 경기동부상공회의소 박민준 사원
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <a
              href="tel:031-592-3039"
              className="inline-flex items-center gap-2 transition hover:text-primary"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <span>전화 : 031-592-3039(내선번호 305)</span>
            </a>
            <a
              href="mailto:mj9457@korcham.net"
              className="inline-flex items-center gap-2 transition hover:text-primary"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>메일 : mj9457@korcham.net</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {secondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
