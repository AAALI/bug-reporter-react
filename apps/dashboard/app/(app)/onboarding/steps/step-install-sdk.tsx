"use client";

import { useState } from "react";
import { IconCode, IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function StepInstallSdk({
  projectKey,
  onComplete,
}: {
  projectKey: string;
  onComplete: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState(false);

  async function copyProjectKey() {
    await navigator.clipboard.writeText(projectKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconCode className="size-7" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Your project is ready
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        The React SDK is not published yet. Save your project key —
        you will need it when the SDK is available.
      </p>

      <div className="mt-8 space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Project key
            </p>
            <button
              type="button"
              onClick={copyProjectKey}
              className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              {copiedKey ? (
                <IconCheck className="size-3" />
              ) : (
                <IconCopy className="size-3" />
              )}
              {copiedKey ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 font-mono text-base text-slate-900">{projectKey}</p>
          <p className="mt-3 text-xs text-slate-400">
            This key authenticates your SDK with the ingestion endpoint.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-900">
            SDK coming soon
          </p>
          <p className="mt-1 text-sm text-amber-700">
            The @quickbugs/react package is under development.
            We will notify you when it is ready to install.
          </p>
        </div>
      </div>

      <Button
        onClick={onComplete}
        className="mt-8 h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
      >
        Continue
      </Button>
    </div>
  );
}
