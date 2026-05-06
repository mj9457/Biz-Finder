import { CompanyListSkeleton } from "@/features/companies/components/company-list-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="px-5 py-6 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-0 lg:py-0">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm lg:min-h-screen lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:shadow-none">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5 lg:px-6">
            <div className="h-6 w-24 rounded bg-slate-200" />
          </div>
          <div className="grid gap-4 p-4 sm:p-5 lg:p-6">
            <div className="h-11 rounded-md bg-slate-200" />
            <div className="h-11 rounded-md bg-slate-200" />
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-10 rounded-md bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-1">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex w-full flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="h-6 w-72 rounded bg-slate-200" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-[58px] w-24 rounded-md border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8">
          <div className="w-full">
            <CompanyListSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
