import Link from "next/link";
import { IconBug } from "@tabler/icons-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <header className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <IconBug className="size-5 text-primary" />
          <span>QuickBugs</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
      <footer className="pb-8 text-center text-xs text-slate-400">
        Built on Supabase + Cloudflare. Two services. Minimal overhead.
      </footer>
    </div>
  );
}
