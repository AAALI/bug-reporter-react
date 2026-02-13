"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconMailCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your inbox";

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconMailCheck className="size-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
        Check your email
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        We sent a sign-in link to{" "}
        <span className="font-medium text-slate-700">{email}</span>.
        Click the link to continue.
      </p>
      <p className="mt-6 text-xs text-slate-400">
        Link expires in 1 hour. Check spam if you do not see it.
      </p>
      <div className="mt-8">
        <Button
          variant="outline"
          className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          asChild
        >
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
