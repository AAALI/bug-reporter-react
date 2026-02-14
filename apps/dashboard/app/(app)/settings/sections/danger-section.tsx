"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconAlertTriangle } from "@tabler/icons-react";

type DangerSectionProps = {
  orgId: string;
  role: string;
};

export function DangerSection({ orgId, role }: DangerSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = role === "owner";

  async function handleLeaveOrg() {
    if (!confirm("Are you sure you want to leave this organization?")) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: leaveError } = await supabase
      .from("members")
      .delete()
      .eq("org_id", orgId)
      .eq("user_id", user.id);

    if (leaveError) {
      setError(leaveError.message);
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  async function handleDeleteOrg() {
    if (confirmText !== "delete my organization") return;
    setDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-slate-500">
          Irreversible actions. Proceed with caution.
        </p>
      </div>

      {/* Leave org */}
      {!isOwner && (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Leave organization
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                You will lose access to all projects and data in this
                organization.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLeaveOrg}
              >
                Leave organization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete org — owner only */}
      {isOwner && (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Delete organization
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This will permanently delete your organization, all projects,
                integrations, and report history. This action cannot be undone.
              </p>
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Type{" "}
                  <span className="font-mono font-semibold text-red-600">
                    delete my organization
                  </span>{" "}
                  to confirm.
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my organization"
                  className="max-w-xs font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDeleteOrg}
                  disabled={
                    deleting || confirmText !== "delete my organization"
                  }
                >
                  {deleting
                    ? "Deleting…"
                    : "Permanently delete organization"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
