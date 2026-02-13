"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconMail, IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to QuickBugs
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email. We handle the rest.
        </p>
      </div>

      <form onSubmit={handleMagicLink} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-lg border-slate-200 bg-white"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          <IconMail className="size-4" />
          {loading ? "Sending link..." : "Continue with email"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        No password. No account setup. New users are onboarded automatically.
      </p>

      <div className="relative my-8">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f7fb] px-3 text-xs text-slate-400">
          coming soon
        </span>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          disabled
          className="h-11 w-full rounded-lg border-slate-200 bg-white text-slate-400"
        >
          <IconBrandGithub className="size-4" />
          Continue with GitHub
        </Button>
        <Button
          variant="outline"
          disabled
          className="h-11 w-full rounded-lg border-slate-200 bg-white text-slate-400"
        >
          <IconBrandGoogle className="size-4" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
