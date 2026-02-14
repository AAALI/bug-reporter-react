"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconCheck,
  IconCopy,
  IconFolder,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";

type Project = {
  id: string;
  name: string;
  project_key: string;
  is_active: boolean;
  rate_limit_per_min: number;
  created_at: string;
};

type ProjectSectionProps = {
  projects: Project[];
};

export function ProjectSection({ projects: initialProjects }: ProjectSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage project settings, API keys, and rate limits.
        </p>
      </div>

      {initialProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <IconFolder className="mx-auto size-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [rateLimit, setRateLimit] = useState(project.rate_limit_per_min);
  const [isActive, setIsActive] = useState(project.is_active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name: name.trim(),
        rate_limit_per_min: rateLimit,
        is_active: isActive,
      })
      .eq("id", project.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
    setSaving(false);
  }

  function copyKey() {
    navigator.clipboard.writeText(project.project_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const hasChanges =
    name.trim() !== project.name ||
    rateLimit !== project.rate_limit_per_min ||
    isActive !== project.is_active;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-5">
        {/* Project name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Project name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
          />
        </div>

        {/* Project key — read-only + copy */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Project key</Label>
          <div className="flex items-center gap-2">
            <Input
              value={project.project_key}
              disabled
              className="bg-slate-50 font-mono text-sm text-slate-600"
            />
            <Button variant="outline" size="sm" onClick={copyKey} className="shrink-0">
              {copied ? (
                <IconCheck className="size-4 text-emerald-500" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            Use this key in the SDK to identify your project.
          </p>
        </div>

        {/* Rate limit */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Rate limit (reports per minute)
          </Label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={rateLimit}
            onChange={(e) => setRateLimit(Number(e.target.value))}
          />
          <p className="text-xs text-slate-400">
            Maximum number of reports accepted per minute. Default is 30.
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            {isActive ? (
              <IconPlayerPlay className="size-4 text-emerald-500" />
            ) : (
              <IconPlayerPause className="size-4 text-slate-400" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">
                {isActive ? "Active" : "Paused"}
              </p>
              <p className="text-xs text-slate-400">
                {isActive
                  ? "Project is accepting bug reports."
                  : "Project is paused. Reports will be rejected."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              isActive ? "bg-emerald-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <IconCheck className="size-4" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
