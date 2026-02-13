import {
  IconSend,
  IconFileAnalytics,
  IconSubtask,
} from "@tabler/icons-react";

const reliabilityCards = [
  {
    icon: IconSend,
    title: "Direct Forwarding",
    description:
      "Screenshots and videos live in Jira or Linear, not our servers. We never store your media assets.",
  },
  {
    icon: IconFileAnalytics,
    title: "Metadata Only",
    description:
      "We log OS, browser, and version for patterns. Focus on debugging with exact technical context.",
  },
  {
    icon: IconSubtask,
    title: "Zero Complexity",
    description:
      "No new tracker to manage. Your team continues to use existing workflows without context switching.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="features" className="border-b border-slate-200 bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Infrastructure-grade reliability
          </h2>
          <p className="mt-3 text-slate-600">
            Built for modern engineering teams who value speed and privacy.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {reliabilityCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition-colors hover:border-primary/55"
            >
              <div className="mb-4 text-primary">
                <card.icon className="size-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
