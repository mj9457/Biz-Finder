import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-5 py-16 text-center sm:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">
          기업 정보를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          요청한 기업이 삭제되었거나 잘못된 주소로 접근했습니다.
        </p>
        <Link
          href="/companies"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          검색 목록으로 이동
        </Link>
      </section>
    </div>
  );
}
