export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 sm:px-8">
      <div className="h-10 w-24 rounded-md bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
          </div>
          <div className="mt-5 h-9 w-64 rounded bg-slate-200" />
          <div className="mt-4 h-5 w-full max-w-xl rounded bg-slate-200" />
          <div className="mt-3 h-5 w-full max-w-lg rounded bg-slate-200" />
        </section>
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-24 rounded bg-slate-200" />
          <div className="mt-5 grid gap-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index}>
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
