export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
      <div className="mb-4 h-10 w-24 rounded-full bg-slate-200" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse">
        <header className="border-b border-slate-200 bg-gradient-to-br from-sky-50 via-white to-white px-6 py-6 sm:px-8">
          <div className="max-w-4xl space-y-4">
            <div className="h-6 w-32 rounded-full bg-slate-200" />
            <div className="h-10 w-full max-w-3xl rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-full max-w-2xl rounded bg-slate-200" />
              <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-8 w-24 rounded-full bg-slate-200"
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-9 w-32 rounded-full bg-slate-200"
                />
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-2xl bg-slate-200" />
                <div className="min-w-0 flex-1">
                  <div className="h-5 w-28 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-full max-w-sm rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/80 px-4">
                {Array.from({ length: 7 }, (_, index) => (
                  <div key={index} className="flex items-start gap-3 py-3">
                    <div className="size-10 rounded-xl bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-2xl bg-slate-200" />
                <div className="min-w-0 flex-1">
                  <div className="h-5 w-28 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-full max-w-xs rounded bg-slate-200" />
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex items-start gap-3 py-3">
                    <div className="size-10 rounded-xl bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-11 w-full rounded-xl bg-slate-200" />
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-5 w-36 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full max-w-sm rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-100 p-4">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full max-w-xs rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-8 w-24 rounded-full bg-slate-200"
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full max-w-xs rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="h-8 w-20 rounded-full bg-slate-200"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
