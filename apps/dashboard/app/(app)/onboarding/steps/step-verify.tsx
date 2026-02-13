"use client";

import { useState, useEffect, useCallback } from "react";
import { IconRadar, IconCheck, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { SupabaseClient } from "@supabase/supabase-js";

export function StepVerify({
  supabase,
  projectId,
  projectName,
  onComplete,
}: {
  supabase: SupabaseClient;
  projectId: string;
  projectName: string;
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<"waiting" | "found">("waiting");
  const [pollCount, setPollCount] = useState(0);

  const checkForReports = useCallback(async () => {
    const { data } = await supabase
      .from("report_events")
      .select("id")
      .eq("project_id", projectId)
      .limit(1);

    if (data && data.length > 0) {
      setStatus("found");
    }
    setPollCount((c) => c + 1);
  }, [supabase, projectId]);

  // Auto-poll every 5 seconds
  useEffect(() => {
    if (status === "found") return;
    const interval = setInterval(checkForReports, 5000);
    return () => clearInterval(interval);
  }, [status, checkForReports]);

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {status === "waiting" ? (
          <IconRadar className="size-6" />
        ) : (
          <IconCheck className="size-6" />
        )}
      </div>

      {status === "waiting" ? (
        <>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Waiting for first report
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Submit a bug report from your app using the QuickBugs SDK.
            This screen updates automatically.
          </p>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            {/* Animated radar rings */}
            <div className="relative mx-auto flex size-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
              <span className="absolute inset-2 animate-ping rounded-full bg-primary/15 [animation-delay:0.5s]" />
              <span className="relative flex size-10 items-center justify-center rounded-full bg-primary/20">
                <span className="size-3 rounded-full bg-primary" />
              </span>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-900">
              Listening on {projectName}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Polling every 5 seconds{pollCount > 0 ? ` · ${pollCount} checks` : ""}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={checkForReports}
              variant="outline"
              className="h-12 w-full rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Check now
            </Button>
            <Button
              onClick={onComplete}
              className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
            >
              Go to dashboard
              <IconArrowRight className="size-4" />
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            You can finish setup later from the dashboard.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            First report received
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your project is connected and forwarding reports.
          </p>

          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <div className="relative mx-auto flex size-16 items-center justify-center">
              <span className="absolute inset-0 animate-[scale-in_0.3s_ease-out] rounded-full bg-primary/10" />
              <IconCheck className="relative size-8 text-primary" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">
              Setup complete
            </p>
          </div>

          <Button
            onClick={onComplete}
            className="mt-8 h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
          >
            Go to dashboard
            <IconArrowRight className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
