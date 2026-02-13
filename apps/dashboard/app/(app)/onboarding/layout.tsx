import Link from "next/link";
import { IconBug } from "@tabler/icons-react";

export default function OnboardingLayout({
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
      <main className="flex flex-1 items-start justify-center px-6 pt-8 pb-16">
        {children}
      </main>
    </div>
  );
}
