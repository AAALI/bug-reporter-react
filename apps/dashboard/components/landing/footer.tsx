import Link from "next/link";
import { IconBug } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <IconBug className="size-4 text-primary" />
          <span>QuickBugs © {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
          <Link href="#" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="#" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <Link
            href="https://github.com/AAALI/Quickbugs"
            className="transition-colors hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link href="/status" className="transition-colors hover:text-primary">
            Status
          </Link>
        </nav>
        <p className="text-sm text-slate-400">
          Infrastructure for quality assurance.
        </p>
      </div>
    </footer>
  );
}
