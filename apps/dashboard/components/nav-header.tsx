import Link from "next/link";
import { IconBug } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Log in" },
];

export function NavHeader() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <IconBug className="size-5 text-primary" />
          <span className="text-slate-900">QuickBugs</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90 md:h-9"
            asChild
          >
            <Link href="/signup">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
