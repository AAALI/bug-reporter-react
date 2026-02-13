export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <header className="flex h-16 items-center px-6">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pt-8 pb-16">
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="mt-10">
            <div className="size-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-5 h-7 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
            <div className="mt-8 space-y-5">
              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
