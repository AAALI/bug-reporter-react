import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client bypasses RLS for ingestion
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_key, ...reportData } = body;

    if (!project_key) {
      return NextResponse.json(
        { error: "Missing project_key." },
        { status: 400 }
      );
    }

    // Validate project key and check if active
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, is_active, rate_limit_per_min")
      .eq("project_key", project_key)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Invalid project key." },
        { status: 401 }
      );
    }

    if (!project.is_active) {
      return NextResponse.json(
        { error: "Project is inactive." },
        { status: 403 }
      );
    }

    // Basic rate limit check — count events in the last minute
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from("report_events")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id)
      .gte("created_at", oneMinuteAgo);

    if ((count ?? 0) >= project.rate_limit_per_min) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    // Insert the report event
    const { data: event, error: insertError } = await supabase
      .from("report_events")
      .insert({
        project_id: project.id,
        title: reportData.title || "Untitled report",
        provider: reportData.provider || "manual",
        capture_mode: reportData.capture_mode || "screenshot",
        has_screenshot: reportData.has_screenshot ?? false,
        has_video: reportData.has_video ?? false,
        has_network_logs: reportData.has_network_logs ?? false,
        has_console_logs: reportData.has_console_logs ?? false,
        js_error_count: reportData.js_error_count ?? 0,
        external_issue_id: reportData.external_issue_id,
        external_issue_key: reportData.external_issue_key,
        external_issue_url: reportData.external_issue_url,
        user_agent: reportData.user_agent,
        browser_name: reportData.browser_name,
        browser_version: reportData.browser_version,
        os_name: reportData.os_name,
        os_version: reportData.os_version,
        device_type: reportData.device_type,
        screen_resolution: reportData.screen_resolution,
        viewport: reportData.viewport,
        color_scheme: reportData.color_scheme,
        locale: reportData.locale,
        timezone: reportData.timezone,
        connection_type: reportData.connection_type,
        page_url: reportData.page_url,
        app_version: reportData.app_version,
        environment: reportData.environment,
        status: reportData.status || "success",
        error_message: reportData.error_message,
        duration_ms: reportData.duration_ms,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to store report." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: event.id, created_at: event.created_at },
      { status: 201, headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: corsHeaders }
    );
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
