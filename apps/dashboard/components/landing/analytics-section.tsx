import { IconCheck } from "@tabler/icons-react";

const bullets = [
  "Automated environment detection (User-Agent, OS, Screen Size)",
  "URL and Route tracking for bottleneck identification",
  "Version-stamped reporting for release confidence",
];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_18px_48px_rgba(2,6,23,0.45)]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Immediate Evidence
                </p>
                <h3 className="mt-1 text-2xl font-bold">Release Patterns</h3>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Live Data
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                <span className="text-sm text-slate-600">Top Version</span>
                <span className="font-mono text-sm font-bold text-primary">
                  v1.2.4 — 18 reports
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                <span className="text-sm text-slate-600">Primary Browser</span>
                <span className="font-mono text-sm font-bold text-primary">
                  Chrome 121 — 63%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                <span className="text-sm text-slate-600">Affected Route</span>
                <span className="font-mono text-sm font-bold text-primary">
                  /checkout — 12 reports
                </span>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-slate-100 p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Device Health Distribution
              </p>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[63%] bg-primary" />
                <div className="h-full w-[20%] bg-slate-300" />
                <div className="h-full w-[17%] bg-slate-200" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  Desktop
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-slate-300" />
                  Mobile
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-slate-200" />
                  Tablet
                </span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-balance text-4xl font-bold leading-tight text-white">
              Identify regressions with data, not screenshots.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              While media goes straight to your tracker, we analyze the
              technical footprint. Spot version-specific regressions and
              browser-only bugs before they escalate.
            </p>
            <ul className="mt-8 space-y-4">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-slate-100">
                  <span className="mt-0.5 text-primary">
                    <IconCheck className="size-5" />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
