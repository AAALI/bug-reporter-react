"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconMail, IconUser } from "@tabler/icons-react";

type ProfileSectionProps = {
  email: string;
  name: string;
};

export function ProfileSection({ email, name: initialName }: ProfileSectionProps) {
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your personal account information.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-5">
          {/* Email — read-only */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </Label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-9 bg-slate-50 text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Display name
            </Label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || name.trim() === initialName}
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
        </div>
      </div>
    </div>
  );
}
