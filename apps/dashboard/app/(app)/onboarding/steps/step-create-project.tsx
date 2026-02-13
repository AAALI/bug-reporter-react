"use client";

import { useState } from "react";
import { IconFolder } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupabaseClient } from "@supabase/supabase-js";

function generateProjectKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "qb_";
  for (let i = 0; i < 12; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

const platforms = [
  { value: "react", label: "React", available: true },
  { value: "react-native", label: "React Native", available: false },
];

export function StepCreateProject({
  supabase,
  orgId,
  onComplete,
}: {
  supabase: SupabaseClient;
  orgId: string;
  onComplete: (projectId: string, projectKey: string, projectName: string) => void;
}) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("react");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const projectId = crypto.randomUUID();
    const projectKey = generateProjectKey();

    // Use client-generated ID to avoid .select() RLS conflict
    const { error: projectError } = await supabase
      .from("projects")
      .insert({
        id: projectId,
        org_id: orgId,
        name: name.trim(),
        project_key: projectKey,
        platform,
      });

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    onComplete(projectId, projectKey, name.trim());
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconFolder className="size-7" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Create your first project
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Each project gets a unique API key for SDK authentication.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-slate-700">
            Project name
          </Label>
          <Input
            id="project-name"
            placeholder="My Web App"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="h-12 rounded-lg border-slate-200 bg-white text-base"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Platform</Label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((p) => (
              <button
                key={p.value}
                type="button"
                disabled={!p.available}
                onClick={() => p.available && setPlatform(p.value)}
                className={`relative flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  platform === p.value
                    ? "border-primary bg-primary/5 text-primary"
                    : p.available
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {p.label}
                {!p.available && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-slate-400">
                    soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
        >
          {loading ? "Creating..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
