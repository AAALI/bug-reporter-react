import {
  BugReportPayload,
  BugReporterIntegration,
  BugSubmitResult,
  SubmitProgressCallback,
  formatConsoleLogs,
  formatJsErrors,
  formatNetworkLogs,
} from "../types";

export type CloudIntegrationOptions = {
  projectKey: string;
  endpoint?: string;
  fetchImpl?: typeof fetch;
};

const noop: SubmitProgressCallback = () => {};

export class CloudIntegration implements BugReporterIntegration {
  readonly provider = "cloud" as const;

  private projectKey: string;
  private endpoint: string;
  private fetchFn: typeof fetch;

  constructor(options: CloudIntegrationOptions) {
    if (!options.projectKey) {
      throw new Error("CloudIntegration: projectKey is required.");
    }

    this.projectKey = options.projectKey;
    this.endpoint = options.endpoint ?? "/api/ingest";
    this.fetchFn = options.fetchImpl ?? fetch.bind(globalThis);
  }

  async submit(
    payload: BugReportPayload,
    onProgress: SubmitProgressCallback = noop,
  ): Promise<BugSubmitResult> {
    onProgress("Preparing report…");

    // Parse user agent for metadata
    const ua = payload.userAgent || navigator.userAgent;
    const browserName = parseBrowserName(ua);
    const osName = parseOsName(ua);

    // Build the report body
    const body: Record<string, unknown> = {
      project_key: this.projectKey,
      title: payload.title,
      provider: "cloud",
      capture_mode: payload.captureMode,
      has_screenshot: Boolean(payload.screenshotBlob),
      has_video: Boolean(payload.videoBlob),
      has_network_logs: payload.networkLogs.length > 0,
      has_console_logs: payload.consoleLogs.length > 0,
      js_error_count: payload.jsErrors.length,
      user_agent: ua,
      browser_name: browserName,
      os_name: osName,
      device_type: getDeviceType(),
      screen_resolution: getScreenResolution(),
      viewport: getViewport(),
      color_scheme: payload.metadata.colorScheme !== "unknown" ? payload.metadata.colorScheme : null,
      locale: payload.metadata.locale,
      timezone: payload.metadata.timezone,
      connection_type: payload.metadata.connection?.effectiveType ?? null,
      page_url: payload.pageUrl,
      environment: getEnvironment(),
    };

    onProgress("Sending report…");

    const response = await this.fetchFn(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = (errorBody as { error?: string }).error ?? `HTTP ${response.status}`;
      throw new Error(`CloudIntegration: ${message}`);
    }

    const result = (await response.json()) as { id: string; created_at: string };

    onProgress("Report submitted.");

    return {
      provider: "cloud" as BugSubmitResult["provider"],
      issueId: result.id,
      issueKey: `QB-${result.id.slice(0, 8)}`,
      issueUrl: null,
      warnings: [],
    };
  }
}

// Simple UA parsing helpers
function parseBrowserName(ua: string): string {
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  return "Unknown";
}

function parseOsName(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getScreenResolution(): string {
  if (typeof screen === "undefined") return "";
  return `${screen.width}x${screen.height}`;
}

function getViewport(): string {
  if (typeof window === "undefined") return "";
  return `${window.innerWidth}x${window.innerHeight}`;
}

function getEnvironment(): string {
  if (typeof window === "undefined") return "unknown";
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "development";
  if (hostname.includes("staging") || hostname.includes("preview")) return "staging";
  return "production";
}
