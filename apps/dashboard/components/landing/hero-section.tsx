import Link from "next/link";
import Image from "next/image";
import { IconBolt, IconBrowser, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "Jira", logo: "/logos/jira.svg", tone: "border-blue-100 bg-blue-50/85" },
  {
    name: "Linear",
    logo: "/logos/linear.svg",
    tone: "border-violet-100 bg-violet-50/85",
  },
];

const proofPoints = [
  "Screenshots go directly to Jira or Linear",
  "Metadata only - no stored media",
  "No new issue tracker",
];

const metadataFields = ["Browser & OS", "App version", "Page URL", "Environment"];

export function HeroSection() {
  return (
    <section id="workflow" className="h-full px-6 py-8 lg:py-10">
      <div className="mx-auto grid h-full max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hero-reveal hero-reveal-1">
          <h1 className="text-balance text-[clamp(2.35rem,6.2vw,4.4rem)] font-semibold leading-[1.08] tracking-tight text-slate-900">
            Forward bugs to Jira or Linear.
            <br />
            No duplicate <span className="text-primary">storage.</span>
          </h1>
          <p className="hero-reveal hero-reveal-2 mt-6 max-w-2xl text-lg leading-relaxed text-slate-700/75">
            QuickBugs sends screenshots and videos directly to Jira or Linear
            and stores only metadata for release analytics.
          </p>
          <p className="hero-reveal hero-reveal-3 mt-4 text-sm font-semibold text-slate-700">
            No S3 buckets. No duplicate storage. No new tracker.
          </p>
          <div className="hero-reveal hero-reveal-4 mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 rounded-md bg-slate-900 px-8 text-white hover:bg-slate-800"
              asChild
            >
              <Link href="/signup">Start Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-md border-slate-300 bg-white px-8 text-slate-700 hover:bg-slate-50"
              asChild
            >
              <Link href="/docs">View Docs</Link>
            </Button>
          </div>
          <ul className="hero-reveal hero-reveal-5 mt-8 space-y-3 text-base text-slate-700">
            {proofPoints.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <IconCheck className="mt-1 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-reveal hero-reveal-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.07)]">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400" />
          <div className="p-5 lg:p-7">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 lg:p-5">
              <div className="md:hidden">
                <div className="space-y-2">
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-3 text-center">
                    <p className="text-sm font-medium text-slate-900">Your App</p>
                  </div>
                  <p className="text-center text-lg text-slate-400">↓</p>
                  <div className="rounded-md border border-primary/25 bg-primary px-3 py-3 text-center">
                    <p className="text-sm font-semibold text-white">QuickBugs</p>
                  </div>
                  <p className="text-center text-lg text-slate-400">↓</p>
                  <div className="grid grid-cols-2 gap-2">
                    {integrations.map((integration) => (
                      <div
                        key={integration.name}
                        className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-2"
                      >
                        <Image
                          src={integration.logo}
                          alt={`${integration.name} logo`}
                          width={14}
                          height={14}
                          className="size-3.5"
                        />
                        <span className="text-xs font-medium text-slate-900">
                          {integration.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_36px_minmax(0,1.2fr)_36px_minmax(0,1fr)] md:items-center md:gap-2 lg:gap-3">
                <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-5 text-center lg:px-4 lg:py-6">
                  <div className="mx-auto flex size-9 items-center justify-center rounded-md bg-slate-50 text-slate-500">
                    <IconBrowser className="size-4" />
                  </div>
                  <p className="mt-2.5 text-base font-medium text-slate-900">
                    Your App
                  </p>
                </div>

                <span className="flow-hop flow-hop-1">
                  <span className="flow-hop-line" />
                  <span className="flow-hop-arrow">→</span>
                </span>

                <div className="bridge-card min-w-0 rounded-lg border border-primary/25 bg-primary px-3 py-5 text-center shadow-[0_12px_26px_rgba(20,184,166,0.2)] lg:px-4 lg:py-6">
                  <div className="mx-auto flex size-9 items-center justify-center rounded-md bg-white/20 text-white">
                    <IconBolt className="size-4" />
                  </div>
                  <p className="mt-2.5 text-base font-semibold text-white">
                    QuickBugs
                  </p>
                </div>

                <span className="flow-hop flow-hop-2">
                  <span className="flow-hop-line" />
                  <span className="flow-hop-arrow">→</span>
                </span>

                <div className="min-w-0 space-y-2.5">
                  {integrations.map((integration, index) => (
                    <div
                      key={integration.name}
                      className={`integration-row integration-row-${index + 1} flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2.5 lg:px-2.5`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md border ${integration.tone}`}
                      >
                        <Image
                          src={integration.logo}
                          alt={`${integration.name} logo`}
                          width={14}
                          height={14}
                          className="size-3.5"
                        />
                      </span>
                      <span className="truncate text-sm font-medium text-slate-900">
                        {integration.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="metadata-flow mt-4 flex items-center justify-center gap-2.5 text-sm text-slate-600">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                Metadata
              </span>
              <span className="metadata-hop flow-hop flow-hop-meta">
                <span className="flow-hop-line" />
                <span className="flow-hop-arrow">→</span>
              </span>
              <span className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-800">
                Dashboard
              </span>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-800">Metadata logged:</p>
              <ul className="mt-2 grid grid-cols-2 gap-y-1.5 text-sm text-slate-600">
                {metadataFields.map((field) => (
                  <li key={field} className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
