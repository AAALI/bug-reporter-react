"use client";

import { useState } from "react";
import { IconBuilding } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StepCreateOrg({
  supabase,
  userId,
  onComplete,
}: {
  supabase: SupabaseClient;
  userId: string;
  onComplete: (orgId: string, orgSlug: string) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const orgId = crypto.randomUUID();
    const slug = slugify(name.trim());

    // Create organization — use client-generated ID to avoid .select() RLS conflict
    const { error: orgError } = await supabase
      .from("organizations")
      .insert({ id: orgId, name: name.trim(), slug });

    if (orgError) {
      if (orgError.message.includes("unique")) {
        setError("Organization name already taken. Try a different name.");
      } else {
        setError(orgError.message);
      }
      setLoading(false);
      return;
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from("members")
      .insert({ org_id: orgId, user_id: userId, role: "owner" });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    onComplete(orgId, slug);
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconBuilding className="size-7" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Name your organization
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Your team workspace. Projects and members belong here.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="org-name" className="text-slate-700">
            Organization name
          </Label>
          <Input
            id="org-name"
            placeholder="Acme Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="h-12 rounded-lg border-slate-200 bg-white text-base"
          />
          {name.trim() && (
            <p className="text-xs text-slate-400">
              quickbugs.com/{slugify(name.trim())}
            </p>
          )}
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
