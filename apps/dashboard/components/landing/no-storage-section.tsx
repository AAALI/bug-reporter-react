import { IconDatabaseOff, IconLayoutKanban, IconSubtask } from "@tabler/icons-react";

export function NoStorageSection() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconDatabaseOff className="size-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            No media storage
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Screenshots and videos go directly to Jira or Linear. QuickBugs
            stores only metadata.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconLayoutKanban className="size-5" />
              <span className="text-sm font-medium">Jira</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconSubtask className="size-5" />
              <span className="text-sm font-medium">Linear</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
