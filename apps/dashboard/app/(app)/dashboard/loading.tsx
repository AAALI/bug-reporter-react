export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="size-10 animate-pulse rounded-lg bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-1">
            <div className="space-y-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 border-b border-slate-100 px-5 py-4 last:border-0">
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-14 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
