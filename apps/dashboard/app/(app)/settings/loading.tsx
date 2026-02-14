export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header skeleton */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-8 animate-pulse rounded-lg bg-slate-100" />
            <div className="size-8 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />

        <div className="mt-6 flex gap-6">
          {/* Sidebar skeleton */}
          <div className="w-52 shrink-0 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
