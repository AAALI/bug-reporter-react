import { NetworkLogEntry } from "./types";

function resolveMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) {
    return init.method;
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method;
  }

  return "GET";
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (typeof URL !== "undefined" && input instanceof URL) {
    return input.toString();
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.url;
  }

  return String(input);
}

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

export class NetworkLogger {
  private originalFetch: typeof fetch | null = null;
  private logs: NetworkLogEntry[] = [];
  private recording = false;

  start(): void {
    if (this.recording) {
      return;
    }

    if (typeof globalThis.fetch !== "function") {
      throw new Error("Fetch API is unavailable in this environment.");
    }

    this.originalFetch = globalThis.fetch;
    const originalFetch = this.originalFetch;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const started = nowMs();
      const method = resolveMethod(input, init);
      const url = resolveUrl(input);
      const timestamp = new Date().toISOString();

      try {
        const response = await originalFetch.call(globalThis, input, init);

        this.logs.push({
          method,
          url,
          status: response.status,
          durationMs: Math.max(0, Math.round(nowMs() - started)),
          timestamp,
        });

        return response;
      } catch (error) {
        this.logs.push({
          method,
          url,
          status: null,
          durationMs: Math.max(0, Math.round(nowMs() - started)),
          timestamp,
        });

        throw error;
      }
    }) as typeof fetch;

    this.recording = true;
  }

  stop(): NetworkLogEntry[] {
    if (!this.recording) {
      return this.getLogs();
    }

    if (this.originalFetch) {
      globalThis.fetch = this.originalFetch;
    }

    this.originalFetch = null;
    this.recording = false;

    return this.getLogs();
  }

  clear(): void {
    this.logs = [];
  }

  getLogs(): NetworkLogEntry[] {
    return [...this.logs];
  }

  isRecording(): boolean {
    return this.recording;
  }
}
