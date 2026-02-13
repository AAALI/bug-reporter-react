import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  return (
    <section id="pricing" className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Badge variant="default" className="mb-6">
          Beta
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">Free during beta</h2>
        <p className="mt-3 text-muted-foreground">
          No credit card required. No report limits. Start free. Upgrade when
          you grow.
        </p>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/login">
              Start Free
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          No seat pricing. No bandwidth surprises.
        </p>
      </div>
    </section>
  );
}
