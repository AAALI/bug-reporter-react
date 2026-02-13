import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconBug } from "@tabler/icons-react";
import { ProjectCard } from "./project-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's org (required before parallel fetches)
  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role, organizations(id, name, slug, plan)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    redirect("/onboarding");
  }

  const org = membership.organizations as unknown as {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };

  // Parallel fetch — projects + reports at the same time
  const [{ data: projects }, { data: reportData }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, project_key, platform, is_active, created_at")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("report_events")
      .select(
        "id, title, provider, capture_mode, status, browser_name, os_name, page_url, created_at, project_id"
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Filter reports to only those belonging to this org's projects
  const projectIds = new Set((projects ?? []).map((p) => p.id));
  const reports = (reportData ?? []).filter((r: { project_id: string }) =>
    projectIds.has(r.project_id)
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <IconBug className="size-5 text-primary" />
              QuickBugs
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-700">{org.name}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {org.plan}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Projects
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {projects?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total reports
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {reports.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </p>
            <p className="mt-2 text-3xl font-bold capitalize text-slate-900">
              {membership.role}
            </p>
          </div>
        </div>

        {/* Projects */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">Projects</h2>
          <div className="mt-4 space-y-3">
            {(projects ?? []).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Recent reports */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">Recent reports</h2>
          {reports.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <IconBug className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                No reports yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Send a test report using the API to see it here.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Title
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Provider
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Browser
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {report.title}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {report.provider}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {report.browser_name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            report.status === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(report.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
