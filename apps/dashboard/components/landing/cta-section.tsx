import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const launchSteps = [
  {
    step: "01",
    title: "Create your workspace",
    description: "Set your project name and environment in under a minute.",
  },
  {
    step: "02",
    title: "Drop in the SDK key",
    description: "Initialize the provider and publish with one config value.",
  },
  {
    step: "03",
    title: "Connect Jira or Linear",
    description: "Route bug reports directly to the tracker your team already uses.",
  },
];

const enterpriseChecklist = [
  "SSO/SAML support",
  "Project-level API keys",
  "Priority onboarding",
];

export function CtaSection() {
  return (
    <section className="border-b border-slate-200 bg-white px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900">
            Launch QuickBugs in under 10 minutes
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            A lightweight setup flow for product teams that want clear bug
            reports without changing workflows.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {launchSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold tracking-[0.14em] text-primary">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="mt-8 h-12 rounded-lg bg-primary px-8 text-white hover:bg-primary/90"
            asChild
          >
            <Link href="/login">
              Start Free
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-bold text-slate-900">Enterprise rollout</h3>
          <p className="mt-2 text-sm text-slate-600">
            Need security and onboarding controls for larger teams?
          </p>
          <ul className="mt-5 space-y-3">
            {enterpriseChecklist.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <IconCheck className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-6 h-11 w-full rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            asChild
          >
            <Link href="/docs">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
