"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBuilding, IconCheck, IconLink } from "@tabler/icons-react";

type OrgSectionProps = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  plan: string;
  role: string;
};

export function OrgSection({
  orgId,
  orgName: initialName,
  orgSlug,
  plan,
  role,
}: OrgSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [orgName, setOrgName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = role === "owner";

  async function handleSave() {
    if (!isOwner) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const newSlug = orgName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ name: orgName.trim(), slug: newSlug })
      .eq("id", orgId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Organization</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your organization details and billing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-5">
          {/* Org name */}
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-sm font-medium text-slate-700">
              Organization name
            </Label>
            <div className="relative">
              <IconBuilding className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={!isOwner}
                className={`pl-9 ${!isOwner ? "bg-slate-50 text-slate-500" : ""}`}
              />
            </div>
            {!isOwner && (
              <p className="text-xs text-slate-400">
                Only the organization owner can change the name.
              </p>
            )}
          </div>

          {/* Slug — read-only */}
          <div className="space-y-2">
            <Label htmlFor="org-slug" className="text-sm font-medium text-slate-700">
              Slug
            </Label>
            <div className="relative">
              <IconLink className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="org-slug"
                type="text"
                value={orgSlug}
                disabled
                className="pl-9 bg-slate-50 text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Auto-generated from the organization name.
            </p>
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Current plan</Label>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
                {plan}
              </span>
              <span className="text-xs text-slate-400">
                Plan upgrades coming soon.
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {isOwner && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || orgName.trim() === initialName}
                size="sm"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <IconCheck className="size-4" />
                  Saved
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
