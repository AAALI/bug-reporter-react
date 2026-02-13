import { IconShieldCheck, IconSparkles } from "@tabler/icons-react";

const cards = [
  {
    icon: IconShieldCheck,
    title: "Security First",
    description:
      "Zero-knowledge storage. Your source code and assets stay within your controlled environments.",
  },
  {
    icon: IconSparkles,
    title: "Performant SDK",
    description:
      "Lightweight bundle size with lazy-loading for video capture components.",
  },
];

export function SecuritySection() {
  return (
    <section id="integration" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Simple integration.
              <br />
              Enterprise power.
            </h2>
            <p className="mt-6 max-w-lg text-slate-600">
              Install the provider, drop in your API key, and your frontend is
              instantly reporting high-fidelity technical data.
            </p>
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6 font-mono text-sm text-slate-200 shadow-[0_24px_52px_rgba(15,23,42,0.2)]">
              <div className="mb-6 flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/60" />
                <span className="size-3 rounded-full bg-amber-500/60" />
                <span className="size-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="space-y-1 leading-6">
                <p>
                  <span className="text-primary">import</span>{" "}
                  {"{ BugReporterProvider }"}{" "}
                  <span className="text-primary">from</span>{" "}
                  <span className="text-amber-300">&quot;@quickbugs/react&quot;</span>;
                </p>
                <p className="h-3" />
                <p className="text-slate-500">{"// Initialize once"}</p>
                <p>
                  <span className="text-primary">function</span>{" "}
                  <span className="text-sky-300">App</span>() {"{"}
                </p>
                <p>
                  {"  "}
                  <span className="text-primary">return</span> (
                </p>
                <p>
                  {"    "}
                  <span className="text-sky-300">&lt;BugReporterProvider</span>
                </p>
                <p>
                  {"      "}
                  <span className="text-sky-400">apiKey</span>=
                  <span className="text-amber-300">&quot;qb_live_49k2...&quot;</span>
                </p>
                <p>
                  {"      "}
                  <span className="text-sky-400">target</span>=
                  <span className="text-amber-300">&quot;linear&quot;</span>
                </p>
                <p>
                  {"    "}
                  <span className="text-sky-300">&gt;</span>
                </p>
                <p>
                  {"      "}
                  <span className="text-sky-300">&lt;MainContent /&gt;</span>
                </p>
                <p>
                  {"    "}
                  <span className="text-sky-300">&lt;/BugReporterProvider&gt;</span>
                </p>
                <p>{"  "});</p>
                <p>{"}"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex gap-4 rounded-xl bg-slate-50 p-6"
              >
                <div className="shrink-0 rounded-lg border border-slate-100 bg-white p-3 text-primary">
                  <card.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
