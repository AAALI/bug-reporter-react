"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepCreateOrg } from "./steps/step-create-org";
import { StepCreateProject } from "./steps/step-create-project";
import { StepConnectTracker } from "./steps/step-connect-tracker";
import { StepInstallSdk } from "./steps/step-install-sdk";
import { StepVerify } from "./steps/step-verify";

const STEPS = [
  { label: "Organization", number: 1 },
  { label: "Project", number: 2 },
  { label: "Tracker", number: 3 },
  { label: "Install SDK", number: 4 },
  { label: "Verify", number: 5 },
];

interface OnboardingState {
  orgId: string;
  orgSlug: string;
  projectId: string;
  projectKey: string;
  projectName: string;
}

export function OnboardingWizard({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>({
    orgId: "",
    orgSlug: "",
    projectId: "",
    projectKey: "",
    projectName: "",
  });
  const router = useRouter();
  const supabase = createClient();

  function handleOrgCreated(orgId: string, orgSlug: string) {
    setState((s) => ({ ...s, orgId, orgSlug }));
    setStep(2);
  }

  function handleProjectCreated(
    projectId: string,
    projectKey: string,
    projectName: string
  ) {
    setState((s) => ({ ...s, projectId, projectKey, projectName }));
    setStep(3);
  }

  function handleTrackerDone() {
    setStep(4);
  }

  function handleSdkDone() {
    setStep(5);
  }

  function handleComplete() {
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-xl">
      <ProgressBar current={step} steps={STEPS} />
      <div className="mt-10">
        {step === 1 && (
          <StepCreateOrg
            supabase={supabase}
            userId={userId}
            onComplete={handleOrgCreated}
          />
        )}
        {step === 2 && (
          <StepCreateProject
            supabase={supabase}
            orgId={state.orgId}
            onComplete={handleProjectCreated}
          />
        )}
        {step === 3 && (
          <StepConnectTracker
            supabase={supabase}
            projectId={state.projectId}
            onComplete={handleTrackerDone}
          />
        )}
        {step === 4 && (
          <StepInstallSdk
            projectKey={state.projectKey}
            onComplete={handleSdkDone}
          />
        )}
        {step === 5 && (
          <StepVerify
            supabase={supabase}
            projectId={state.projectId}
            projectName={state.projectName}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  current,
  steps,
}: {
  current: number;
  steps: { label: string; number: number }[];
}) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s) => (
        <div key={s.number} className="flex flex-1 flex-col items-center gap-2">
          <div
            className={`h-1.5 w-full rounded-full transition-colors ${
              s.number <= current ? "bg-primary" : "bg-slate-200"
            }`}
          />
          <span
            className={`text-[11px] font-medium transition-colors ${
              s.number <= current ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
