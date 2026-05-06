export function CompanyListSkeleton() {
  return (
    <section aria-label="기업 목록 로딩 중">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[820px] divide-y divide-slate-200">
            <div className="grid grid-cols-[1.6fr_0.8fr_1fr_1.4fr_1.2fr] gap-4 bg-slate-50 px-4 py-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-4 rounded bg-slate-200" />
              ))}
            </div>
            {Array.from({ length: 6 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1.6fr_0.8fr_1fr_1.4fr_1.2fr] gap-4 px-4 py-4"
              >
                {Array.from({ length: 5 }, (_, cellIndex) => (
                  <div key={cellIndex} className="grid gap-2">
                    <div className="h-4 rounded bg-slate-200" />
                    {cellIndex === 0 ? (
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
